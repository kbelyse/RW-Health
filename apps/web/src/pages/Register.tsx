import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "@/auth/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

const roles: { role: Role; label: string }[] = [
  { role: "PATIENT", label: "Patient" },
  { role: "CLINICIAN", label: "Clinician" },
  { role: "LAB", label: "Laboratory" },
];

const inputClass =
  "w-full rounded-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20";

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("PATIENT");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const r = await register(email, password, fullName, role);
    setLoading(false);
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    nav("/dashboard");
  }

  return (
    <AuthLayout
      heroTitle="Create your passport"
      heroSubtitle="Pick a role, set a strong password, and start using the same workflows as the pilot design."
    >
      <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">New account</h1>
      <p className="mt-2 text-slate-600">All fields are required.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide text-slate-600" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>
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
        <div>
          <label
            className="block text-sm font-bold uppercase tracking-wide text-slate-600"
            htmlFor="password"
          >
            Password (min 10 characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <span className="block text-sm font-bold uppercase tracking-wide text-slate-600">Role</span>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setRole(r.role)}
                className={`min-h-[52px] rounded-sm border-2 px-4 py-3 text-center text-sm font-bold transition ${
                  role === r.role
                    ? "border-brand-600 bg-brand-50 text-brand-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-brand-600 py-4 text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
