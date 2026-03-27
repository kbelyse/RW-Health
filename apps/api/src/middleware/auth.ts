import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AppConfig } from "../config.js";
import { prisma } from "../lib/prisma.js";

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

const COOKIE = "rw_access";

export function getTokenFromRequest(req: Request): string | undefined {
  const c = req.cookies?.[COOKIE];
  if (typeof c === "string" && c.length > 0) return c;
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) return h.slice(7);
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
        select: { id: true, role: true },
      });
      if (!user) {
        req.userId = undefined;
        req.userRole = undefined;
        return next();
      }
      req.userId = user.id;
      req.userRole = user.role;
      next();
    } catch {
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

export const cookieName = COOKIE;
