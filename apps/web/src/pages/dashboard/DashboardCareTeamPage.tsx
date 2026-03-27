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
      <h1 className="font-display text-2xl font-bold text-slate-900">Care team</h1>
      <p className="mt-1 text-sm text-slate-600">
        Clinicians registered on the platform. When you request an appointment, you can pick one of
        these doctors if you have a preference.
      </p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      <DashCard title="Clinicians" icon={<Users className="h-4 w-4 text-brand-600" />} className="mt-6">
        <ul className="divide-y divide-slate-100">
          {clinicians.map((c) => (
            <li key={c.id} className="flex flex-col gap-0.5 py-3 first:pt-0">
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
