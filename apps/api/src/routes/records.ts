import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";

const createSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(8000),
  facilityName: z.string().min(1).max(200),
  visitDate: z.string().datetime(),
});

export function createRecordsRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, async (req: AuthedRequest, res) => {
    const uid = req.userId!;
    const role = req.userRole!;
    if (role === UserRole.PATIENT) {
      const rows = await prisma.healthRecord.findMany({
        where: { patientId: uid },
        orderBy: { visitDate: "desc" },
        include: { author: { select: { fullName: true } } },
      });
      res.json({ records: rows });
      return;
    }
    if (role === UserRole.CLINICIAN || role === UserRole.ADMIN) {
      const q = typeof req.query.patientId === "string" ? req.query.patientId : undefined;
      const rows = await prisma.healthRecord.findMany({
        where: q ? { patientId: q } : undefined,
        orderBy: { visitDate: "desc" },
        take: 200,
        include: {
          patient: { select: { fullName: true, email: true } },
          author: { select: { fullName: true } },
        },
      });
      res.json({ records: rows });
      return;
    }
    res.status(403).json({ error: "Forbidden" });
  });

  r.post("/", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const d = parsed.data;
    const patient = await prisma.user.findFirst({
      where: { id: d.patientId, role: UserRole.PATIENT },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    const rec = await prisma.healthRecord.create({
      data: {
        patientId: d.patientId,
        authorId: req.userId!,
        title: d.title,
        summary: d.summary,
        facilityName: d.facilityName,
        visitDate: new Date(d.visitDate),
      },
    });
    await audit(req.userId, "CREATE_RECORD", "HealthRecord", { id: rec.id });
    res.status(201).json({ record: rec });
  });

  return r;
}
