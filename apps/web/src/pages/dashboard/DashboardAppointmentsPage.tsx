import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { DashCard } from "@/components/dashboard/DashboardShell";
import { PatientSearch, type PatientLite } from "@/pages/dashboards/PatientSearch";

export type AppointmentRow = {
  id: string;
  title: string;
  facilityName: string;
  scheduledAt: string;
  status: string;
  notes?: string | null;
  createdBy?: { id: string; fullName: string; role: string };
  clinician?: { id: string; fullName: string; email: string } | null;
  patient?: { fullName: string; email: string };
};

type ClinicianLite = { id: string; fullName: string; email: string };

export function DashboardAppointmentsPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "PATIENT") return <PatientAppointments />;
  if (user.role === "CLINICIAN" || user.role === "ADMIN") return <StaffAppointments />;
  return (
    <p className="text-sm text-slate-600">
      Appointments are not available for this role. Use the lab upload flow.
    </p>
  );
}

function PatientAppointments() {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianLite[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [when, setWhen] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [clinicianId, setClinicianId] = useState("");

  async function load() {
    const r = await api<{ appointments: AppointmentRow[] }>("/api/appointments");
    if (r.ok && "data" in r && r.data) setRows(r.data.appointments);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    void (async () => {
      const r = await api<{ clinicians: ClinicianLite[] }>("/api/providers/clinicians");
      if (r.ok && "data" in r && r.data) setClinicians(r.data.clinicians);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const r = await api<{ appointment: AppointmentRow }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        title,
        facilityName,
        scheduledAt: new Date(when).toISOString(),
        notes: notes || undefined,
        clinicianId: clinicianId || undefined,
      }),
    });
    if (!r.ok) {
      setErr(r.error ?? "Could not request appointment");
      return;
    }
    setMsg("Request sent. Your care team will see it as REQUESTED until confirmed.");
    setTitle("");
    setFacilityName("");
    setNotes("");
    setClinicianId("");
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Appointments</h1>
      <p className="mt-1 text-sm text-slate-600">
        Request a visit (you choose optional doctor). When your clinician schedules a visit for you,
        it appears here as SCHEDULED with their name. You can always see who created the request and
        which doctor is assigned.
      </p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-4 text-sm text-emerald-800">{msg}</p>}

      <DashCard title="Request an appointment" icon={<Calendar className="h-4 w-4 text-brand-600" />} className="mt-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="apt-title">
              Reason / title
            </label>
            <input
              id="apt-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="apt-fac">
              Facility
            </label>
            <input
              id="apt-fac"
              required
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="apt-when">
              Date & time
            </label>
            <input
              id="apt-when"
              type="datetime-local"
              required
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="apt-doc">
              Preferred doctor (optional)
            </label>
            <select
              id="apt-doc"
              value={clinicianId}
              onChange={(e) => setClinicianId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">No preference</option>
              {clinicians.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="apt-notes">
              Notes (optional)
            </label>
            <textarea
              id="apt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="min-h-[48px] rounded-sm bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Submit request
            </button>
          </div>
        </form>
      </DashCard>

      <DashCard title="Your appointments" icon={<Calendar className="h-4 w-4 text-brand-600" />} className="mt-6">
        <ul className="space-y-4">
          {rows.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-100 px-3 py-3 text-sm">
              <p className="font-semibold text-slate-900">{a.title}</p>
              <p className="text-slate-600">{a.facilityName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(a.scheduledAt).toLocaleString()} ·{" "}
                <span className="font-medium">{a.status}</span>
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Requested by: {a.createdBy?.fullName ?? "—"} ({a.createdBy?.role ?? "—"})
              </p>
              <p className="text-xs text-slate-600">
                Doctor: {a.clinician?.fullName ?? "Not assigned yet"}
              </p>
              {a.notes && <p className="mt-1 text-xs text-slate-500">Note: {a.notes}</p>}
            </li>
          ))}
          {rows.length === 0 && <li className="text-slate-500">No appointments yet.</li>}
        </ul>
      </DashCard>
    </div>
  );
}

function StaffAppointments() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianLite[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [when, setWhen] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [clinicianId, setClinicianId] = useState("");

  async function load() {
    const q = patient
      ? `/api/appointments?patientId=${encodeURIComponent(patient.id)}`
      : "/api/appointments";
    const r = await api<{ appointments: AppointmentRow[] }>(q);
    if (r.ok && "data" in r && r.data) setRows(r.data.appointments);
  }

  useEffect(() => {
    void load();
  }, [patient?.id]);

  useEffect(() => {
    void (async () => {
      const r = await api<{ clinicians: ClinicianLite[] }>("/api/providers/clinicians");
      if (r.ok && "data" in r && r.data) setClinicians(r.data.clinicians);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) {
      setErr("Select a patient first.");
      return;
    }
    setErr(null);
    setMsg(null);
    const body: Record<string, unknown> = {
      patientId: patient.id,
      title,
      facilityName,
      scheduledAt: new Date(when).toISOString(),
      notes: notes || undefined,
    };
    if (clinicianId) body.clinicianId = clinicianId;
    const r = await api<{ appointment: AppointmentRow }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setErr(r.error ?? "Failed");
      return;
    }
    setMsg("Appointment scheduled.");
    setTitle("");
    setFacilityName("");
    setNotes("");
    setClinicianId("");
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Appointments</h1>
      <p className="mt-1 text-sm text-slate-600">
        {user?.role === "CLINICIAN"
          ? "Schedule for a patient (defaults to you as doctor). Filter the list by selecting a patient."
          : "Schedule for any patient as admin."}
      </p>
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-4 text-sm text-emerald-800">{msg}</p>}

      <DashCard title="Schedule for patient" icon={<Calendar className="h-4 w-4 text-brand-600" />} className="mt-6">
        <form onSubmit={submit} className="grid gap-4">
          <PatientSearch onSelect={setPatient} />
          {patient && (
            <p className="text-sm text-slate-600">
              Selected: <span className="font-semibold text-slate-900">{patient.fullName}</span>
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Facility</label>
              <input
                required
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Date & time</label>
              <input
                type="datetime-local"
                required
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Assign clinician</label>
              <select
                value={clinicianId}
                onChange={(e) => setClinicianId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">
                  {user?.role === "CLINICIAN" ? "Me (default)" : "—"}
                </option>
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!patient}
                className="min-h-[48px] rounded-sm bg-brand-600 px-6 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </form>
      </DashCard>

      <DashCard title="List" icon={<Calendar className="h-4 w-4 text-brand-600" />} className="mt-6">
        <ul className="space-y-3 text-sm">
          {rows.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <p className="font-semibold text-slate-900">{a.title}</p>
              <p className="text-slate-600">{a.facilityName}</p>
              <p className="text-xs text-slate-500">
                {a.patient && `${a.patient.fullName} · `}
                {new Date(a.scheduledAt).toLocaleString()} · {a.status}
              </p>
              <p className="text-xs text-slate-600">
                By {a.createdBy?.fullName} · Dr {a.clinician?.fullName ?? "—"}
              </p>
            </li>
          ))}
          {rows.length === 0 && <li className="text-slate-500">No appointments in this view.</li>}
        </ul>
      </DashCard>
    </div>
  );
}
