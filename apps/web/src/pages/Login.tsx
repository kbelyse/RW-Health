import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

const inputClass =
  "w-full rounded-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20";

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
      heroTitle="Sign in with confidence"
      heroSubtitle="Access your passport dashboard with the same secure, role-aware session used across the platform."
    >
      <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">Welcome back</h1>
      <p className="mt-2 text-slate-600">Enter your credentials to continue.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label
            className="block text-sm font-bold uppercase tracking-wide text-slate-600"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>
        {err && <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-brand-600 py-4 text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">
        No account?{" "}
        <Link to="/register" className="font-bold text-brand-700 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className="font-medium text-slate-500 hover:text-brand-700">
          Forgot password?
        </Link>
      </p>
    </AuthLayout>
  );
}
