import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";
import { audit } from "../lib/audit.js";
import { whereUserIsPatientWithId } from "../lib/roleQueries.js";
import type { AppConfig } from "../config.js";
import { notifyLabResultUploaded } from "../lib/mail.js";
const uploadSchema = z.object({
    patientId: z.string().min(1),
    testCode: z.string().min(1).max(64),
    testName: z.string().min(1).max(200),
    value: z.string().min(1).max(200),
    unit: z.string().min(1).max(64),
    referenceRange: z.string().max(200).optional(),
    collectedAt: z.string().datetime(),
});
function reportsDir(): string {
    return path.join(process.cwd(), "uploads", "lab-reports");
}
function allowedReportFilename(name: string): boolean {
    return /\.(pdf|png|jpg|jpeg|webp)$/i.test(name);
}
function mimeForFilename(name: string): string {
    const n = name.toLowerCase();
    if (n.endsWith(".pdf"))
        return "application/pdf";
    if (n.endsWith(".png"))
        return "image/png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg"))
        return "image/jpeg";
    if (n.endsWith(".webp"))
        return "image/webp";
    return "application/octet-stream";
}
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 },
});
export function createLabsRouter(cfg: AppConfig): Router {
    const r = Router();
    r.get("/:id/report", requireAuth, async (req: AuthedRequest, res) => {
        const id = typeof req.params.id === "string" ? req.params.id : "";
        const row = await prisma.labResult.findUnique({ where: { id } });
        if (!row?.reportStoredName) {
            res.status(404).json({ error: "Report not found" });
            return;
        }
        const role = req.userRole!;
        const uid = req.userId!;
        if (role === UserRole.PATIENT) {
            if (row.patientId !== uid) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
        }
        else if (role === UserRole.LAB || role === UserRole.ADMIN) {
        }
        else if (role === UserRole.CLINICIAN) {
        }
        else {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        const abs = path.join(reportsDir(), row.reportStoredName);
        try {
            await fs.access(abs);
        }
        catch {
            res.status(404).json({ error: "File missing" });
            return;
        }
        const dlName = row.reportOriginalName ?? "report";
        res.setHeader("Content-Type", mimeForFilename(dlName));
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(dlName)}`);
        res.sendFile(abs);
    });
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
    r.post("/", requireAuth, requireRoles(UserRole.LAB, UserRole.ADMIN), (req, res, next) => {
        const ct = String(req.headers["content-type"] ?? "");
        if (ct.includes("multipart/form-data")) {
            upload.single("report")(req, res, (err: unknown) => {
                if (err) {
                    const e = err as {
                        code?: string;
                        message?: string;
                    };
                    if (e.code === "LIMIT_FILE_SIZE") {
                        res.status(400).json({ error: "File too large (max 12MB)" });
                        return;
                    }
                    res.status(400).json({ error: e.message ?? "Upload failed" });
                    return;
                }
                next();
            });
        }
        else {
            next();
        }
    }, async (req: AuthedRequest, res) => {
        const multipart = String(req.headers["content-type"] ?? "").includes("multipart/form-data");
        const raw = multipart ? (req.body as Record<string, string>) : (req.body as Record<string, unknown>);
        const parsed = uploadSchema.safeParse({
            patientId: raw.patientId,
            testCode: raw.testCode,
            testName: raw.testName,
            value: raw.value,
            unit: raw.unit,
            referenceRange: raw.referenceRange,
            collectedAt: raw.collectedAt,
        });
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
        const multerFile = multipart ? (req as AuthedRequest & {
            file?: Express.Multer.File;
        }).file : undefined;
        if (multerFile && !allowedReportFilename(multerFile.originalname)) {
            res.status(400).json({ error: "Attachment must be PDF, PNG, JPG, or WebP" });
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
        let updated = row;
        if (multerFile?.buffer?.length) {
            const dir = reportsDir();
            await fs.mkdir(dir, { recursive: true });
            const ext = path.extname(multerFile.originalname) || ".bin";
            const stored = `${randomUUID()}${ext}`;
            await fs.writeFile(path.join(dir, stored), multerFile.buffer);
            updated = await prisma.labResult.update({
                where: { id: row.id },
                data: {
                    reportOriginalName: multerFile.originalname,
                    reportStoredName: stored,
                },
            });
        }
        await audit(req.userId, "LAB_UPLOAD", "LabResult", { id: updated.id });
        void notifyLabResultUploaded(cfg, {
            patientEmail: patient.email,
            patientName: patient.fullName,
            testName: d.testName,
            testCode: d.testCode,
        });
        res.status(201).json({ result: updated });
    });
    return r;
}
