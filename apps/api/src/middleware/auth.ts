import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AppConfig } from "../config.js";
import { prisma } from "../lib/prisma.js";
export interface AuthedRequest extends Request {
    userId?: string;
    userRole?: UserRole;
    /** Set by requireDbRoles after loading the user row (primary + secondary roles). */
    dbUser?: { id: string; role: UserRole; secondaryRole: UserRole | null };
}
const COOKIE = "rw_access";
export function getTokenFromRequest(req: Request): string | undefined {
    const c = req.cookies?.[COOKIE];
    if (typeof c === "string" && c.length > 0)
        return c;
    const h = req.headers.authorization;
    if (h?.startsWith("Bearer "))
        return h.slice(7);
    return undefined;
}
export function authMiddleware(cfg: AppConfig) {
    return async (req: AuthedRequest, res: Response, next: NextFunction) => {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                req.userId = undefined;
                req.userRole = undefined;
                return next();
            }
            const payload = verifyAccessToken(token, cfg.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, role: true, secondaryRole: true },
            });
            if (!user) {
                req.userId = undefined;
                req.userRole = undefined;
                return next();
            }
            const allowed = [user.role, user.secondaryRole].filter((x): x is UserRole => x != null);
            const effective = payload.activeRole;
            if (!allowed.includes(effective)) {
                req.userId = undefined;
                req.userRole = undefined;
                return next();
            }
            req.userId = user.id;
            req.userRole = effective;
            next();
        }
        catch {
            req.userId = undefined;
            req.userRole = undefined;
            next();
        }
    };
}
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
}
export function requireRoles(...roles: UserRole[]) {
    return (req: AuthedRequest, res: Response, next: NextFunction) => {
        if (!req.userId || !req.userRole) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.userRole)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        next();
    };
}
/** Use for capabilities tied to primary/secondary roles (not only JWT activeRole). Requires valid session. */
export function requireDbRoles(...allowed: UserRole[]) {
    return async (req: AuthedRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, role: true, secondaryRole: true },
        });
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const poss = [user.role, user.secondaryRole].filter((x): x is UserRole => x != null);
        if (!allowed.some((a) => poss.includes(a))) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        req.dbUser = user;
        next();
    };
}
export const cookieName = COOKIE;
