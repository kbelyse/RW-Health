import nodemailer from "nodemailer";
import type { AppConfig } from "../config.js";
import { welcomeEmailHtml, welcomeEmailText } from "../templates/welcomeEmail.js";
import { passwordResetHtml, passwordResetText } from "../templates/passwordResetEmail.js";

function createTransport(cfg: AppConfig) {
  if (!cfg.SMTP_HOST || !cfg.SMTP_USER || !cfg.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: cfg.SMTP_HOST,
    port: cfg.SMTP_PORT ?? 587,
    secure: (cfg.SMTP_PORT ?? 587) === 465,
    auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
  });
}

function logDevEmail(kind: string, to: string, subject: string, html: string, extra?: string): void {
  console.info("\n──────── RW-Health email (dev, no SMTP) ────────");
  console.info(`[${kind}] To: ${to} | ${subject}`);
  if (extra) console.info(extra);
  console.info("— HTML preview (first 800 chars) —\n", html.slice(0, 800) + (html.length > 800 ? "…" : ""));
  console.info("────────────────────────────────────────────────\n");
  console.info("Configure SMTP_HOST, SMTP_USER, SMTP_PASS in apps/api/.env to send real mail.\n");
}

export async function sendWelcomeEmail(
  cfg: AppConfig,
  to: string,
  name: string
): Promise<void> {
  const t = createTransport(cfg);
  const from = cfg.SMTP_FROM ?? "RW-Health Passport <noreply@localhost>";
  const subject = "Welcome to RW-Health Passport";
  const html = welcomeEmailHtml(name);
  if (!t) {
    if (cfg.NODE_ENV === "development") {
      logDevEmail("welcome", to, subject, html);
    }
    return;
  }
  await t.sendMail({
    from,
    to,
    subject,
    text: welcomeEmailText(name),
    html,
  });
}

export async function sendPasswordResetEmail(
  cfg: AppConfig,
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const t = createTransport(cfg);
  const from = cfg.SMTP_FROM ?? "RW-Health Passport <noreply@localhost>";
  const subject = "Reset your RW-Health Passport password";
  const html = passwordResetHtml(name, resetToken);
  if (!t) {
    if (cfg.NODE_ENV === "development") {
      logDevEmail("password-reset", to, subject, html, `Reset code (full): ${resetToken}`);
    }
    return;
  }
  await t.sendMail({
    from,
    to,
    subject,
    text: passwordResetText(name, resetToken),
    html,
  });
}
