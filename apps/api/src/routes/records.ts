import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";
import { whereUserIsPatientWithId } from "../lib/roleQueries.js";
import type { AppConfig } from "../config.js";
import { notifyHealthRecordAdded } from "../lib/mail.js";

const createSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(8000),
  facilityName: z.string().min(1).max(200),
  visitDate: z.string().datetime(),
});

const patchRecordSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(8000).optional(),
  facilityName: z.string().min(1).max(200).optional(),
  visitDate: z.string().datetime().optional(),
});

export function createRecordsRouter(cfg: AppConfig): Router {
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
      where: whereUserIsPatientWithId(d.patientId),
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    if (req.userRole === UserRole.CLINICIAN) {
      const pastVisit = await prisma.appointment.findFirst({
        where: {
          patientId: d.patientId,
          clinicianId: req.userId!,
          scheduledAt: { lte: new Date() },
        },
      });
      if (!pastVisit) {
        res.status(400).json({
          error:
            "You can add a visit note only after a scheduled visit with this patient has started (visit time in the past).",
        });
        return;
      }
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

  r.patch("/:id", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = patchRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const existing = await prisma.healthRecord.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (existing.publishedAt) {
      res.status(403).json({ error: "This visit note is published and locked." });
      return;
    }
    const uid = req.userId!;
    const role = req.userRole!;
    const isAuthor = existing.authorId === uid;
    const isAdmin = role === UserRole.ADMIN;
    if (!isAuthor && !isAdmin) {
      res.status(403).json({ error: "You can only edit visit notes you created." });
      return;
    }
    const data: {
      title?: string;
      summary?: string;
      facilityName?: string;
      visitDate?: Date;
    } = {};
    const p = parsed.data;
    if (p.title !== undefined) data.title = p.title;
    if (p.summary !== undefined) data.summary = p.summary;
    if (p.facilityName !== undefined) data.facilityName = p.facilityName;
    if (p.visitDate !== undefined) data.visitDate = new Date(p.visitDate);
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }
    const updated = await prisma.healthRecord.update({
      where: { id },
      data,
      include: { author: { select: { fullName: true } } },
    });
    await audit(uid, "PATCH_RECORD", "HealthRecord", { id });
    res.json({ record: updated });
  });

  r.post("/:id/publish", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const existing = await prisma.healthRecord.findUnique({
      where: { id },
      include: { patient: { select: { email: true, fullName: true } } },
    });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (existing.publishedAt) {
      res.status(400).json({ error: "Already published" });
      return;
    }
    const uid = req.userId!;
    const role = req.userRole!;
    const isAuthor = existing.authorId === uid;
    const isAdmin = role === UserRole.ADMIN;
    if (!isAuthor && !isAdmin) {
      res.status(403).json({ error: "Only the author can publish this visit note." });
      return;
    }
    const updated = await prisma.healthRecord.update({
      where: { id },
      data: { publishedAt: new Date() },
      include: { author: { select: { fullName: true } } },
    });
    await audit(uid, "PUBLISH_RECORD", "HealthRecord", { id });
    void notifyHealthRecordAdded(cfg, {
      patientEmail: existing.patient.email,
      patientName: existing.patient.fullName,
      title: updated.title,
      facilityName: updated.facilityName,
    });
    res.json({ record: updated });
  });

  return r;
}
