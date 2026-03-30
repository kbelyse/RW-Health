import nodemailer from "nodemailer";
import type { AppConfig } from "../config.js";
import { welcomeEmailHtml, welcomeEmailText } from "../templates/welcomeEmail.js";
import { passwordResetHtml, passwordResetText } from "../templates/passwordResetEmail.js";
import { clinicianPatientBookedHtml, clinicianPatientBookedText, clinicianStaffScheduledHtml, clinicianStaffScheduledText, formatApptWhen, healthRecordAddedHtml, healthRecordAddedText, labResultAddedHtml, labResultAddedText, patientSelfBookedHtml, patientSelfBookedText, patientStaffScheduledHtml, patientStaffScheduledText, } from "../templates/notifications.js";
function createTransport(cfg: AppConfig) {
    if (!cfg.SMTP_HOST || !cfg.SMTP_USER || !cfg.SMTP_PASS) {
        return null;
    }
    const port = cfg.SMTP_PORT ?? 587;
    return nodemailer.createTransport({
        host: cfg.SMTP_HOST,
        port,
        secure: cfg.SMTP_SECURE === true || port === 465,
        requireTLS: port === 587,
        auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
    });
}
function logDevEmail(kind: string, to: string, subject: string, html: string, extra?: string): void {
    console.info("\n──────── RW-Health email (no SMTP transport) ────────");
    console.info(`[${kind}] To: ${to} | ${subject}`);
    if (extra)
        console.info(extra);
    console.info("— HTML preview (first 800 chars) —\n", html.slice(0, 800) + (html.length > 800 ? "…" : ""));
    console.info("────────────────────────────────────────────────\n");
    console.info("Set SMTP_HOST, SMTP_USER, SMTP_PASS (and SMTP_PORT if not 587) in apps/api/.env to send real mail.\n");
}
async function sendTransactional(cfg: AppConfig, kind: string, to: string, subject: string, html: string, text: string, devExtra?: string): Promise<void> {
    const t = createTransport(cfg);
    const from = cfg.SMTP_FROM ?? "RW-Health Passport <noreply@localhost>";
    if (!t) {
        logDevEmail(kind, to, subject, html, devExtra);
        return;
    }
    try {
        await t.sendMail({ from, to, subject, text, html });
    }
    catch (e) {
        console.error(`[mail] ${kind} failed:`, e);
    }
}
export async function sendWelcomeEmail(cfg: AppConfig, to: string, name: string): Promise<void> {
    const subject = "Welcome to RW-Health Passport";
    const html = welcomeEmailHtml(name);
    await sendTransactional(cfg, "welcome", to, subject, html, welcomeEmailText(name));
}
export async function sendPasswordResetEmail(cfg: AppConfig, to: string, name: string, resetToken: string): Promise<void> {
    const subject = "Reset your RW-Health Passport password";
    const html = passwordResetHtml(name, resetToken);
    await sendTransactional(cfg, "password-reset", to, subject, html, passwordResetText(name, resetToken), `Reset code (full): ${resetToken}`);
}
export async function notifyAppointmentPatientBooked(cfg: AppConfig, p: {
    patientEmail: string;
    patientName: string;
    clinicianEmail: string | null | undefined;
    clinicianName: string | null | undefined;
    title: string;
    facilityName: string;
    scheduledAt: Date;
    notes?: string | null;
}): Promise<void> {
    const when = formatApptWhen(p.scheduledAt);
    const doc = p.clinicianName?.trim() || "your clinician";
    await sendTransactional(cfg, "appointment-booked-patient", p.patientEmail, "Visit confirmed — RW-Health Passport", patientSelfBookedHtml({
        name: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        clinicianName: doc,
        notes: p.notes,
    }), patientSelfBookedText({
        name: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        clinicianName: doc,
        notes: p.notes,
    }));
    const ce = p.clinicianEmail?.trim();
    if (!ce)
        return;
    await sendTransactional(cfg, "appointment-booked-clinician", ce, `New booking: ${p.patientName}`, clinicianPatientBookedHtml({
        patientName: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        notes: p.notes,
    }), clinicianPatientBookedText({
        patientName: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        notes: p.notes,
    }));
}
export async function notifyAppointmentStaffScheduled(cfg: AppConfig, p: {
    patientEmail: string;
    patientName: string;
    clinicianEmail: string | null | undefined;
    clinicianName: string | null | undefined;
    title: string;
    facilityName: string;
    scheduledAt: Date;
    notes?: string | null;
}): Promise<void> {
    const when = formatApptWhen(p.scheduledAt);
    const doc = p.clinicianName?.trim() || "your clinician";
    await sendTransactional(cfg, "appointment-scheduled-patient", p.patientEmail, "Visit scheduled — RW-Health Passport", patientStaffScheduledHtml({
        name: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        clinicianName: doc,
        notes: p.notes,
    }), patientStaffScheduledText({
        name: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        clinicianName: doc,
        notes: p.notes,
    }));
    const ce = p.clinicianEmail?.trim();
    if (!ce)
        return;
    await sendTransactional(cfg, "appointment-scheduled-clinician", ce, `Visit scheduled: ${p.patientName}`, clinicianStaffScheduledHtml({
        patientName: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        notes: p.notes,
    }), clinicianStaffScheduledText({
        patientName: p.patientName,
        title: p.title,
        facilityName: p.facilityName,
        when,
        notes: p.notes,
    }));
}
export async function notifyLabResultUploaded(cfg: AppConfig, p: {
    patientEmail: string;
    patientName: string;
    testName: string;
    testCode: string;
}): Promise<void> {
    await sendTransactional(cfg, "lab-result", p.patientEmail, `Lab result: ${p.testName}`, labResultAddedHtml({ name: p.patientName, testName: p.testName, testCode: p.testCode }), labResultAddedText({ name: p.patientName, testName: p.testName, testCode: p.testCode }));
}
export async function notifyHealthRecordAdded(cfg: AppConfig, p: {
    patientEmail: string;
    patientName: string;
    title: string;
    facilityName: string;
}): Promise<void> {
    await sendTransactional(cfg, "health-record", p.patientEmail, `New visit record: ${p.title}`, healthRecordAddedHtml({ name: p.patientName, title: p.title, facilityName: p.facilityName }), healthRecordAddedText({ name: p.patientName, title: p.title, facilityName: p.facilityName }));
}
