import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
  FlaskConical,
  Microscope,
  Stethoscope,
  Users,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/api/client";

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{ records: number; labs: number; appts: number } | null>(
    null
  );
  const [adminStats, setAdminStats] = useState<{
    totalHealthRecords: number;
    totalLabResults: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === "PATIENT") {
      void (async () => {
        const [r1, r2, r3] = await Promise.all([
          api<{ records: unknown[] }>("/api/records"),
          api<{ results: unknown[] }>("/api/labs"),
          api<{ appointments: unknown[] }>("/api/appointments"),
        ]);
        setCounts({
          records: r1.ok && "data" in r1 && r1.data ? r1.data.records.length : 0,
          labs: r2.ok && "data" in r2 && r2.data ? r2.data.results.length : 0,
          appts: r3.ok && "data" in r3 && r3.data ? r3.data.appointments.length : 0,
        });
      })();
      return;
    }
    if (user.role === "ADMIN") {
      void (async () => {
        const r = await api<{
          totalHealthRecords: number;
          totalLabResults: number;
        }>("/api/admin/stats");
        if (r.ok && "data" in r && r.data) setAdminStats(r.data);
      })();
    }
  }, [user]);

  if (!user) return null;

  if (user.role === "PATIENT") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your passport at a glance—records from visits, lab results released by verified labs, and
          appointments you or your care team schedule.
        </p>
        {counts && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Records</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{counts.records}</p>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lab results</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{counts.labs}</p>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Appointments
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{counts.appts}</p>
            </div>
          </div>
        )}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/dashboard/records"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Medical records</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
          </Link>
          <Link
            to="/dashboard/labs"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Lab results</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
          </Link>
          <Link
            to="/dashboard/appointments"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Appointments</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
          </Link>
          <Link
            to="/dashboard/care-team"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Care team</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "CLINICIAN") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search patients, document visits, and schedule or review appointments. Use the sidebar for
          each area.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/dashboard/patients"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300"
          >
            <span className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Patients & visits</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/dashboard/appointments"
            className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300"
          >
            <span className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-slate-900">Appointments</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "LAB") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lab accounts publish structured results to patient records—patients do not upload their own
          files here.
        </p>
        <Link
          to="/dashboard/upload"
          className="mt-8 flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300"
        >
          <span className="flex items-center gap-3">
            <Microscope className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-slate-900">Upload results</span>
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          High-level counts; open Operations for role breakdown and signals.
        </p>
        {adminStats && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Health records</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{adminStats.totalHealthRecords}</p>
            </div>
            <div className="rounded-sm border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Lab results</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{adminStats.totalLabResults}</p>
            </div>
          </div>
        )}
        <Link
          to="/dashboard/admin"
          className="mt-8 flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 transition hover:border-brand-300"
        >
          <span className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-slate-900">Operations</span>
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>
    );
  }

  return null;
}
