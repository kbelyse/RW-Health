import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { whereUserHasClinicianCapability } from "../lib/roleQueries.js";

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
      where: whereUserHasClinicianCapability,
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
    res.json({ clinicians });
  });

  return r;
}
