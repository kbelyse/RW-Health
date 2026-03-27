import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";

export function createAdminRouter(): Router {
  const r = Router();

  r.get("/stats", requireAuth, requireRoles(UserRole.ADMIN), async (_req: AuthedRequest, res) => {
    const [users, records, labs, audits] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.healthRecord.count(),
      prisma.labResult.count(),
      prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);
    res.json({
      usersByRole: users,
      totalHealthRecords: records,
      totalLabResults: labs,
      auditEventsLast7Days: audits,
    });
  });

  r.get("/audit", requireAuth, requireRoles(UserRole.ADMIN), async (req, res) => {
    const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
    res.json({ logs: rows });
  });

  return r;
}
