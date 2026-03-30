import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";

type Stats = {
  usersByRole: { role: string; _count: { _all: number } }[];
  totalHealthRecords: number;
  totalLabResults: number;
  auditEventsLast7Days: number;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await api<Stats>("/api/admin/stats");
      if (!r.ok) {
        setErr(r.error ?? "Failed");
        return;
      }
      if (!("data" in r) || !r.data) {
        setErr("Unexpected response");
        return;
      }
      setStats(r.data);
    })();
  }, []);

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Administration</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Operations</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Utilization, lab throughput, and audit signals.{" "}
          {stats && (
            <span className="text-slate-500">
              Records: {stats.totalHealthRecords} · Labs: {stats.totalLabResults} · Audit (7d):{" "}
              {stats.auditEventsLast7Days}
            </span>
          )}
        </p>
      </div>
      {err && <p className="mb-8 text-sm text-red-600">{err}</p>}
      {stats && (
        <div className="grid gap-8 lg:grid-cols-2">
          <DashCard title="Users by role" icon={<BarChart3 className="h-5 w-5 text-brand-600" />}>
            <ul className="space-y-2 text-sm">
              {stats.usersByRole.map((u) => (
                <li
                  key={u.role}
                  className="flex justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium text-slate-800">{u.role}</span>
                  <span className="tabular-nums text-slate-600">{u._count._all}</span>
                </li>
              ))}
            </ul>
          </DashCard>
          <DashCard title="Signals">
            <p className="text-sm text-slate-600">
              Use record and lab counts to plan capacity; watch audit volume for unusual access
              patterns. Connect BI tooling to these endpoints in a future iteration.
            </p>
          </DashCard>
        </div>
      )}
    </div>
  );
}
