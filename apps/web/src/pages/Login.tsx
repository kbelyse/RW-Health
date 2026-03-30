import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordRevealField } from "@/components/auth/PasswordRevealField";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    nav("/dashboard");
  }

  return (
    <AuthLayout
      heroTitle="Welcome to RW-Health"
      heroSubtitle="Secure access to your digital health passport: one workspace for patients, clinicians, labs, and admins."
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Account</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Login
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Enter your credentials to open your workspace.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-9 space-y-5">
        <div>
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="auth-label mb-0" htmlFor="password">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-semibold text-[#0059B3] underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordRevealField
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>
        {err && (
          <div
            role="alert"
            className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {err}
          </div>
        )}
        <button type="submit" disabled={loading} className="auth-btn-primary !mt-2">
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      <div className="mt-9 border-t border-slate-100 pt-8">
        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-[#0059B3] underline-offset-2 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
