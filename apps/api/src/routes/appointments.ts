import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";

const clinicianCreateSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1).max(200),
  facilityName: z.string().min(1).max(200),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  clinicianId: z.string().optional(),
});

const patientSelfSchema = z.object({
  title: z.string().min(1).max(200),
  facilityName: z.string().min(1).max(200),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  clinicianId: z.string().optional(),
});

const appointmentInclude = {
  createdBy: { select: { id: true, fullName: true, role: true } },
  clinician: { select: { id: true, fullName: true, email: true } },
} as const;

export function createAppointmentsRouter(): Router {
  const r = Router();

  r.get("/", requireAuth, async (req: AuthedRequest, res) => {
    const uid = req.userId!;
    const role = req.userRole!;
    if (role === UserRole.PATIENT) {
      const rows = await prisma.appointment.findMany({
        where: { patientId: uid },
        orderBy: { scheduledAt: "asc" },
        include: appointmentInclude,
      });
      res.json({ appointments: rows });
      return;
    }
    if (role === UserRole.CLINICIAN || role === UserRole.ADMIN) {
      const pid = typeof req.query.patientId === "string" ? req.query.patientId : undefined;
      const rows = await prisma.appointment.findMany({
        where: pid ? { patientId: pid } : undefined,
        orderBy: { scheduledAt: "desc" },
        take: 200,
        include: {
          ...appointmentInclude,
          patient: { select: { fullName: true, email: true } },
        },
      });
      res.json({ appointments: rows });
      return;
    }
    res.status(403).json({ error: "Forbidden" });
  });

  r.post("/", requireAuth, async (req: AuthedRequest, res) => {
    const role = req.userRole!;
    const uid = req.userId!;

    if (role === UserRole.PATIENT) {
      const parsed = patientSelfSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      const d = parsed.data;
      let clinicianId: string | null = null;
      if (d.clinicianId) {
        const doc = await prisma.user.findFirst({
          where: { id: d.clinicianId, role: UserRole.CLINICIAN },
        });
        if (!doc) {
          res.status(400).json({ error: "Invalid clinician" });
          return;
        }
        clinicianId = doc.id;
      }
      const ap = await prisma.appointment.create({
        data: {
          patientId: uid,
          createdById: uid,
          clinicianId,
          title: d.title,
          facilityName: d.facilityName,
          scheduledAt: new Date(d.scheduledAt),
          notes: d.notes ?? null,
          status: "REQUESTED",
        },
        include: appointmentInclude,
      });
      await audit(uid, "PATIENT_SCHEDULE_APPOINTMENT", "Appointment", { id: ap.id });
      res.status(201).json({ appointment: ap });
      return;
    }

    if (role === UserRole.CLINICIAN || role === UserRole.ADMIN) {
      const parsed = clinicianCreateSchema.safeParse(req.body);
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
      let clinicianId: string | null = null;
      if (d.clinicianId) {
        const doc = await prisma.user.findFirst({
          where: { id: d.clinicianId, role: UserRole.CLINICIAN },
        });
        if (doc) clinicianId = doc.id;
      } else if (role === UserRole.CLINICIAN) {
        clinicianId = uid;
      }
      const ap = await prisma.appointment.create({
        data: {
          patientId: d.patientId,
          createdById: uid,
          clinicianId,
          title: d.title,
          facilityName: d.facilityName,
          scheduledAt: new Date(d.scheduledAt),
          notes: d.notes ?? null,
          status: "SCHEDULED",
        },
        include: appointmentInclude,
      });
      await audit(uid, "CREATE_APPOINTMENT", "Appointment", { id: ap.id });
      res.status(201).json({ appointment: ap });
      return;
    }

    res.status(403).json({ error: "Forbidden" });
  });

  return r;
}
