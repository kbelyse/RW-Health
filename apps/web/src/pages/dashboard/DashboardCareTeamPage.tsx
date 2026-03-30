import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";

type ClinicianLite = { id: string; fullName: string; email: string };

export function DashboardCareTeamPage() {
  const [clinicians, setClinicians] = useState<ClinicianLite[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await api<{ clinicians: ClinicianLite[] }>("/api/providers/clinicians");
      if (!r.ok) {
        setErr(r.error ?? "Could not load clinicians");
        return;
      }
      if (!("data" in r) || !r.data) {
        setErr("Offline");
        return;
      }
      setClinicians(r.data.clinicians);
    })();
  }, []);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Network</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Care team</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
        Clinicians registered on the platform. When you request an appointment, you can pick one of
        these doctors if you have a preference.
      </p>
      {err && <p className="mt-6 text-sm text-red-600">{err}</p>}
      <DashCard title="Clinicians" icon={<Users className="h-5 w-5 text-brand-600" />} className="mt-10">
        <ul className="divide-y divide-slate-100">
          {clinicians.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 py-4 first:pt-0">
              <span className="font-semibold text-slate-900">{c.fullName}</span>
              <span className="text-sm text-slate-600">{c.email}</span>
            </li>
          ))}
          {clinicians.length === 0 && !err && (
            <li className="py-4 text-sm text-slate-500">No clinicians registered yet.</li>
          )}
        </ul>
      </DashCard>
    </div>
  );
}
