import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    secondaryRole?: UserRole;
    activeRole: UserRole;
}
export function signAccessToken(payload: Omit<JwtPayload, "activeRole"> & {
    activeRole?: UserRole;
}, secret: string, expiresSeconds: number = 24 * 60 * 60): string {
    const opts: SignOptions = { expiresIn: expiresSeconds };
    const activeRole = payload.activeRole ?? payload.role;
    return jwt.sign({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        ...(payload.secondaryRole != null ? { secondaryRole: payload.secondaryRole } : {}),
        activeRole,
    }, secret, opts);
}
export function verifyAccessToken(token: string, secret: string): JwtPayload {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null)
        throw new Error("Invalid token");
    const d = decoded as Record<string, unknown>;
    if (typeof d.sub !== "string" || typeof d.email !== "string" || typeof d.role !== "string") {
        throw new Error("Invalid token payload");
    }
    const primary = d.role as UserRole;
    const secondary = typeof d.secondaryRole === "string" ? (d.secondaryRole as UserRole) : undefined;
    const activeRole = (typeof d.activeRole === "string" ? d.activeRole : primary) as UserRole;
    return {
        sub: d.sub,
        email: d.email,
        role: primary,
        secondaryRole: secondary,
        activeRole,
    };
}
