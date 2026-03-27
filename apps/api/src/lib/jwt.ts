import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(
  payload: JwtPayload,
  secret: string,
  expiresSeconds: number = 8 * 60 * 60
): string {
  const opts: SignOptions = { expiresIn: expiresSeconds };
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    secret,
    opts
  );
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) throw new Error("Invalid token");
  const d = decoded as Record<string, unknown>;
  if (typeof d.sub !== "string" || typeof d.email !== "string" || typeof d.role !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: d.sub, email: d.email, role: d.role as UserRole };
}
