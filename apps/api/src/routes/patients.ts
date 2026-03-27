import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";

export function createPatientsRouter(): Router {
  const r = Router();

  r.get("/search", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.LAB, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2) {
      res.json({ patients: [] });
      return;
    }
    const patients = await prisma.user.findMany({
      where: {
        role: UserRole.PATIENT,
        OR: [{ email: { contains: q.toLowerCase() } }, { fullName: { contains: q } }],
      },
      take: 20,
      select: { id: true, email: true, fullName: true },
    });
    res.json({ patients });
  });

  return r;
}
