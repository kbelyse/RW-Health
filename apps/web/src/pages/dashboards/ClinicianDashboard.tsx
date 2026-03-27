import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";
import { PatientSearch, type PatientLite } from "./PatientSearch";

type RecordRow = {
  id: string;
  title: string;
  summary: string;
  facilityName: string;
  visitDate: string;
  patient?: { fullName: string; email: string };
};

export function ClinicianDashboard() {
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [facility, setFacility] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 16));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) {
      setRecords([]);
      return;
    }
    void (async () => {
      const r = await api<{ records: RecordRow[] }>(
        `/api/records?patientId=${encodeURIComponent(patient.id)}`
      );
      if (r.ok && "data" in r && r.data) setRecords(r.data.records);
    })();
  }, [patient]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return;
    setErr(null);
    setMsg(null);
    const r = await api<{ record: { id: string } }>("/api/records", {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.id,
        title,
        summary,
        facilityName: facility,
        visitDate: new Date(visitDate).toISOString(),
      }),
    });
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    if ("queued" in r && r.queued) {
      setMsg("Visit queued offline — will sync automatically when you reconnect.");
      setTitle("");
      setSummary("");
      setFacility("");
      return;
    }
    setMsg("Record saved to server.");
    setTitle("");
    setSummary("");
    setFacility("");
    const list = await api<{ records: RecordRow[] }>(
      `/api/records?patientId=${encodeURIComponent(patient.id)}`
    );
    if (list.ok && "data" in list && list.data) setRecords(list.data.records);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Patients & visits</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search a patient, review history, and file structured visit notes. Active:{" "}
          <strong>{patient?.fullName ?? "—"}</strong>
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashCard
          title="New encounter"
          icon={<Stethoscope className="h-4 w-4 text-brand-600" />}
        >
          <PatientSearch
            onSelect={(p) => {
              setPatient(p);
              setMsg(null);
            }}
          />
          {patient && (
            <p className="mt-4 text-sm text-slate-600">
              Selected: <strong className="text-slate-900">{patient.fullName}</strong>
            </p>
          )}
          <form onSubmit={addRecord} className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="t">
                Title
              </label>
              <input
                id="t"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500/0 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="s">
                Summary
              </label>
              <textarea
                id="s"
                required
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="f">
                Facility
              </label>
              <input
                id="f"
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="v">
                Visit date
              </label>
              <input
                id="v"
                type="datetime-local"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={!patient}
              className="min-h-[48px] rounded-sm bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              Save record
            </button>
            {err && <p className="text-sm text-red-600">{err}</p>}
            {msg && <p className="text-sm text-emerald-800">{msg}</p>}
          </form>
        </DashCard>
        <DashCard title="Patient history">
          <ul className="space-y-3">
            {records.map((rec) => (
              <li
                key={rec.id}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm"
              >
                <p className="font-medium text-slate-900">{rec.title}</p>
                <p className="text-slate-600">{rec.summary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {rec.facilityName} · {new Date(rec.visitDate).toLocaleString()}
                </p>
              </li>
            ))}
            {patient && records.length === 0 && (
              <li className="text-sm text-slate-500">No records for this patient.</li>
            )}
            {!patient && (
              <li className="text-sm text-slate-500">Select a patient to load history.</li>
            )}
          </ul>
        </DashCard>
      </div>
    </div>
  );
}
