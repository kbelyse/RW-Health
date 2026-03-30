import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "@/auth/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordRevealField } from "@/components/auth/PasswordRevealField";
const roles: {
    role: Role;
    label: string;
    hint: string;
}[] = [
    { role: "PATIENT", label: "Patient", hint: "Timeline & visits" },
    { role: "CLINICIAN", label: "Clinician", hint: "Notes & care" },
    { role: "LAB", label: "Laboratory", hint: "Results" },
];
export function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<Role>("PATIENT");
    const [patientSecondary, setPatientSecondary] = useState<"none" | "CLINICIAN" | "LAB">("none");
    const [dualPatient, setDualPatient] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        if (password !== confirmPassword) {
            setErr("Passwords do not match.");
            return;
        }
        setLoading(true);
        let secondaryRole: Role | undefined;
        if (role === "PATIENT") {
            if (patientSecondary === "CLINICIAN")
                secondaryRole = "CLINICIAN";
            else if (patientSecondary === "LAB")
                secondaryRole = "LAB";
        }
        else if ((role === "CLINICIAN" || role === "LAB") && dualPatient) {
            secondaryRole = "PATIENT";
        }
        const r = await register(email, password, fullName, role, secondaryRole);
        setLoading(false);
        if (!r.ok) {
            setErr(r.error ?? "Failed");
            return;
        }
        nav("/dashboard");
    }
    return (<AuthLayout heroTitle="Welcome to RW-Health" heroSubtitle="Create your passport: choose a role, use a strong password, and explore the full demo.">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">New account</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Register
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">All fields are required.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-9 space-y-5">
        <div>
          <label className="auth-label" htmlFor="name">
            Full name
          </label>
          <input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="auth-input" placeholder="e.g. Marie Uwimana"/>
        </div>
        <div>
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" autoComplete="email" placeholder="you@example.com"/>
        </div>
        <div>
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <PasswordRevealField id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 10 characters" minLength={10} required/>
        </div>
        <div>
          <label className="auth-label" htmlFor="confirm-password">
            Confirm password
          </label>
          <PasswordRevealField id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Re-enter your password" minLength={10} required/>
        </div>
        <div>
          <span className="auth-label">Your role</span>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {roles.map((r) => (<button key={r.role} type="button" onClick={() => {
                setRole(r.role);
                setPatientSecondary("none");
                setDualPatient(false);
            }} className={`flex min-h-[5.5rem] flex-col items-center justify-center rounded-md border-2 px-3 py-4 text-center transition ${role === r.role
                ? "border-[#0059B3] bg-bk-light/80 text-slate-900 shadow-sm ring-1 ring-[#0059B3]/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                <span className="text-sm font-bold">{r.label}</span>
                <span className="mt-2 text-[11px] font-medium text-slate-500">{r.hint}</span>
              </button>))}
          </div>
        </div>
        {role === "PATIENT" && (<div>
            <label className="auth-label" htmlFor="secondary-workspace">
              Second workspace (optional)
            </label>
            <select id="secondary-workspace" value={patientSecondary} onChange={(e) => setPatientSecondary(e.target.value as typeof patientSecondary)} className="auth-input mt-1">
              <option value="none">Patient only</option>
              <option value="CLINICIAN">Also clinician</option>
              <option value="LAB">Also laboratory</option>
            </select>
          </div>)}
        {(role === "CLINICIAN" || role === "LAB") && (<label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0059B3] focus:ring-[#0059B3]" checked={dualPatient} onChange={(e) => setDualPatient(e.target.checked)}/>
            <span>
              <span className="font-semibold text-slate-900">Also use a patient passport.</span> One login; switch
              workspaces in the app.
            </span>
          </label>)}
        {err && (<p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>)}
        <button type="submit" disabled={loading} className="auth-btn-primary !mt-2">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <div className="mt-9 border-t border-slate-100 pt-8">
        <p className="text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-[#0059B3] underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>);
}
