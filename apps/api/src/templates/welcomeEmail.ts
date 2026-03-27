export function welcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,52,96,0.12);">
<tr><td style="background:linear-gradient(135deg,#0c4a8c 0%,#1d6fd1 100%);padding:28px 32px;">
<h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">RW-Health Passport</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Your health records, unified.</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 16px;color:#1e293b;font-size:16px;line-height:1.6;">Hello ${escapeHtml(name)},</p>
<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.65;">Thank you for joining Rwanda’s patient-centered health record platform. You can now view lab results, share records with trusted providers, and stay in control of your care journey.</p>
<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
<tr><td style="background:#eff6ff;border-radius:12px;padding:16px 20px;border:1px solid #bfdbfe;">
<p style="margin:0;color:#1e40af;font-size:14px;line-height:1.5;"><strong>Tip:</strong> Complete your profile and enable notifications so you never miss an update from your care team.</p>
</td></tr></table>
<p style="margin:0;color:#64748b;font-size:13px;">— RW-Health Passport</p>
</td></tr>
<tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
<p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">This message was sent because you created an account. If you did not, you can ignore this email.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function welcomeEmailText(name: string): string {
  return `Hello ${name},\n\nWelcome to RW-Health Passport. You can now view lab results and manage your health records securely.\n\n— RW-Health Passport`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
