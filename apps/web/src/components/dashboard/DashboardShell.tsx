import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";
import { Link } from "react-router-dom";
import type { Role } from "@/auth/AuthContext";

const roleLabel: Record<Role, string> = {
  PATIENT: "Patient",
  CLINICIAN: "Clinician",
  LAB: "Laboratory",
  ADMIN: "Administrator",
};

type Props = {
  role: Role;
  title: string;
  subtitle: string;
  children: ReactNode;
  stats?: ReactNode;
};

export function DashboardShell({ role, title, subtitle, stats, children }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="border-b border-slate-200/90 bg-gradient-to-r from-slate-50/90 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
                {roleLabel[role]}
              </span>
              <Link
                to="/"
                className="text-xs font-medium text-slate-500 transition hover:text-brand-700"
              >
                ← Platform home
              </Link>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>
          </motion.div>
          <RWHealthLogo size="sm" />
        </div>
        {stats && (
          <div className="mx-auto max-w-6xl px-4 pb-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats}</div>
          </div>
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

export function DashCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200/90 bg-white ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        {icon}
        <h2 className="font-display text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-2 break-words font-display text-xl font-bold leading-tight text-brand-950 md:text-2xl">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
