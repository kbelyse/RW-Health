import { useEffect, useState } from "react";
import { Microscope } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";
import { PatientSearch, type PatientLite } from "./PatientSearch";

type LabRow = {
  id: string;
  testName: string;
  value: string;
  unit: string;
  reportedAt: string;
  patient?: { fullName: string };
};

export function LabDashboard() {
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [rows, setRows] = useState<LabRow[]>([]);
  const [testCode, setTestCode] = useState("");
  const [testName, setTestName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [ref, setRef] = useState("");
  const [collected, setCollected] = useState(new Date().toISOString().slice(0, 16));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) {
      setRows([]);
      return;
    }
    void (async () => {
      const r = await api<{ results: LabRow[] }>(
        `/api/labs?patientId=${encodeURIComponent(patient.id)}`
      );
      if (r.ok && "data" in r && r.data) setRows(r.data.results);
    })();
  }, [patient]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return;
    setErr(null);
    setMsg(null);
    const r = await api<{ result: { id: string } }>("/api/labs", {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.id,
        testCode,
        testName,
        value,
        unit,
        referenceRange: ref || undefined,
        collectedAt: new Date(collected).toISOString(),
      }),
    });
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    if ("queued" in r && r.queued) {
      setMsg("Result queued offline — will upload when connection returns.");
      setTestCode("");
      setTestName("");
      setValue("");
      setUnit("");
      setRef("");
      return;
    }
    setMsg("Result uploaded to server.");
    setTestCode("");
    setTestName("");
    setValue("");
    setUnit("");
    setRef("");
    const list = await api<{ results: LabRow[] }>(
      `/api/labs?patientId=${encodeURIComponent(patient.id)}`
    );
    if (list.ok && "data" in list && list.data) setRows(list.data.results);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Upload lab results</h1>
        <p className="mt-1 text-sm text-slate-600">
          Verify the patient, enter structured test fields, and publish to their passport. Patients never
          upload their own lab PDFs here—only verified lab accounts release results.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashCard title="Result entry" icon={<Microscope className="h-4 w-4 text-brand-600" />}>
          <PatientSearch onSelect={setPatient} />
          {patient && (
            <p className="mt-4 text-sm text-slate-600">
              Patient: <strong className="text-slate-900">{patient.fullName}</strong>
            </p>
          )}
          <form onSubmit={upload} className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="tc">
                Test code
              </label>
              <input
                id="tc"
                required
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="tn">
                Test name
              </label>
              <input
                id="tn"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="val">
                Value
              </label>
              <input
                id="val"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="un">
                Unit
              </label>
              <input
                id="un"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="rf">
                Reference range
              </label>
              <input
                id="rf"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="col">
                Collected at
              </label>
              <input
                id="col"
                type="datetime-local"
                value={collected}
                onChange={(e) => setCollected(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!patient}
                className="min-h-[48px] rounded-sm bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                Upload result
              </button>
            </div>
            {err && <p className="sm:col-span-2 text-sm text-red-600">{err}</p>}
            {msg && <p className="sm:col-span-2 text-sm text-emerald-800">{msg}</p>}
          </form>
        </DashCard>
        <DashCard title="Recent results · patient">
          <ul className="space-y-2 text-sm">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 px-3 py-2">
                <span className="font-medium text-slate-900">{r.testName}</span>
                <span className="text-slate-600">
                  {" "}
                  — {r.value} {r.unit}
                </span>
                <p className="text-xs text-slate-500">{new Date(r.reportedAt).toLocaleString()}</p>
              </li>
            ))}
            {patient && rows.length === 0 && (
              <li className="text-slate-500">No results for this patient yet.</li>
            )}
            {!patient && <li className="text-slate-500">Select a patient.</li>}
          </ul>
        </DashCard>
      </div>
    </div>
  );
}
