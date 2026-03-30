import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";
import { whereUserIsClinicianWithId, whereUserIsPatientWithId } from "../lib/roleQueries.js";
import type { AppConfig } from "../config.js";
import { notifyAppointmentStaffScheduled } from "../lib/mail.js";

const apptFacility = z
  .string()
  .max(200)
  .optional()
  .transform((s) => (s && s.trim() ? s.trim() : "—"));

const clinicianCreateSchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1).max(200),
  facilityName: apptFacility,
  scheduledAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  clinicianId: z.string().optional(),
});

const appointmentInclude = {
  createdBy: { select: { id: true, fullName: true, role: true } },
  clinician: { select: { id: true, fullName: true, email: true } },
} as const;

const appointmentCreateInclude = {
  ...appointmentInclude,
  patient: { select: { fullName: true, email: true } },
} as const;

const patchAppointmentSchema = z.object({
  notes: z.string().max(2000).optional(),
  title: z.string().min(1).max(200).optional(),
});

export function createAppointmentsRouter(cfg: AppConfig): Router {
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
      res.status(403).json({
        error: "Patients book published slots only. Use POST /api/clinician-slots/:id/book.",
      });
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
        where: whereUserIsPatientWithId(d.patientId),
      });
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }
      let clinicianId: string | null = null;
      if (d.clinicianId) {
        const doc = await prisma.user.findFirst({
          where: whereUserIsClinicianWithId(d.clinicianId),
        });
        if (doc) clinicianId = doc.id;
      } else if (role === UserRole.CLINICIAN) {
        clinicianId = uid;
      }
      const scheduledAt = new Date(d.scheduledAt);
      if (clinicianId) {
        const minuteStart = new Date(scheduledAt);
        minuteStart.setSeconds(0, 0);
        const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
        const clash = await prisma.appointment.findFirst({
          where: {
            clinicianId,
            scheduledAt: { gte: minuteStart, lt: minuteEnd },
          },
        });
        if (clash) {
          res.status(409).json({
            error: "That time slot is already booked for this clinician. Pick another time.",
          });
          return;
        }
      }
      const ap = await prisma.appointment.create({
        data: {
          patientId: d.patientId,
          createdById: uid,
          clinicianId,
          title: d.title,
          facilityName: d.facilityName,
          scheduledAt,
          notes: d.notes ?? null,
          status: "SCHEDULED",
        },
        include: appointmentCreateInclude,
      });
      await audit(uid, "CREATE_APPOINTMENT", "Appointment", { id: ap.id });
      void notifyAppointmentStaffScheduled(cfg, {
        patientEmail: ap.patient.email,
        patientName: ap.patient.fullName,
        clinicianEmail: ap.clinician?.email,
        clinicianName: ap.clinician?.fullName,
        title: ap.title,
        facilityName: ap.facilityName,
        scheduledAt: ap.scheduledAt,
        notes: ap.notes,
      });
      res.status(201).json({ appointment: ap });
      return;
    }

    res.status(403).json({ error: "Forbidden" });
  });

  r.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
    const role = req.userRole!;
    const uid = req.userId!;
    if (role !== UserRole.CLINICIAN && role !== UserRole.ADMIN) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = typeof req.params.id === "string" ? req.params.id : "";
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = patchAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (role === UserRole.CLINICIAN && existing.clinicianId !== uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const data: { notes?: string | null; title?: string } = {};
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        ...appointmentInclude,
        patient: { select: { fullName: true, email: true } },
      },
    });
    await audit(uid, "PATCH_APPOINTMENT", "Appointment", { id });
    res.json({ appointment: updated });
  });

  return r;
}
