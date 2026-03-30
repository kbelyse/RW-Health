import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { AuthLayout } from "@/components/auth/AuthLayout";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [np, setNp] = useState("");
  const [step, setStep] = useState<"req" | "reset">("req");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const r = await api<{ ok: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    setMsg("If the email exists, a reset code was sent.");
    setStep("reset");
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const r = await api<{ ok: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword: np }),
    });
    setLoading(false);
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    setMsg("Password updated. You can sign in.");
  }

  return (
    <AuthLayout
      heroTitle="Welcome to RW-Health"
      heroSubtitle="We’ll email a reset code when SMTP is set; otherwise check the API terminal in dev."
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Recovery</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Password recovery
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {step === "req"
            ? "Enter the email you used to register."
            : "Enter the code and choose a new password."}
        </p>
      </div>

      {step === "req" && (
        <form onSubmit={requestReset} className="mt-9 space-y-5">
          <div>
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>
          {err && (
            <p className="rounded-2xl border border-red-200/90 bg-red-50 px-5 py-4 text-sm text-red-900">{err}</p>
          )}
          {msg && (
            <p className="rounded-2xl border border-emerald-200/90 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">{msg}</p>
          )}
          <button type="submit" disabled={loading} className="auth-btn-primary !mt-4">
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={reset} className="mt-9 space-y-5">
          <div>
            <label className="auth-label" htmlFor="code">
              Reset code
            </label>
            <input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="auth-input font-mono text-lg tracking-wider"
            />
          </div>
          <div>
            <label className="auth-label" htmlFor="np">
              New password
            </label>
            <input
              id="np"
              type="password"
              minLength={10}
              required
              value={np}
              onChange={(e) => setNp(e.target.value)}
              className="auth-input"
              autoComplete="new-password"
            />
          </div>
          {err && (
            <p className="rounded-2xl border border-red-200/90 bg-red-50 px-5 py-4 text-sm text-red-900">{err}</p>
          )}
          {msg && (
            <p className="rounded-2xl border border-emerald-200/90 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">{msg}</p>
          )}
          <button type="submit" disabled={loading} className="auth-btn-primary !mt-4">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      <div className="mt-9 border-t border-slate-100 pt-8">
        <p className="text-center text-sm">
          <Link to="/login" className="font-semibold text-[#0059B3] underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
