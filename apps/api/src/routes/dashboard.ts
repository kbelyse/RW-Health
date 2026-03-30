import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { whereUserHasClinicianCapability, whereUserHasPatientCapability } from "../lib/roleQueries.js";
export function createDashboardRouter(): Router {
    const r = Router();
    r.get("/overview", requireAuth, async (req: AuthedRequest, res) => {
        const uid = req.userId!;
        const role = req.userRole!;
        if (role === UserRole.PATIENT) {
            const now = new Date();
            const [healthRecords, labResults, appointments, cliniciansOnPlatform, appointmentsRequested, appointmentsScheduled, upcomingAppointments,] = await Promise.all([
                prisma.healthRecord.count({ where: { patientId: uid } }),
                prisma.labResult.count({ where: { patientId: uid } }),
                prisma.appointment.count({ where: { patientId: uid } }),
                prisma.user.count({ where: whereUserHasClinicianCapability }),
                prisma.appointment.count({ where: { patientId: uid, status: "REQUESTED" } }),
                prisma.appointment.count({ where: { patientId: uid, status: "SCHEDULED" } }),
                prisma.appointment.count({
                    where: {
                        patientId: uid,
                        status: "SCHEDULED",
                        scheduledAt: { gte: now },
                    },
                }),
            ]);
            res.json({
                patient: {
                    healthRecords,
                    labResults,
                    appointments,
                    cliniciansOnPlatform,
                    appointmentsRequested,
                    appointmentsScheduled,
                    upcomingAppointments,
                },
            });
            return;
        }
        if (role === UserRole.CLINICIAN) {
            const now = new Date();
            const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const [visitNotesLogged, appointmentsAsClinician, upcomingScheduled, pendingRequestsForYou, patientsOnPlatform, labResultsInSystem,] = await Promise.all([
                prisma.healthRecord.count({ where: { authorId: uid } }),
                prisma.appointment.count({ where: { clinicianId: uid } }),
                prisma.appointment.count({
                    where: {
                        clinicianId: uid,
                        status: "SCHEDULED",
                        scheduledAt: { gte: now, lte: weekEnd },
                    },
                }),
                prisma.appointment.count({
                    where: {
                        clinicianId: uid,
                        status: "REQUESTED",
                    },
                }),
                prisma.user.count({ where: whereUserHasPatientCapability }),
                prisma.labResult.count(),
            ]);
            res.json({
                clinician: {
                    visitNotesLogged,
                    appointmentsAsClinician,
                    upcomingScheduledNext7Days: upcomingScheduled,
                    pendingPatientRequests: pendingRequestsForYou,
                    patientsOnPlatform,
                    labResultsInSystem,
                },
            });
            return;
        }
        if (role === UserRole.LAB) {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const [resultsUploadedByYou, totalLabResults, uploadsLast7Days, distinctPatientsServed, patientsOnPlatform, appointmentsInSystem, labAccountsOnPlatform,] = await Promise.all([
                prisma.labResult.count({ where: { uploadedById: uid } }),
                prisma.labResult.count(),
                prisma.labResult.count({
                    where: { uploadedById: uid, reportedAt: { gte: weekAgo } },
                }),
                prisma.labResult
                    .groupBy({
                    by: ["patientId"],
                    where: { uploadedById: uid },
                })
                    .then((rows) => rows.length),
                prisma.user.count({ where: whereUserHasPatientCapability }),
                prisma.appointment.count(),
                prisma.user.count({ where: { role: UserRole.LAB } }),
            ]);
            res.json({
                lab: {
                    resultsUploadedByYou,
                    totalLabResultsInSystem: totalLabResults,
                    uploadsLast7Days,
                    distinctPatientsServed,
                    patientsOnPlatform,
                    appointmentsInSystem,
                    labAccountsOnPlatform,
                },
            });
            return;
        }
        if (role === UserRole.ADMIN) {
            const [totalUsers, totalHealthRecords, totalLabResults, totalAppointments, auditEventsLast7Days, usersByRole] = await Promise.all([
                prisma.user.count(),
                prisma.healthRecord.count(),
                prisma.labResult.count(),
                prisma.appointment.count(),
                prisma.auditLog.count({
                    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                }),
                prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
            ]);
            res.json({
                admin: {
                    totalUsers,
                    totalHealthRecords,
                    totalLabResults,
                    totalAppointments,
                    auditEventsLast7Days,
                    usersByRole,
                },
            });
            return;
        }
        res.status(403).json({ error: "Forbidden" });
    });
    return r;
}
