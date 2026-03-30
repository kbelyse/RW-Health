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
  reportOriginalName?: string | null;
  reportStoredName?: string | null;
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
        setErr("You are offline. Connect to load lab results.");
        return;
      }
      setLabs(r.data.results);
    })();
  }, []);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Labs</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Lab results</h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        Measurements from the laboratory (test name, result, unit, reference range). For your clinician&apos;s written
        summary of a visit, open <strong>Medical records</strong> instead.
      </p>
      {err && (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {err}
        </p>
      )}
      <DashCard
        title="Structured results"
        icon={<FlaskConical className="h-5 w-5 text-brand-600" />}
        className="mt-10"
      >
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
              {l.reportStoredName && (
                <a
                  href={`/api/labs/${encodeURIComponent(l.id)}/report`}
                  className="ml-2 text-xs font-semibold text-brand-600 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report
                </a>
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
