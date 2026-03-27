import { Mail, Shield } from "lucide-react";

export function DashboardSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-600">
        Account preferences for this demo. Password changes use email when the server is configured
        to send mail.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-sm border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 text-brand-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Email & notifications</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Transactional email (password reset, etc.) is sent only if the API has SMTP settings
                in <code className="rounded bg-slate-100 px-1 text-xs">apps/api/.env</code> (
                <code className="rounded bg-slate-100 px-1 text-xs">SMTP_HOST</code>,{" "}
                <code className="rounded bg-slate-100 px-1 text-xs">SMTP_PORT</code>, user, password,
                from address). In development without SMTP, the server logs a preview instead—check
                the API terminal for the reset code.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 shrink-0 text-brand-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Lab results</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Patients do not upload lab PDFs in this workspace. Only lab-role accounts enter
                structured results, which then appear under Lab results in the patient passport.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
