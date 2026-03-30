import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, FlaskConical, Stethoscope, X } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";
import type { AppointmentRow } from "@/pages/dashboard/DashboardAppointmentsPage";
import { useAuth } from "@/auth/AuthContext";

const PREVIEW = 40;

type RecordRow = {
  id: string;
  title: string;
  summary: string;
  facilityName: string;
  visitDate: string;
  publishedAt?: string | null;
  authorId?: string | null;
  author?: { fullName: string } | null;
};

type LabRow = {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string | null;
  reportedAt: string;
  uploadedBy?: { fullName: string };
};

function AppointmentStatusRead({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "SCHEDULED")
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-900">
        Confirmed
      </span>
    );
  if (s === "REQUESTED")
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-950">
        Pending
      </span>
    );
  return <span className="text-xs text-slate-600">{status}</span>;
}

export function PatientChartPage() {
  const { user } = useAuth();
  const { patientId } = useParams();
  const [header, setHeader] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [facility, setFacility] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 16));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [apptNoteDraft, setApptNoteDraft] = useState<Record<string, string>>({});
  const [apptNoteSaving, setApptNoteSaving] = useState<string | null>(null);
  const [apptNoteMsg, setApptNoteMsg] = useState<string | null>(null);
  const [showAddVisitNote, setShowAddVisitNote] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    void (async () => {
      setLoadErr(null);
      const r = await api<{ patient: { id: string; fullName: string; email: string } }>(
        `/api/patients/${encodeURIComponent(patientId)}`
      );
      if (cancelled) return;
      if (!r.ok) {
        setLoadErr("error" in r ? r.error : "Request failed");
        setHeader(null);
        return;
      }
      if (!("data" in r) || !r.data?.patient) {
        setLoadErr("Patient not found");
        setHeader(null);
        return;
      }
      setHeader(r.data.patient);
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (!patientId || !header) {
      setRecords([]);
      setLabs([]);
      setAppointments([]);
      return;
    }
    const id = patientId;
    void (async () => {
      const [rRec, rLab, rApt] = await Promise.all([
        api<{ records: RecordRow[] }>(`/api/records?patientId=${encodeURIComponent(id)}`),
        api<{ results: LabRow[] }>(`/api/labs?patientId=${encodeURIComponent(id)}`),
        api<{ appointments: AppointmentRow[] }>(`/api/appointments?patientId=${encodeURIComponent(id)}`),
      ]);
      if (rRec.ok && "data" in rRec && rRec.data) setRecords(rRec.data.records);
      else setRecords([]);
      if (rLab.ok && "data" in rLab && rLab.data) setLabs(rLab.data.results);
      else setLabs([]);
      if (rApt.ok && "data" in rApt && rApt.data) setAppointments(rApt.data.appointments);
      else setAppointments([]);
    })();
  }, [patientId, header]);

  useEffect(() => {
    const n: Record<string, string> = {};
    for (const a of appointments) n[a.id] = a.notes ?? "";
    setApptNoteDraft(n);
  }, [appointments]);

  const recShow = useMemo(
    () => (expandAll ? records : records.slice(0, PREVIEW)),
    [records, expandAll]
  );
  const labShow = useMemo(() => (expandAll ? labs : labs.slice(0, PREVIEW)), [labs, expandAll]);
  const aptShow = useMemo(
    () => (expandAll ? appointments : appointments.slice(0, PREVIEW)),
    [appointments, expandAll]
  );

  const canAddStandaloneVisitNote = useMemo(() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    if (user.role !== "CLINICIAN") return false;
    return appointments.some(
      (a) => new Date(a.scheduledAt) <= new Date() && a.clinician?.id === user.id
    );
  }, [user, appointments]);

  const hasMore =
    records.length > PREVIEW || labs.length > PREVIEW || appointments.length > PREVIEW;

  function closeVisitNoteDialog() {
    setShowAddVisitNote(false);
    setErr(null);
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return;
    setErr(null);
    setMsg(null);
    const r = await api<{ record: { id: string } }>("/api/records", {
      method: "POST",
      body: JSON.stringify({
        patientId,
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
      setMsg("Queued offline — will sync when online.");
      setTitle("");
      setSummary("");
      setFacility("");
      closeVisitNoteDialog();
      return;
    }
    setTitle("");
    setSummary("");
    setFacility("");
    closeVisitNoteDialog();
    setMsg("Saved.");
    const list = await api<{ records: RecordRow[] }>(
      `/api/records?patientId=${encodeURIComponent(patientId)}`
    );
    if (list.ok && "data" in list && list.data) setRecords(list.data.records);
  }

  async function publishHealthRecord(recordId: string) {
    setErr(null);
    setMsg(null);
    const r = await api<{ record: RecordRow }>(
      `/api/records/${encodeURIComponent(recordId)}/publish`,
      { method: "POST", body: JSON.stringify({}) }
    );
    if (!r.ok) {
      setErr(r.error ?? "Could not publish");
      return;
    }
    setMsg("Visit note published — it is now locked and visible to the care team as final.");
    if (patientId) {
      const list = await api<{ records: RecordRow[] }>(
        `/api/records?patientId=${encodeURIComponent(patientId)}`
      );
      if (list.ok && "data" in list && list.data) setRecords(list.data.records);
    }
  }

  async function saveAppointmentNotes(appointmentId: string) {
    if (!patientId) return;
    setErr(null);
    setApptNoteMsg(null);
    setMsg(null);
    setApptNoteSaving(appointmentId);
    const r = await api<{ appointment: AppointmentRow }>(
      `/api/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes: apptNoteDraft[appointmentId] ?? "" }),
      },
    );
    setApptNoteSaving(null);
    if (!r.ok) {
      setErr(r.error ?? "Could not save");
      return;
    }
    setApptNoteMsg("Visit notes saved.");
    const list = await api<{ appointments: AppointmentRow[] }>(
      `/api/appointments?patientId=${encodeURIComponent(patientId)}`,
    );
    if (list.ok && "data" in list && list.data) setAppointments(list.data.appointments);
  }

  async function publishAppointmentNotes(appointmentId: string) {
    if (!patientId) return;
    setErr(null);
    setApptNoteMsg(null);
    setApptNoteSaving(appointmentId);
    const rSave = await api<{ appointment: AppointmentRow }>(
      `/api/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes: apptNoteDraft[appointmentId] ?? "" }),
      }
    );
    if (!rSave.ok) {
      setApptNoteSaving(null);
      setErr(rSave.error ?? "Could not save");
      return;
    }
    const rPub = await api<{ appointment: AppointmentRow }>(
      `/api/appointments/${encodeURIComponent(appointmentId)}/publish-notes`,
      { method: "POST", body: JSON.stringify({}) }
    );
    setApptNoteSaving(null);
    if (!rPub.ok) {
      setErr(rPub.error ?? "Could not publish");
      return;
    }
    setApptNoteMsg("Visit notes published and locked.");
    const list = await api<{ appointments: AppointmentRow[] }>(
      `/api/appointments?patientId=${encodeURIComponent(patientId)}`,
    );
    if (list.ok && "data" in list && list.data) setAppointments(list.data.appointments);
  }

  if (!patientId) {
    return <p className="text-sm text-slate-600">No patient selected.</p>;
  }

  if (loadErr) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm text-red-800">{loadErr}</p>
        <Link to="/dashboard/patients" className="mt-4 inline-block text-sm font-semibold text-[#0059B3]">
          ← Patient search
        </Link>
      </div>
    );
  }

  if (!header) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-slate-600">Loading chart…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Patient chart</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {header.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{header.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/patients"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            ← All patients
          </Link>
          {!showAddVisitNote && canAddStandaloneVisitNote && (
            <button
              type="button"
              onClick={() => {
                setMsg(null);
                setShowAddVisitNote(true);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Add visit note
            </button>
          )}
        </div>
      </div>

      {!canAddStandaloneVisitNote && user?.role === "CLINICIAN" && (
        <p className="mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <strong>Add visit note</strong> appears after you have a <strong>scheduled visit</strong> with this patient
          whose date and time have passed. Until then, use the appointment list below once the visit time arrives.
        </p>
      )}

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
        <strong>Medical records</strong> are clinical visit summaries written by clinicians (diagnoses, plan,
        narrative). <strong>Lab results</strong> are structured test rows and file reports uploaded by the laboratory.
        Appointment blocks tie notes to a specific booked visit — publish when final to lock them.
      </p>

      {msg && !showAddVisitNote && (
        <p className="mt-4 rounded-lg border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </p>
      )}

      {showAddVisitNote && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visit-note-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeVisitNoteDialog();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="visit-note-dialog-title" className="font-display text-lg font-semibold text-slate-900">
                  Add visit note
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">{header.fullName}</p>
              </div>
              <button
                type="button"
                onClick={closeVisitNoteDialog}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addRecord} className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="chart-visit-t">
                  Title
                </label>
                <input
                  id="chart-visit-t"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="chart-visit-s">
                  Summary
                </label>
                <textarea
                  id="chart-visit-s"
                  required
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="chart-visit-f">
                    Facility
                  </label>
                  <input
                    id="chart-visit-f"
                    required
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="chart-visit-v">
                    Visit date
                  </label>
                  <input
                    id="chart-visit-v"
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeVisitNoteDialog}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-lg bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  Save visit note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DashCard title="Medical records (visit notes)" icon={<Stethoscope className="h-5 w-5 text-brand-600" />} className="mt-8">
        <p className="mb-4 text-xs text-slate-600">
          Chronological notes from clinics — not the same as lab rows below. Drafts can be edited by the author
          until you <strong>publish</strong>; then everyone sees them read-only.
        </p>
        <ul className="space-y-3">
          {recShow.map((rec) => {
            const published = !!rec.publishedAt;
            const isAuthor = user?.id && rec.authorId === user.id;
            const canPublish =
              user && !published && (isAuthor || user.role === "ADMIN");
            return (
              <li key={rec.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{rec.title}</p>
                  {published ? (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-slate-600">{rec.summary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {rec.facilityName} · {new Date(rec.visitDate).toLocaleString()}
                  {rec.author?.fullName && ` · ${rec.author.fullName}`}
                </p>
                {canPublish && (
                  <button
                    type="button"
                    onClick={() => void publishHealthRecord(rec.id)}
                    className="mt-2 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    Publish & lock
                  </button>
                )}
                {!published && !isAuthor && user?.role !== "ADMIN" && rec.author?.fullName && (
                  <p className="mt-1 text-xs text-slate-500">View only — only the author can edit or publish.</p>
                )}
              </li>
            );
          })}
          {records.length === 0 && <li className="text-sm text-slate-500">No visit notes yet.</li>}
        </ul>
      </DashCard>

      <DashCard title="Lab results" icon={<FlaskConical className="h-5 w-5 text-brand-600" />} className="mt-8">
        <p className="mb-4 text-xs text-slate-600">
          Quantitative tests from the lab (code, value, unit). For narrative care, use medical records above — not
          this list.
        </p>
        <ul className="space-y-3">
          {labShow.map((l) => (
            <li key={l.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-900">{l.testName}</span>
              <span className="text-slate-700">
                {" "}
                {l.value} {l.unit}
              </span>
              {l.referenceRange && <span className="text-xs text-slate-500"> (ref {l.referenceRange})</span>}
              <p className="text-xs text-slate-500">
                {new Date(l.reportedAt).toLocaleString()}
                {l.uploadedBy?.fullName && ` · ${l.uploadedBy.fullName}`}
              </p>
            </li>
          ))}
          {labs.length === 0 && <li className="text-sm text-slate-500">No lab results.</li>}
        </ul>
      </DashCard>

      <DashCard title="Appointments" icon={<Calendar className="h-5 w-5 text-brand-600" />} className="mt-8">
        <p className="mb-4 text-xs text-slate-600">
          Notes here belong to the booked visit. They unlock after the <strong>scheduled time</strong>. Only the
          assigned clinician (or an admin) can edit; <strong>Publish & lock</strong> freezes them for everyone.
        </p>
        {apptNoteMsg && <p className="mb-3 text-sm text-emerald-800">{apptNoteMsg}</p>}
        <ul className="space-y-4">
          {aptShow.map((a) => {
            const visitReached = new Date(a.scheduledAt) <= new Date();
            const notesLocked = !!a.notesPublishedAt;
            const assignedId = a.clinician?.id;
            const canEditApptNotes =
              user &&
              !notesLocked &&
              visitReached &&
              (user.role === "ADMIN" || user.id === assignedId);
            return (
              <li key={a.id} className="rounded-lg border border-slate-100 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-slate-600">{a.facilityName}</p>
                  </div>
                  <AppointmentStatusRead status={a.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{new Date(a.scheduledAt).toLocaleString()}</p>
                <p className="text-xs text-slate-600">Dr {a.clinician?.fullName ?? "—"}</p>
                {notesLocked && (
                  <p className="mt-2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                    Visit notes published — read-only.
                  </p>
                )}
                {!visitReached && (user?.role === "ADMIN" || user?.id === assignedId) && (
                  <p className="mt-2 text-[11px] text-amber-800">Notes unlock after this visit time.</p>
                )}
                {visitReached && !notesLocked && assignedId && user?.id !== assignedId && user?.role !== "ADMIN" && (
                  <p className="mt-2 text-[11px] text-slate-600">View only — assigned clinician may edit.</p>
                )}
                <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor={`notes-${a.id}`}>
                  Visit notes (this appointment)
                </label>
                {canEditApptNotes ? (
                  <textarea
                    id={`notes-${a.id}`}
                    rows={3}
                    value={apptNoteDraft[a.id] ?? ""}
                    onChange={(e) =>
                      setApptNoteDraft((prev) => ({ ...prev, [a.id]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Draft notes — save, then publish when final…"
                  />
                ) : (
                  <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                    {(apptNoteDraft[a.id] ?? "").trim() || "—"}
                  </p>
                )}
                {canEditApptNotes && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={apptNoteSaving === a.id}
                      onClick={() => void saveAppointmentNotes(a.id)}
                      className="rounded-md border border-brand-600/40 bg-white px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      {apptNoteSaving === a.id ? "Saving…" : "Save draft"}
                    </button>
                    <button
                      type="button"
                      disabled={apptNoteSaving === a.id}
                      onClick={() => void publishAppointmentNotes(a.id)}
                      className="rounded-md bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      Publish & lock
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {appointments.length === 0 && (
            <li className="space-y-3 text-sm text-slate-500">
              <p>No appointments for this patient.</p>
              {canAddStandaloneVisitNote && (
                <button
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    setShowAddVisitNote(true);
                  }}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Add visit note
                </button>
              )}
            </li>
          )}
        </ul>
      </DashCard>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpandAll((v) => !v)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {expandAll ? "Show less (preview)" : "Show full history (all rows)"}
          </button>
        </div>
      )}
    </div>
  );
}
