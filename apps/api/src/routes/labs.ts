import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";

const uploadSchema = z.object({
  patientId: z.string().min(1),
  testCode: z.string().min(1).max(64),
  testName: z.string().min(1).max(200),
  value: z.string().min(1).max(200),
  unit: z.string().min(1).max(64),
  referenceRange: z.string().max(200).optional(),
  collectedAt: z.string().datetime(),
});

export function createLabsRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, async (req: AuthedRequest, res) => {
    const uid = req.userId!;
    const role = req.userRole!;
    if (role === UserRole.PATIENT) {
      const rows = await prisma.labResult.findMany({
        where: { patientId: uid },
        orderBy: { reportedAt: "desc" },
        include: { uploadedBy: { select: { fullName: true } } },
      });
      res.json({ results: rows });
      return;
    }
    if (role === UserRole.LAB || role === UserRole.ADMIN || role === UserRole.CLINICIAN) {
      const pid = typeof req.query.patientId === "string" ? req.query.patientId : undefined;
      const rows = await prisma.labResult.findMany({
        where: pid ? { patientId: pid } : undefined,
        orderBy: { reportedAt: "desc" },
        take: 200,
        include: {
          patient: { select: { fullName: true, email: true } },
          uploadedBy: { select: { fullName: true } },
        },
      });
      res.json({ results: rows });
      return;
    }
    res.status(403).json({ error: "Forbidden" });
  });

  r.post("/", requireAuth, requireRoles(UserRole.LAB, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const parsed = uploadSchema.safeParse(req.body);
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
    const row = await prisma.labResult.create({
      data: {
        patientId: d.patientId,
        uploadedById: req.userId!,
        testCode: d.testCode,
        testName: d.testName,
        value: d.value,
        unit: d.unit,
        referenceRange: d.referenceRange ?? null,
        collectedAt: new Date(d.collectedAt),
      },
    });
    await audit(req.userId, "LAB_UPLOAD", "LabResult", { id: row.id });
    res.status(201).json({ result: row });
  });

  return r;
}
