export function passwordResetHtml(name: string, token: string): string {
  const safe = escapeHtml(name);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,52,96,0.12);">
<tr><td style="background:linear-gradient(135deg,#0c4a8c 0%,#1d6fd1 100%);padding:28px 32px;">
<h1 style="margin:0;color:#fff;font-size:22px;">Password reset</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hi ${safe},</p>
<p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.65;">We received a request to reset your password. Use the code below in the app (valid for a short time):</p>
<div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;border:1px dashed #cbd5e1;">
<span style="font-family:ui-monospace,monospace;font-size:24px;font-weight:700;letter-spacing:0.15em;color:#0f172a;">${escapeHtml(token)}</span>
</div>
<p style="margin:24px 0 0;color:#64748b;font-size:13px;">If you did not request this, you can safely ignore this message.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function passwordResetText(name: string, token: string): string {
  return `Hi ${name},\n\nReset code: ${token}\n\nIf you did not request this, ignore this email.`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
