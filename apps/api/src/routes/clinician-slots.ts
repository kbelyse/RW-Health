import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { whereUserIsClinicianWithId } from "../lib/roleQueries.js";
import { audit } from "../lib/audit.js";
import type { AppConfig } from "../config.js";
import { notifyAppointmentPatientBooked } from "../lib/mail.js";

const facilityField = z
  .string()
  .max(200)
  .optional()
  .transform((s) => (s && s.trim() ? s.trim() : "—"));

const createSchema = z.object({
  facilityName: facilityField,
  title: z.string().min(1).max(200).optional(),
  startAt: z.string().datetime(),
  clinicianId: z.string().optional(),
});

const bookSchema = z.object({
  notes: z.string().max(2000).optional(),
});

const bulkSchema = z.object({
  facilityName: facilityField,
  title: z.string().min(1).max(200).optional(),
  clinicianId: z.string().optional(),
  startAtList: z.array(z.string().datetime()).min(1).max(200),
});

const appointmentInclude = {
  createdBy: { select: { id: true, fullName: true, role: true } },
  clinician: { select: { id: true, fullName: true, email: true } },
} as const;

const appointmentBookInclude = {
  ...appointmentInclude,
  patient: { select: { fullName: true, email: true } },
} as const;

export function createClinicianSlotsRouter(cfg: AppConfig): Router {
  const r = Router();

  r.get("/calendar", requireAuth, async (req: AuthedRequest, res) => {
    const role = req.userRole!;
    const uid = req.userId!;
    const fromQ = typeof req.query.from === "string" ? req.query.from : "";
    const toQ = typeof req.query.to === "string" ? req.query.to : "";
    const cidParam = typeof req.query.clinicianId === "string" ? req.query.clinicianId.trim() : "";
    const from = new Date(fromQ);
    const to = new Date(toQ);
    if (!fromQ || !toQ || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      res.status(400).json({ error: "Invalid from/to" });
      return;
    }
    const now = new Date();
    const slotLower = from.getTime() > now.getTime() ? from : now;
    const busyRangeEnd = new Date(Math.max(to.getTime(), now.getTime() + 180 * 24 * 60 * 60 * 1000));

    if (role === UserRole.PATIENT) {
      const openWhere: { clinicianId?: string; startAt: { gte: Date } } = {
        startAt: { gte: slotLower },
      };
      if (cidParam) {
        openWhere.clinicianId = cidParam;
      }
      const openSlots = await prisma.clinicianSlot.findMany({
        where: openWhere,
        include: { clinician: { select: { id: true, fullName: true, email: true } } },
        orderBy: { startAt: "asc" },
        take: 500,
      });

      const unavailableBlocks: { startAt: string }[] = [];
      let myVisits: { appointmentId: string; startAt: string }[] = [];

      if (cidParam) {
        const apps = await prisma.appointment.findMany({
          where: {
            clinicianId: cidParam,
            scheduledAt: { gte: from, lte: busyRangeEnd },
            status: { in: ["SCHEDULED", "REQUESTED"] },
          },
          select: { id: true, scheduledAt: true, patientId: true },
        });
        for (const a of apps) {
          const iso = a.scheduledAt.toISOString();
          if (a.patientId === uid) {
            myVisits.push({ appointmentId: a.id, startAt: iso });
          } else {
            unavailableBlocks.push({ startAt: iso });
          }
        }
      } else {
        const mineApps = await prisma.appointment.findMany({
          where: {
            patientId: uid,
            scheduledAt: { gte: from, lte: busyRangeEnd },
            status: { in: ["SCHEDULED", "REQUESTED"] },
          },
          select: { id: true, scheduledAt: true },
        });
        myVisits = mineApps.map((a) => ({
          appointmentId: a.id,
          startAt: a.scheduledAt.toISOString(),
        }));
      }

      res.json({ openSlots, unavailableBlocks, myVisits });
      return;
    }

    if (role === UserRole.CLINICIAN || role === UserRole.ADMIN) {
      let targetCid: string;
      if (role === UserRole.CLINICIAN) {
        targetCid = uid;
      } else {
        if (!cidParam) {
          res.status(400).json({ error: "clinicianId required" });
          return;
        }
        const doc = await prisma.user.findFirst({ where: whereUserIsClinicianWithId(cidParam) });
        if (!doc) {
          res.status(400).json({ error: "Invalid clinician" });
          return;
        }
        targetCid = doc.id;
      }

      const openSlots = await prisma.clinicianSlot.findMany({
        where: { clinicianId: targetCid, startAt: { gte: slotLower } },
        include: { clinician: { select: { id: true, fullName: true, email: true } } },
        orderBy: { startAt: "asc" },
        take: 500,
      });

      const apps = await prisma.appointment.findMany({
        where: {
          clinicianId: targetCid,
          scheduledAt: { gte: from, lte: busyRangeEnd },
          status: { in: ["SCHEDULED", "REQUESTED"] },
        },
        select: {
          id: true,
          scheduledAt: true,
          title: true,
          facilityName: true,
          notes: true,
          status: true,
          patientId: true,
          patient: { select: { fullName: true } },
          clinician: { select: { fullName: true } },
        },
        orderBy: { scheduledAt: "asc" },
      });

      const staffBookings = apps.map((a) => ({
        appointmentId: a.id,
        startAt: a.scheduledAt.toISOString(),
        patientId: a.patientId,
        patientName: a.patient.fullName,
        title: a.title,
        facilityName: a.facilityName,
        notes: a.notes,
        status: a.status,
        clinicianName: a.clinician?.fullName ?? "",
      }));

      res.json({ openSlots, staffBookings });
      return;
    }

    res.status(403).json({ error: "Forbidden" });
  });

  r.get("/", requireAuth, async (req: AuthedRequest, res) => {
    const role = req.userRole!;
    const uid = req.userId!;
    if (role === UserRole.PATIENT) {
      const cid = typeof req.query.clinicianId === "string" ? req.query.clinicianId.trim() : undefined;
      const rows = await prisma.clinicianSlot.findMany({
        where: {
          startAt: { gte: new Date() },
          ...(cid ? { clinicianId: cid } : {}),
        },
        include: { clinician: { select: { id: true, fullName: true, email: true } } },
        orderBy: { startAt: "asc" },
        take: 500,
      });
      res.json({ slots: rows });
      return;
    }
    if (role === UserRole.CLINICIAN) {
      const rows = await prisma.clinicianSlot.findMany({
        where: { clinicianId: uid },
        orderBy: { startAt: "asc" },
        take: 500,
      });
      res.json({ slots: rows });
      return;
    }
    if (role === UserRole.ADMIN) {
      const rows = await prisma.clinicianSlot.findMany({
        orderBy: { startAt: "desc" },
        take: 500,
        include: { clinician: { select: { id: true, fullName: true } } },
      });
      res.json({ slots: rows });
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
    const role = req.userRole!;
    const uid = req.userId!;
    const d = parsed.data;
    let clinicianId = uid;
    if (role === UserRole.ADMIN) {
      if (!d.clinicianId?.trim()) {
        res.status(400).json({ error: "Choose a clinician" });
        return;
      }
      const doc = await prisma.user.findFirst({ where: whereUserIsClinicianWithId(d.clinicianId) });
      if (!doc) {
        res.status(400).json({ error: "Invalid clinician" });
        return;
      }
      clinicianId = doc.id;
    }
    const startAt = new Date(d.startAt);
    const minuteStart = new Date(startAt);
    minuteStart.setSeconds(0, 0);
    const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);

    const clashA = await prisma.appointment.findFirst({
      where: { clinicianId, scheduledAt: { gte: minuteStart, lt: minuteEnd } },
    });
    const clashS = await prisma.clinicianSlot.findFirst({
      where: { clinicianId, startAt: { gte: minuteStart, lt: minuteEnd } },
    });
    if (clashA || clashS) {
      res.status(409).json({ error: "That time is already taken for this clinician." });
      return;
    }

    const slot = await prisma.clinicianSlot.create({
      data: {
        clinicianId,
        facilityName: d.facilityName,
        title: d.title ?? "Visit",
        startAt,
      },
    });
    await audit(uid, "CREATE_OPEN_SLOT", "ClinicianSlot", { id: slot.id });
    res.status(201).json({ slot });
  });

  r.post("/bulk", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const parsed = bulkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const role = req.userRole!;
    const uid = req.userId!;
    const d = parsed.data;
    let clinicianId = uid;
    if (role === UserRole.ADMIN) {
      if (!d.clinicianId?.trim()) {
        res.status(400).json({ error: "Choose a clinician" });
        return;
      }
      const doc = await prisma.user.findFirst({ where: whereUserIsClinicianWithId(d.clinicianId) });
      if (!doc) {
        res.status(400).json({ error: "Invalid clinician" });
        return;
      }
      clinicianId = doc.id;
    }
    const now = new Date();
    const seenMinutes = new Set<string>();
    const sorted = [...d.startAtList]
      .map((iso) => new Date(iso))
      .filter((dt) => !Number.isNaN(dt.getTime()) && dt >= now)
      .sort((a, b) => a.getTime() - b.getTime());

    let created = 0;
    let skipped = 0;

    for (const startAt of sorted) {
      const minuteStart = new Date(startAt);
      minuteStart.setSeconds(0, 0);
      const key = `${clinicianId}:${minuteStart.getTime()}`;
      if (seenMinutes.has(key)) {
        skipped++;
        continue;
      }
      seenMinutes.add(key);

      const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
      const clashA = await prisma.appointment.findFirst({
        where: { clinicianId, scheduledAt: { gte: minuteStart, lt: minuteEnd } },
      });
      const clashS = await prisma.clinicianSlot.findFirst({
        where: { clinicianId, startAt: { gte: minuteStart, lt: minuteEnd } },
      });
      if (clashA || clashS) {
        skipped++;
        continue;
      }
      await prisma.clinicianSlot.create({
        data: {
          clinicianId,
          facilityName: d.facilityName,
          title: d.title ?? "Visit",
          startAt,
        },
      });
      created++;
    }

    await audit(uid, "BULK_CREATE_OPEN_SLOTS", "ClinicianSlot", { clinicianId, created, skipped });
    res.status(201).json({ created, skipped, requested: sorted.length });
  });

  r.post("/:id/book", requireAuth, async (req: AuthedRequest, res) => {
    if (req.userRole !== UserRole.PATIENT) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const slotId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    if (!slotId) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = bookSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const slot = await prisma.clinicianSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.startAt < new Date()) {
      res.status(404).json({ error: "Slot not available" });
      return;
    }
    const uid = req.userId!;
    const minuteStart = new Date(slot.startAt);
    minuteStart.setSeconds(0, 0);
    const minuteEnd = new Date(minuteStart.getTime() + 60 * 1000);
    const clash = await prisma.appointment.findFirst({
      where: {
        clinicianId: slot.clinicianId,
        scheduledAt: { gte: minuteStart, lt: minuteEnd },
      },
    });
    if (clash) {
      res.status(409).json({ error: "This slot was just booked. Pick another." });
      return;
    }

    const ap = await prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({
        data: {
          patientId: uid,
          createdById: uid,
          clinicianId: slot.clinicianId,
          title: slot.title,
          facilityName: slot.facilityName,
          scheduledAt: slot.startAt,
          notes: parsed.data.notes ?? null,
          status: "SCHEDULED",
        },
        include: appointmentBookInclude,
      });
      await tx.clinicianSlot.delete({ where: { id: slot.id } });
      return created;
    });

    await audit(uid, "BOOK_SLOT", "Appointment", { id: ap.id });
    void notifyAppointmentPatientBooked(cfg, {
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
  });

  r.delete("/:id", requireAuth, requireRoles(UserRole.CLINICIAN, UserRole.ADMIN), async (req: AuthedRequest, res) => {
    const slotId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    if (!slotId) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const slot = await prisma.clinicianSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const role = req.userRole!;
    if (role === UserRole.CLINICIAN && slot.clinicianId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.clinicianSlot.delete({ where: { id: slotId } });
    await audit(req.userId, "DELETE_OPEN_SLOT", "ClinicianSlot", { id: slotId });
    res.json({ ok: true });
  });

  return r;
}
