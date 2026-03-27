import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { AuthLayout } from "@/components/auth/AuthLayout";

const inputClass =
  "w-full rounded-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20";

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
      heroTitle="Recover access"
      heroSubtitle="We will email a reset code when SMTP is configured. In development, check the API console for the code."
    >
      <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">Password recovery</h1>
      <p className="mt-2 text-slate-600">
        {step === "req"
          ? "Enter the email you used to register."
          : "Enter the code and choose a new password."}
      </p>
      {step === "req" && (
        <form onSubmit={requestReset} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          {err && <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
          {msg && <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brand-600 py-4 text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      )}
      {step === "reset" && (
        <form onSubmit={reset} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="code">
              Reset code
            </label>
            <input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} mt-2 font-mono`}
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="np">
              New password
            </label>
            <input
              id="np"
              type="password"
              minLength={10}
              required
              value={np}
              onChange={(e) => setNp(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          {err && <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
          {msg && <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brand-600 py-4 text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
      <p className="mt-8 text-center text-sm">
        <Link to="/login" className="font-bold text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
