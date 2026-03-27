import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";

type LabRow = {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string | null;
  reportedAt: string;
};

export function DashboardLabsPage() {
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await api<{ results: LabRow[] }>("/api/labs");
      if (!r.ok) {
        setErr(r.error ?? "Failed to load labs");
        return;
      }
      if (!("data" in r) || !r.data) {
        setErr("You are offline — connect to load lab results.");
        return;
      }
      setLabs(r.data.results);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Lab results</h1>
      <p className="mt-1 text-sm text-slate-600">
        Results are entered by accredited lab accounts and attached to your passport—you do not upload
        PDFs here.
      </p>
      {err && (
        <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {err}
        </p>
      )}
      <DashCard title="Structured results" icon={<FlaskConical className="h-4 w-4 text-brand-600" />} className="mt-6">
        <ul className="space-y-3">
          {labs.map((l) => (
            <li key={l.id} className="text-sm">
              <span className="font-semibold text-slate-900">{l.testName}</span>
              <span className="text-slate-600">
                {" "}
                {l.value} {l.unit}
              </span>
              {l.referenceRange && (
                <span className="text-slate-500"> · Ref: {l.referenceRange}</span>
              )}
              <p className="text-xs text-slate-500">{new Date(l.reportedAt).toLocaleString()}</p>
            </li>
          ))}
          {labs.length === 0 && (
            <li className="text-sm text-slate-500">No lab results yet.</li>
          )}
        </ul>
      </DashCard>
    </div>
  );
}
