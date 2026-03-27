import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/jwt.js";
import type { AppConfig } from "../config.js";
import { cookieName, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../lib/mail.js";
import { audit } from "../lib/audit.js";

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(10).max(128),
  fullName: z.string().min(2).max(120),
  role: z.nativeEnum(UserRole).optional(),
});

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
    if (role === UserRole.ADMIN) {
      res.status(403).json({ error: "Cannot self-register as admin" });
      return;
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
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
    const token = signAccessToken(
      { sub: user.id, email: user.email, role: user.role },
      cfg.JWT_SECRET
    );
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
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
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
    const token = signAccessToken(
      { sub: user.id, email: user.email, role: user.role },
      cfg.JWT_SECRET
    );
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
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
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
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, fullName: true, role: true, emailVerified: true },
    });
    res.json({ user });
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
