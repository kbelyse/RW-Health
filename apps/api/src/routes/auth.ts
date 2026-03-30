import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, verifyAccessToken } from "../lib/jwt.js";
import type { AppConfig } from "../config.js";
import { cookieName, getTokenFromRequest, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../lib/mail.js";
import { audit } from "../lib/audit.js";
const registerSchema = z.object({
    email: z.string().email().max(320),
    password: z.string().min(10).max(128),
    fullName: z.string().min(2).max(120),
    role: z.nativeEnum(UserRole).optional(),
    secondaryRole: z.nativeEnum(UserRole).optional(),
});
const switchRoleSchema = z.object({
    activeRole: z.nativeEnum(UserRole),
});
function isAllowedSecondaryPair(a: UserRole, b: UserRole): boolean {
    if (a === b)
        return false;
    const s = new Set([a, b]);
    if (s.has(UserRole.PATIENT) && s.has(UserRole.CLINICIAN))
        return true;
    if (s.has(UserRole.PATIENT) && s.has(UserRole.LAB))
        return true;
    return false;
}
function normalizeUserResponse(user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    secondaryRole: UserRole | null;
}, activeRole: UserRole) {
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        primaryRole: user.role,
        secondaryRole: user.secondaryRole,
        role: activeRole,
    };
}
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const forgotSchema = z.object({
    email: z.string().email(),
});
const resetSchema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(64),
    newPassword: z.string().min(10).max(128),
});
export function createAuthRouter(cfg: AppConfig): Router {
    const r = Router();
    r.post("/register", async (req, res) => {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const { email, password, fullName } = parsed.data;
        const role = parsed.data.role ?? UserRole.PATIENT;
        const secondaryRole = parsed.data.secondaryRole;
        if (role === UserRole.ADMIN) {
            res.status(403).json({ error: "Cannot self-register as admin" });
            return;
        }
        if (secondaryRole != null) {
            if (secondaryRole === UserRole.ADMIN) {
                res.status(400).json({ error: "Invalid role combination" });
                return;
            }
            if (!isAllowedSecondaryPair(role, secondaryRole)) {
                res.status(400).json({
                    error: "Secondary role is only allowed for patient + clinician or patient + laboratory pairs",
                });
                return;
            }
        }
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                fullName,
                role,
                secondaryRole: secondaryRole ?? null,
            },
            select: { id: true, email: true, fullName: true, role: true, secondaryRole: true },
        });
        const token = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            secondaryRole: user.secondaryRole ?? undefined,
            activeRole: user.role,
        }, cfg.JWT_SECRET);
        res.cookie(cookieName, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: cfg.COOKIE_SECURE === true,
            maxAge: 8 * 60 * 60 * 1000,
            path: "/",
        });
        await sendWelcomeEmail(cfg, user.email, user.fullName);
        await audit(user.id, "REGISTER", "User", { email: user.email });
        res.json({
            user: { ...normalizeUserResponse(user, user.role), emailVerified: false },
        });
    });
    r.post("/login", async (req, res) => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            secondaryRole: user.secondaryRole ?? undefined,
            activeRole: user.role,
        }, cfg.JWT_SECRET);
        res.cookie(cookieName, token, {
            httpOnly: true,
            sameSite: "lax",
            secure: cfg.COOKIE_SECURE === true,
            maxAge: 8 * 60 * 60 * 1000,
            path: "/",
        });
        await audit(user.id, "LOGIN", "User");
        res.json({
            user: {
                ...normalizeUserResponse({
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    secondaryRole: user.secondaryRole,
                }, user.role),
                emailVerified: user.emailVerified,
            },
        });
    });
    r.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
        res.clearCookie(cookieName, { path: "/" });
        await audit(req.userId, "LOGOUT", "User");
        res.json({ ok: true });
    });
    r.get("/me", async (req: AuthedRequest, res) => {
        if (!req.userId) {
            res.json({ user: null });
            return;
        }
        const token = getTokenFromRequest(req);
        if (!token) {
            res.json({ user: null });
            return;
        }
        let activeRole: UserRole;
        try {
            const payload = verifyAccessToken(token, cfg.JWT_SECRET);
            activeRole = payload.activeRole;
        }
        catch {
            res.json({ user: null });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, fullName: true, role: true, secondaryRole: true, emailVerified: true },
        });
        if (!user) {
            res.json({ user: null });
            return;
        }
        res.json({
            user: { ...normalizeUserResponse(user, activeRole), emailVerified: user.emailVerified },
        });
    });
    r.post("/switch-role", requireAuth, async (req: AuthedRequest, res) => {
        const parsed = switchRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const token = getTokenFromRequest(req);
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const dbUser = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: { id: true, email: true, fullName: true, role: true, secondaryRole: true, emailVerified: true },
        });
        if (!dbUser) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const target = parsed.data.activeRole;
        const allowed = [dbUser.role, dbUser.secondaryRole].filter((x): x is UserRole => x != null);
        if (!allowed.includes(target)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        const newToken = signAccessToken({
            sub: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            secondaryRole: dbUser.secondaryRole ?? undefined,
            activeRole: target,
        }, cfg.JWT_SECRET);
        res.cookie(cookieName, newToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: cfg.COOKIE_SECURE === true,
            maxAge: 8 * 60 * 60 * 1000,
            path: "/",
        });
        await audit(dbUser.id, "SWITCH_ROLE", "User", { activeRole: target });
        res.json({
            user: { ...normalizeUserResponse(dbUser, target), emailVerified: dbUser.emailVerified },
        });
    });
    r.post("/forgot-password", async (req, res) => {
        const parsed = forgotSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.json({ ok: true });
            return;
        }
        const code = crypto.randomBytes(4).toString("hex");
        const hash = await bcrypt.hash(code, 10);
        const exp = new Date(Date.now() + 30 * 60 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken: hash, resetExpires: exp },
        });
        await sendPasswordResetEmail(cfg, user.email, user.fullName, code);
        await audit(user.id, "PASSWORD_RESET_REQUEST", "User");
        res.json({ ok: true });
    });
    r.post("/reset-password", async (req, res) => {
        const parsed = resetSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.resetToken || !user.resetExpires) {
            res.status(400).json({ error: "Invalid or expired code" });
            return;
        }
        if (user.resetExpires < new Date()) {
            res.status(400).json({ error: "Invalid or expired code" });
            return;
        }
        const match = await bcrypt.compare(parsed.data.code, user.resetToken);
        if (!match) {
            res.status(400).json({ error: "Invalid or expired code" });
            return;
        }
        const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetExpires: null,
            },
        });
        await audit(user.id, "PASSWORD_RESET_COMPLETE", "User");
        res.json({ ok: true });
    });
    return r;
}
