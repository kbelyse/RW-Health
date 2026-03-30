import { useEffect, useState } from "react";
import { Microscope } from "lucide-react";
import { api, apiForm } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";
import { PatientSearch, type PatientLite } from "./PatientSearch";
type LabRow = {
    id: string;
    testName: string;
    value: string;
    unit: string;
    reportedAt: string;
    reportOriginalName?: string | null;
    reportStoredName?: string | null;
    patient?: {
        fullName: string;
    };
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
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    useEffect(() => {
        if (!patient) {
            setRows([]);
            return;
        }
        void (async () => {
            const r = await api<{
                results: LabRow[];
            }>(`/api/labs?patientId=${encodeURIComponent(patient.id)}`);
            if (r.ok && "data" in r && r.data)
                setRows(r.data.results);
        })();
    }, [patient]);
    async function upload(e: React.FormEvent) {
        e.preventDefault();
        if (!patient)
            return;
        setErr(null);
        setMsg(null);
        const fd = new FormData();
        fd.set("patientId", patient.id);
        fd.set("testCode", testCode);
        fd.set("testName", testName);
        fd.set("value", value);
        fd.set("unit", unit);
        if (ref.trim())
            fd.set("referenceRange", ref.trim());
        fd.set("collectedAt", new Date(collected).toISOString());
        if (reportFile)
            fd.set("report", reportFile);
        const r = await apiForm<{
            result: {
                id: string;
            };
        }>("/api/labs", fd);
        if (!r.ok) {
            setErr(r.error ?? "Failed");
            return;
        }
        setMsg("Result uploaded.");
        setTestCode("");
        setTestName("");
        setValue("");
        setUnit("");
        setRef("");
        setReportFile(null);
        const list = await api<{
            results: LabRow[];
        }>(`/api/labs?patientId=${encodeURIComponent(patient.id)}`);
        if (list.ok && "data" in list && list.data)
            setRows(list.data.results);
    }
    return (<div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Laboratory</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
          Upload lab results
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Enter one analyte (test) per submission. This is separate from clinicians&apos; narrative visit notes in
          Medical records.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-1">
        <DashCard title="Result entry" icon={<Microscope className="h-5 w-5 text-brand-600"/>}>
          <PatientSearch onSelect={setPatient}/>
          {patient && (<p className="mt-4 text-sm text-slate-600">
              Patient: <strong className="text-slate-900">{patient.fullName}</strong>
            </p>)}
          <form onSubmit={upload} className="mt-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="tc">
                    Lab / LOINC code
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Short code as on the lab slip (e.g. <code className="rounded bg-slate-100 px-1">HBA1C</code>,
                    LOINC). Used to match tests across systems.
                  </p>
                  <input id="tc" required value={testCode} onChange={(e) => setTestCode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. HBA1C"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="tn">
                    Test name (display)
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">Full name patients and clinicians see (e.g. Hemoglobin A1c).</p>
                  <input id="tn" required value={testName} onChange={(e) => setTestName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. Hemoglobin A1c"/>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="val">
                      Result value
                    </label>
                    <p className="mt-0.5 text-xs text-slate-500">The measured outcome (number or text, e.g. 6.1).</p>
                    <input id="val" required value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. 6.1"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="un">
                      Unit
                    </label>
                    <p className="mt-0.5 text-xs text-slate-500">Unit for the value (e.g. %, g/L, 10^9/L).</p>
                    <input id="un" required value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. %"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="rf">
                    Reference range (optional)
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">Expected normal range text from the lab (e.g. &lt; 6.5%).</p>
                  <input id="rf" value={ref} onChange={(e) => setRef(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20" placeholder="e.g. < 6.5%"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="col">
                    Specimen collected at
                  </label>
                  <input id="col" type="datetime-local" value={collected} onChange={(e) => setCollected(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"/>
                </div>
              </div>
              <div className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50/80 p-4 lg:w-72 lg:self-stretch">
                <p className="text-sm font-semibold text-slate-900">Attachment</p>
                <p className="mt-1 text-xs text-slate-600">
                  Optional PDF or image of the official report — stored separately from the structured fields.
                </p>
                <label htmlFor="rep" className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/50">
                  <span className="text-sm font-medium text-brand-700">Choose file</span>
                  <span className="mt-1 text-xs text-slate-500">PDF, PNG, JPG</span>
                  <input id="rep" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} className="sr-only"/>
                </label>
                {reportFile && <p className="mt-3 break-all text-xs text-slate-700">{reportFile.name}</p>}
              </div>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <button type="submit" disabled={!patient} className="min-h-[48px] rounded-lg bg-brand-600 px-8 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
                Upload result
              </button>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
              {msg && <p className="mt-3 text-sm text-emerald-800">{msg}</p>}
            </div>
          </form>
        </DashCard>
        <DashCard title="Recent results · patient" className="mt-8">
          <ul className="space-y-2 text-sm">
            {rows.map((r) => (<li key={r.id} className="rounded-lg border border-slate-100 px-3 py-2">
                <span className="font-medium text-slate-900">{r.testName}</span>
                <span className="text-slate-600">
                  {" "}
                  {r.value} {r.unit}
                </span>
                {r.reportStoredName && (<a href={`/api/labs/${encodeURIComponent(r.id)}/report`} className="ml-2 text-xs font-semibold text-brand-600 underline" target="_blank" rel="noreferrer">
                    Report
                  </a>)}
                <p className="text-xs text-slate-500">{new Date(r.reportedAt).toLocaleString()}</p>
              </li>))}
            {patient && rows.length === 0 && (<li className="text-slate-500">No results for this patient yet.</li>)}
            {!patient && <li className="text-slate-500">Select a patient.</li>}
          </ul>
        </DashCard>
      </div>
    </div>);
}
