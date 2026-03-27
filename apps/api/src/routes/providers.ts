import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";

export function createProvidersRouter(): Router {
  const r = Router();

  r.get("/clinicians", requireAuth, async (req: AuthedRequest, res) => {
    const role = req.userRole!;
    if (
      role !== UserRole.PATIENT &&
      role !== UserRole.CLINICIAN &&
      role !== UserRole.ADMIN
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const clinicians = await prisma.user.findMany({
      where: { role: UserRole.CLINICIAN },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
    res.json({ clinicians });
  });

  return r;
}
