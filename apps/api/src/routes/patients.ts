import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { whereUserHasPatientCapability } from "../lib/roleQueries.js";

export function createPatientsRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.LAB, UserRole.ADMIN), async (_req: AuthedRequest, res) => {
    const patients = await prisma.user.findMany({
      where: whereUserHasPatientCapability,
      orderBy: { fullName: "asc" },
      take: 2000,
      select: { id: true, email: true, fullName: true },
    });
    res.json({ patients });
  });

  r.get("/search", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.LAB, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2) {
      res.json({ patients: [] });
      return;
    }
    const patients = await prisma.user.findMany({
      where: {
        AND: [
          whereUserHasPatientCapability,
          { OR: [{ email: { contains: q.toLowerCase() } }, { fullName: { contains: q } }] },
        ],
      },
      take: 20,
      select: { id: true, email: true, fullName: true },
    });
    res.json({ patients });
  });

  r.get("/:id", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.LAB, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const patient = await prisma.user.findFirst({
      where: { AND: [{ id }, whereUserHasPatientCapability] },
      select: { id: true, email: true, fullName: true },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json({ patient });
  });

  return r;
}
