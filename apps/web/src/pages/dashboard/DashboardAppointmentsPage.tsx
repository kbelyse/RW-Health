import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ListFilter, Trash2, UserPlus, X } from "lucide-react";
import { api } from "@/api/client";
import {
  generateDaySlotIsoListWithOptionalBreak,
  generateWeeklySlotIsoList,
  parseBulkSlotLines,
  type DaySchedule,
} from "@/lib/slotGenerator";
import { useAuth } from "@/auth/AuthContext";
import { DashCard } from "@/components/dashboard/DashboardShell";
import { PatientSearch, type PatientLite } from "@/pages/dashboards/PatientSearch";
import {
  PatientCalendarWeek,
  type CalendarViewFilter,
} from "@/components/scheduling/PatientCalendarWeek";
import { MiniMonthCalendar } from "@/components/scheduling/MiniMonthCalendar";
import {
  ClinicianCalendarWeek,
  type StaffBookingDetail,
} from "@/components/scheduling/ClinicianCalendarWeek";
import { StaffTimeGrid } from "@/components/scheduling/StaffTimeGrid";
import {
  isoToDatetimeLocalValue,
  minuteKeyFromIso,
  dateKeyLocal,
  weekOffsetForDayContaining,
  addDays,
  startOfWeekMonday,
} from "@/components/scheduling/calendarUtils";

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

export type ClinicianSlotRow = {
  id: string;
  facilityName: string;
  title: string;
  startAt: string;
  clinician?: { id: string; fullName: string; email: string };
};

function defaultPerDay(): Record<number, DaySchedule> {
  return {
    0: { enabled: false, start: "09:00", end: "17:00" },
    1: { enabled: true, start: "09:00", end: "12:00" },
    2: { enabled: true, start: "09:00", end: "12:00" },
    3: { enabled: true, start: "09:00", end: "12:00" },
    4: { enabled: true, start: "14:00", end: "18:00" },
    5: { enabled: true, start: "09:00", end: "12:00" },
    6: { enabled: false, start: "09:00", end: "17:00" },
  };
}

const WEEKDAY_ROWS: { dow: number; label: string }[] = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
  { dow: 0, label: "Sun" },
];

function sameClockMinute(isoA: string, localWhen: string): boolean {
  const a = new Date(isoA).getTime();
  const b = new Date(localWhen).getTime();
  return Math.floor(a / 60000) === Math.floor(b / 60000);
}

function AppointmentStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "SCHEDULED") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
        Confirmed
      </span>
    );
  }
  if (s === "REQUESTED") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950">
        Pending
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
      {status}
    </span>
  );
}

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
  const [filterClinicianId, setFilterClinicianId] = useState("");
  const [doctorSort, setDoctorSort] = useState<"az" | "za">("az");
  const [patientWeekOffset, setPatientWeekOffset] = useState(0);
  const [sidebarMonth, setSidebarMonth] = useState(() => new Date());
  const [calOpen, setCalOpen] = useState<ClinicianSlotRow[]>([]);
  const [calUnavail, setCalUnavail] = useState<{ startAt: string }[]>([]);
  const [calMine, setCalMine] = useState<{ appointmentId: string; startAt: string }[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingNote, setBookingNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [calendarViewFilter, setCalendarViewFilter] = useState<CalendarViewFilter>("all");
  const pendingJumpToFirstOpenRef = useRef(false);

  const sortedClinicians = useMemo(() => {
    const list = [...clinicians];
    list.sort((a, b) =>
      doctorSort === "az"
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName),
    );
    return list;
  }, [clinicians, doctorSort]);

  const activityKeys = useMemo(() => {
    const s = new Set<string>();
    for (const x of calOpen) s.add(dateKeyLocal(new Date(x.startAt)));
    for (const x of calUnavail) s.add(dateKeyLocal(new Date(x.startAt)));
    for (const x of calMine) s.add(dateKeyLocal(new Date(x.startAt)));
    for (const a of rows) s.add(dateKeyLocal(new Date(a.scheduledAt)));
    return s;
  }, [calOpen, calUnavail, calMine, rows]);

  const visitsSorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [rows],
  );

  async function loadApts() {
    const r = await api<{ appointments: AppointmentRow[] }>("/api/appointments");
    if (r.ok && "data" in r && r.data) setRows(r.data.appointments);
  }

  async function loadCalendar() {
    const ws = addDays(startOfWeekMonday(new Date()), patientWeekOffset * 7);
    const we = addDays(ws, 7);
    const from = new Date(ws);
    from.setDate(from.getDate() - 21);
    from.setHours(0, 0, 0, 0);
    const to = new Date(we);
    to.setDate(to.getDate() + 21);
    to.setHours(23, 59, 59, 999);
    const q = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    if (filterClinicianId) q.set("clinicianId", filterClinicianId);
    const r = await api<{
      openSlots: ClinicianSlotRow[];
      unavailableBlocks: { startAt: string }[];
      myVisits: { appointmentId: string; startAt: string }[];
    }>(`/api/clinician-slots/calendar?${q.toString()}`);
    if (!r.ok || !("data" in r) || !r.data) {
      setCalOpen([]);
      setCalUnavail([]);
      setCalMine([]);
      return;
    }
    setCalOpen(r.data.openSlots);
    setCalUnavail(r.data.unavailableBlocks);
    setCalMine(r.data.myVisits);
  }

  useEffect(() => {
    void (async () => {
      const r = await api<{ clinicians: ClinicianLite[] }>("/api/providers/clinicians");
      if (r.ok && "data" in r && r.data) setClinicians(r.data.clinicians);
    })();
  }, []);

  useEffect(() => {
    void loadApts();
  }, []);

  useEffect(() => {
    void loadCalendar();
  }, [filterClinicianId, patientWeekOffset]);

  useEffect(() => {
    if (calendarViewFilter !== "open" || !pendingJumpToFirstOpenRef.current) return;
    const now = Date.now();
    const future = calOpen.filter((s) => new Date(s.startAt).getTime() >= now);
    if (future.length === 0) {
      if (calOpen.length > 0) pendingJumpToFirstOpenRef.current = false;
      return;
    }
    future.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const target = weekOffsetForDayContaining(new Date(future[0].startAt));
    setPatientWeekOffset(target);
    pendingJumpToFirstOpenRef.current = false;
  }, [calendarViewFilter, calOpen]);

  useEffect(() => {
    setSelectedSlotId(null);
  }, [filterClinicianId, patientWeekOffset]);

  async function bookSlot() {
    const slotId = selectedSlotId;
    if (!slotId) {
      setErr("Pick an open time, then confirm below.");
      return;
    }
    setErr(null);
    setMsg(null);
    setSelectedSlotId(slotId);
    setBookingId(slotId);
    const r = await api<{ appointment: AppointmentRow }>(
      `/api/clinician-slots/${encodeURIComponent(slotId)}/book`,
      {
        method: "POST",
        body: JSON.stringify({ notes: bookingNote.trim() || undefined }),
      },
    );
    setBookingId(null);
    if (!r.ok) {
      setErr("error" in r ? r.error : "Could not book");
      return;
    }
    setMsg("Booked.");
    setBookingNote("");
    setSelectedSlotId(null);
    await loadApts();
    await loadCalendar();
  }

  const hasOpenInWeek = useMemo(() => {
    const ws = addDays(startOfWeekMonday(new Date()), patientWeekOffset * 7);
    const startMs = new Date(ws);
    startMs.setHours(0, 0, 0, 0);
    const endMs = addDays(startMs, 7).getTime();
    return calOpen.some((s) => {
      const t = new Date(s.startAt).getTime();
      return t >= startMs.getTime() && t < endMs;
    });
  }, [calOpen, patientWeekOffset]);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Scheduling</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Appointments</h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        Tap an open time, confirm below. Calendar or Prev/Next changes the week. Open only jumps to the first week
        with availability.
      </p>
      {err && <p className="mt-6 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-6 text-sm text-emerald-800">{msg}</p>}

      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="relative z-0 flex w-full max-w-full shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#004a99] to-[#003d7a] p-4 text-white shadow-lg lg:sticky lg:top-24 lg:w-72 lg:self-start">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="filter-doc">
              Doctor
            </label>
            <select
              id="filter-doc"
              value={filterClinicianId}
              onChange={(e) => setFilterClinicianId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none ring-offset-[#003d7a] focus:ring-2 focus:ring-white/40"
            >
              <option value="" className="text-slate-900">
                All doctors
              </option>
              {sortedClinicians.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900">
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="sort-doc">
              Sort order
            </label>
            <select
              id="sort-doc"
              value={doctorSort}
              onChange={(e) => setDoctorSort(e.target.value as "az" | "za")}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="az" className="text-slate-900">
                Name A–Z
              </option>
              <option value="za" className="text-slate-900">
                Name Z–A
              </option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="cal-filter">
              Week view
            </label>
            <select
              id="cal-filter"
              value={calendarViewFilter}
              onChange={(e) => {
                const v = e.target.value as CalendarViewFilter;
                if (v !== "open") pendingJumpToFirstOpenRef.current = false;
                if (v === "open") pendingJumpToFirstOpenRef.current = true;
                setCalendarViewFilter(v);
              }}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="all" className="text-slate-900">
                Everything
              </option>
              <option value="open" className="text-slate-900">
                Open only
              </option>
              <option value="mine" className="text-slate-900">
                Your visits only
              </option>
            </select>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs leading-relaxed text-white/90">
            <p className="font-bold text-white">Legend</p>
            <p className="mt-2 text-emerald-200/95">Open — bookable</p>
            <p className="mt-1 text-slate-200">Taken — someone else</p>
            <p className="mt-1 text-sky-200">Your visits</p>
          </div>
          <MiniMonthCalendar
            month={sidebarMonth}
            onMonthChange={setSidebarMonth}
            activityKeys={activityKeys}
            onPickDay={(d) => {
              setSidebarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              setPatientWeekOffset(weekOffsetForDayContaining(d));
            }}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <DashCard title="Your calendar" icon={<Calendar className="h-5 w-5 text-brand-600" />}>
            {calendarViewFilter === "mine" && (
              <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Week view is visits only—switch to Everything or Open only to book.
              </p>
            )}
            <p className="mb-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{calOpen.length}</span> open slot
              {calOpen.length === 1 ? "" : "s"} ahead.
            </p>
            <PatientCalendarWeek
              weekOffset={patientWeekOffset}
              onWeekOffsetChange={setPatientWeekOffset}
              openSlots={calOpen}
              unavailableBlocks={calUnavail}
              myVisits={calMine}
              selectedSlotId={selectedSlotId}
              onSelectOpenSlot={setSelectedSlotId}
              viewFilter={calendarViewFilter}
            />
            {!hasOpenInWeek && calendarViewFilter !== "mine" && (
              <p className="mt-3 text-sm text-slate-600">No open times this week—try another week or check back later.</p>
            )}
            <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <label className="text-sm font-medium text-slate-700" htmlFor="book-note">
                Note (optional)
              </label>
              <textarea
                id="book-note"
                rows={2}
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                disabled={!selectedSlotId || bookingId !== null}
                onClick={() => void bookSlot()}
                className="min-h-[44px] rounded-md border border-brand-600 bg-white px-5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
              >
                {bookingId ? "Booking…" : "Confirm booking"}
              </button>
            </div>
          </DashCard>

          <DashCard title="Your visits" icon={<Calendar className="h-5 w-5 text-brand-600" />}>
            <p className="text-sm text-slate-600">
              <strong>Confirmed</strong> is the usual status after you book. <strong>Pending</strong> is rare
              (clinic-initiated).
            </p>
            <ul className="mt-6 space-y-4">
              {visitsSorted.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-slate-100 bg-white px-3 py-3 text-sm shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <AppointmentStatusBadge status={a.status} />
                  </div>
                  <p className="text-slate-600">{a.facilityName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(a.scheduledAt).toLocaleString()} · With {a.clinician?.fullName ?? "—"}
                  </p>
                  {a.notes && <p className="mt-2 text-xs text-slate-500">{a.notes}</p>}
                </li>
              ))}
              {visitsSorted.length === 0 && (
                <li className="text-sm text-slate-500">No visits yet.</li>
              )}
            </ul>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

function StaffAppointments() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [allRows, setAllRows] = useState<AppointmentRow[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianLite[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [when, setWhen] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [clinicianId, setClinicianId] = useState("");
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);
  const [slotFac, setSlotFac] = useState("");
  const [slotTitle, setSlotTitle] = useState("Visit");
  const [slotClinicianId, setSlotClinicianId] = useState("");
  const [slotErr, setSlotErr] = useState<string | null>(null);
  const [slotMsg, setSlotMsg] = useState<string | null>(null);
  const [slotTab, setSlotTab] = useState<"calendar" | "bulk" | "week">("calendar");
  const [calWeekOffset, setCalWeekOffset] = useState(0);
  const [staffSidebarMonth, setStaffSidebarMonth] = useState(() => new Date());
  const [publishDayDialog, setPublishDayDialog] = useState<Date | null>(null);
  const [publishDialogWhen, setPublishDialogWhen] = useState("");
  const [publishDialogMode, setPublishDialogMode] = useState<"single" | "fillDay">("single");
  const [publishFillStart, setPublishFillStart] = useState("09:00");
  const [publishFillEnd, setPublishFillEnd] = useState("17:00");
  const [publishFillSlotMinutes, setPublishFillSlotMinutes] = useState(30);
  const [publishFillBreakStart, setPublishFillBreakStart] = useState("");
  const [publishFillBreakEnd, setPublishFillBreakEnd] = useState("");
  const [schedulePatientOpen, setSchedulePatientOpen] = useState(false);
  const [openSlotDialog, setOpenSlotDialog] = useState<ClinicianSlotRow | null>(null);
  const [bookingDialog, setBookingDialog] = useState<StaffBookingDetail | null>(null);
  const [bookingNotesDraft, setBookingNotesDraft] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [weekFrom, setWeekFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [weekTo, setWeekTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [perDay, setPerDay] = useState<Record<number, DaySchedule>>(defaultPerDay);
  const [weekSlotMinutes, setWeekSlotMinutes] = useState(30);
  const [staffCalOpen, setStaffCalOpen] = useState<ClinicianSlotRow[]>([]);
  const [staffCalBookings, setStaffCalBookings] = useState<StaffBookingDetail[]>([]);
  const [calViewFilter, setCalViewFilter] = useState<"all" | "open" | "booked">("all");
  const [calPatientFilter, setCalPatientFilter] = useState("");

  const effectiveClinicianId =
    clinicianId || (user?.role === "CLINICIAN" ? user.id : "");

  const staffViewCid = useMemo(() => {
    if (user?.role === "CLINICIAN") return user.id;
    if (user?.role === "ADMIN") return slotClinicianId || clinicianId || "";
    return "";
  }, [user?.role, user?.id, slotClinicianId, clinicianId]);

  const clinicianBooked = useMemo(() => {
    if (!effectiveClinicianId) return [];
    return allRows
      .filter((a) => a.clinician?.id === effectiveClinicianId)
      .sort((x, y) => new Date(x.scheduledAt).getTime() - new Date(y.scheduledAt).getTime());
  }, [allRows, effectiveClinicianId]);

  const staffActivityKeys = useMemo(() => {
    const s = new Set<string>();
    for (const x of staffCalOpen) s.add(dateKeyLocal(new Date(x.startAt)));
    for (const x of staffCalBookings) s.add(dateKeyLocal(new Date(x.startAt)));
    return s;
  }, [staffCalOpen, staffCalBookings]);

  const staffWeekCounts = useMemo(() => {
    const ws = addDays(startOfWeekMonday(new Date()), calWeekOffset * 7);
    const startMs = new Date(ws);
    startMs.setHours(0, 0, 0, 0);
    const endMs = addDays(startMs, 7).getTime();
    return {
      open: staffCalOpen.filter((s) => {
        const t = new Date(s.startAt).getTime();
        return t >= startMs.getTime() && t < endMs;
      }).length,
      booked: staffCalBookings.filter((b) => {
        const t = new Date(b.startAt).getTime();
        return t >= startMs.getTime() && t < endMs;
      }).length,
    };
  }, [staffCalOpen, staffCalBookings, calWeekOffset]);

  const calendarDisplayOpen = useMemo(() => {
    if (calViewFilter === "booked") return [];
    return staffCalOpen;
  }, [staffCalOpen, calViewFilter]);

  const calendarDisplayBookings = useMemo(() => {
    if (calViewFilter === "open") return [];
    let list = staffCalBookings;
    const q = calPatientFilter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.patientName.toLowerCase().includes(q) ||
          (b.title && b.title.toLowerCase().includes(q))
      );
    }
    return list;
  }, [staffCalBookings, calViewFilter, calPatientFilter]);

  const calPatientSuggestions = useMemo(() => {
    const s = new Set<string>();
    for (const b of staffCalBookings) {
      const n = b.patientName.trim();
      if (n) s.add(n);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [staffCalBookings]);

  const staffWeekDisplayCounts = useMemo(() => {
    const ws = addDays(startOfWeekMonday(new Date()), calWeekOffset * 7);
    const startMs = new Date(ws);
    startMs.setHours(0, 0, 0, 0);
    const endMs = addDays(startMs, 7).getTime();
    const inWeek = (iso: string) => {
      const t = new Date(iso).getTime();
      return t >= startMs.getTime() && t < endMs;
    };
    return {
      open: calendarDisplayOpen.filter((s) => inWeek(s.startAt)).length,
      booked: calendarDisplayBookings.filter((b) => inWeek(b.startAt)).length,
    };
  }, [calendarDisplayOpen, calendarDisplayBookings, calWeekOffset]);

  const scheduleBusyMinuteKeys = useMemo(() => {
    const set = new Set<number>();
    if (!effectiveClinicianId) return set;
    for (const a of clinicianBooked) {
      set.add(minuteKeyFromIso(a.scheduledAt));
    }
    return set;
  }, [clinicianBooked, effectiveClinicianId]);

  const slotTaken = useMemo(() => {
    if (!effectiveClinicianId || !patient) return false;
    return clinicianBooked.some((a) => sameClockMinute(a.scheduledAt, when));
  }, [clinicianBooked, when, effectiveClinicianId, patient]);

  async function load() {
    const rAll = await api<{ appointments: AppointmentRow[] }>("/api/appointments");
    if (rAll.ok && "data" in rAll && rAll.data) setAllRows(rAll.data.appointments);
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

  async function loadStaffCalendar() {
    if (!staffViewCid) {
      setStaffCalOpen([]);
      setStaffCalBookings([]);
      return;
    }
    const ws = addDays(startOfWeekMonday(new Date()), calWeekOffset * 7);
    const we = addDays(ws, 7);
    const from = new Date(ws);
    from.setDate(from.getDate() - 14);
    from.setHours(0, 0, 0, 0);
    const to = new Date(we);
    to.setDate(to.getDate() + 14);
    to.setHours(23, 59, 59, 999);
    const q = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    if (user?.role === "ADMIN") q.set("clinicianId", staffViewCid);
    const r = await api<{
      openSlots: ClinicianSlotRow[];
      staffBookings: StaffBookingDetail[];
    }>(`/api/clinician-slots/calendar?${q.toString()}`);
    if (r.ok && "data" in r && r.data) {
      setStaffCalOpen(r.data.openSlots);
      setStaffCalBookings(r.data.staffBookings);
    }
  }

  useEffect(() => {
    void loadStaffCalendar();
  }, [staffViewCid, calWeekOffset, user?.role]);

  useEffect(() => {
    if (publishDayDialog) {
      setPublishDialogMode("single");
      setPublishFillStart("09:00");
      setPublishFillEnd("17:00");
      setPublishFillSlotMinutes(30);
      setPublishFillBreakStart("");
      setPublishFillBreakEnd("");
    }
  }, [publishDayDialog]);

  function patchPerDay(dow: number, patch: Partial<DaySchedule>) {
    setPerDay((prev) => ({
      ...prev,
      [dow]: { ...prev[dow], ...patch },
    }));
  }

  async function publishOneSlot(iso: string) {
    setSlotErr(null);
    setSlotMsg(null);
    if (user?.role === "ADMIN" && !slotClinicianId) {
      setSlotErr("Choose a clinician.");
      return;
    }
    const body: Record<string, unknown> = {
      facilityName: slotFac.trim() || undefined,
      title: slotTitle.trim() || "Visit",
      startAt: iso,
    };
    if (user?.role === "ADMIN") body.clinicianId = slotClinicianId;
    const r = await api<{ slot: { id: string } }>("/api/clinician-slots", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setSlotErr(r.error ?? "Failed");
      return;
    }
    setSlotMsg("Published.");
    setPublishDayDialog(null);
    await loadStaffCalendar();
  }

  async function saveBookingNotes() {
    if (!bookingDialog) return;
    setSlotErr(null);
    const r = await api<{ appointment: AppointmentRow }>(
      `/api/appointments/${encodeURIComponent(bookingDialog.appointmentId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ notes: bookingNotesDraft }),
      },
    );
    if (!r.ok) {
      setSlotErr(r.error ?? "Could not save notes");
      return;
    }
    setSlotMsg("Visit notes saved.");
    setBookingDialog(null);
    await load();
    await loadStaffCalendar();
  }

  async function removeSlot(id: string) {
    setSlotErr(null);
    const r = await api(`/api/clinician-slots/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!r.ok) {
      setSlotErr(r.error ?? "Failed");
      return;
    }
    setOpenSlotDialog(null);
    await loadStaffCalendar();
  }

  const weekPreviewCount = useMemo(() => {
    const list = generateWeeklySlotIsoList({
      dateFrom: weekFrom,
      dateTo: weekTo,
      perDay,
      slotMinutes: weekSlotMinutes,
    });
    return list.length;
  }, [weekFrom, weekTo, perDay, weekSlotMinutes]);

  async function publishSlotsBulk(isoList: string[]): Promise<boolean> {
    setSlotErr(null);
    setSlotMsg(null);
    if (isoList.length === 0) {
      setSlotErr("No future slots to publish.");
      return false;
    }
    if (isoList.length > 200) {
      setSlotErr("Maximum 200 slots per batch. Split the range or use fewer slots.");
      return false;
    }
    const body: Record<string, unknown> = {
      facilityName: slotFac.trim() || undefined,
      title: slotTitle.trim() || "Visit",
      startAtList: isoList,
    };
    if (user?.role === "ADMIN") {
      if (!slotClinicianId) {
        setSlotErr("Choose a clinician.");
        return false;
      }
      body.clinicianId = slotClinicianId;
    }
    const r = await api<{ created: number; skipped: number }>("/api/clinician-slots/bulk", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setSlotErr(r.error ?? "Failed");
      return false;
    }
    if ("data" in r && r.data) {
      setSlotMsg(`Published ${r.data.created} slot(s). ${r.data.skipped > 0 ? `${r.data.skipped} skipped (past time or conflict).` : ""}`);
    }
    return true;
  }

  async function publishFillDayFromDialog() {
    if (!publishDayDialog) return;
    if (user?.role === "ADMIN" && !slotClinicianId) {
      setSlotErr("Choose a clinician.");
      return;
    }
    const list = generateDaySlotIsoListWithOptionalBreak(
      publishDayDialog,
      publishFillStart,
      publishFillEnd,
      publishFillSlotMinutes,
      publishFillBreakStart,
      publishFillBreakEnd,
    );
    if (list.length === 0) {
      setSlotErr("No future slots in that window. Adjust start/end times (end must be after start).");
      return;
    }
    if (list.length > 200) {
      setSlotErr(
        `That range would create ${list.length} slots (max 200). Shorten the day or use a longer interval.`,
      );
      return;
    }
    const ok = await publishSlotsBulk(list);
    if (ok) {
      setPublishDayDialog(null);
      await loadStaffCalendar();
    }
  }

  async function submitBulk(e: React.FormEvent) {
    e.preventDefault();
    const list = parseBulkSlotLines(bulkText);
    if (list.length === 0) {
      setSlotErr("Add at least one valid date/time (one per line).");
      return;
    }
    if (list.length > 200) {
      setSlotErr("Maximum 200 slots per batch. Split into multiple uploads.");
      return;
    }
    const ok = await publishSlotsBulk(list);
    if (ok) {
      setBulkText("");
      await loadStaffCalendar();
    }
  }

  async function submitWeek(e: React.FormEvent) {
    e.preventDefault();
    setSlotErr(null);
    setSlotMsg(null);
    const anyDay = Object.values(perDay).some((d) => d.enabled);
    if (!anyDay) {
      setSlotErr("Turn on at least one day and set start/end times.");
      return;
    }
    const list = generateWeeklySlotIsoList({
      dateFrom: weekFrom,
      dateTo: weekTo,
      perDay,
      slotMinutes: weekSlotMinutes,
    });
    if (list.length === 0) {
      setSlotErr("No future slots in that range. Check dates and times.");
      return;
    }
    if (list.length > 200) {
      setSlotErr(`That pattern creates ${list.length} slots. Narrow the range or use bulk paste (max 200 per save).`);
      return;
    }
    const ok = await publishSlotsBulk(list);
    if (ok) await loadStaffCalendar();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) {
      setErr("Select a patient first.");
      return;
    }
    if (slotTaken) {
      setErr("That time is already booked for this clinician. Choose another slot.");
      return;
    }
    setErr(null);
    setMsg(null);
    const body: Record<string, unknown> = {
      patientId: patient.id,
      title,
      facilityName: facilityName.trim() || undefined,
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
    setMsg("Scheduled.");
    setTitle("");
    setFacilityName("");
    setNotes("");
    setClinicianId("");
    setSchedulePatientOpen(false);
    await load();
    await loadStaffCalendar();
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Scheduling</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Appointments</h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        {user?.role === "CLINICIAN"
          ? "Use the week calendar to publish open slots and review bookings. Use Schedule for patient in the sidebar only when you need to book someone for a specific time."
          : "Pick a clinician, then use the week calendar. Schedule for patient in the sidebar opens a form when you need to book a visit."}
      </p>
      {err && <p className="mt-6 text-sm text-red-600">{err}</p>}
      {msg && <p className="mt-6 text-sm text-emerald-800">{msg}</p>}

      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="relative z-0 flex w-full max-w-full shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#004a99] to-[#003d7a] p-4 text-white shadow-lg lg:sticky lg:top-24 lg:w-72 lg:self-start">
          {user?.role === "ADMIN" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="staff-clinician">
                Clinician
              </label>
              <select
                id="staff-clinician"
                required
                value={slotClinicianId}
                onChange={(e) => setSlotClinicianId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none ring-offset-[#003d7a] focus:ring-2 focus:ring-white/40"
              >
                <option value="" className="text-slate-900">
                  Select
                </option>
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900">
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="staff-slot-title">
              Visit title
            </label>
            <input
              id="staff-slot-title"
              required
              value={slotTitle}
              onChange={(e) => setSlotTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none ring-offset-[#003d7a] focus:ring-2 focus:ring-white/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="staff-slot-fac">
              Facility (optional)
            </label>
            <input
              id="staff-slot-fac"
              value={slotFac}
              onChange={(e) => setSlotFac(e.target.value)}
              placeholder="e.g. Main clinic"
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none ring-offset-[#003d7a] focus:ring-2 focus:ring-white/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-white/70" htmlFor="staff-pub-mode">
              Publish mode
            </label>
            <select
              id="staff-pub-mode"
              value={slotTab}
              onChange={(e) => setSlotTab(e.target.value as "calendar" | "bulk" | "week")}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="calendar" className="text-slate-900">
                Week calendar
              </option>
              <option value="bulk" className="text-slate-900">
                Paste many
              </option>
              <option value="week" className="text-slate-900">
                Weekly pattern
              </option>
            </select>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs leading-relaxed text-white/90">
            <p className="font-bold text-white">Legend</p>
            <p className="mt-2 text-emerald-200/95">Open — you publish</p>
            <p className="mt-1 text-slate-200">Booked — patient visit (tap for details)</p>
          </div>
          <MiniMonthCalendar
            month={staffSidebarMonth}
            onMonthChange={setStaffSidebarMonth}
            activityKeys={staffActivityKeys}
            onPickDay={(d) => {
              setStaffSidebarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              setCalWeekOffset(weekOffsetForDayContaining(d));
            }}
          />
          {(user?.role === "CLINICIAN" || slotClinicianId) && (
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMsg(null);
                setSchedulePatientOpen(true);
              }}
              className="flex w-full items-start gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-left transition hover:bg-white/15"
            >
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
              <span>
                <span className="block text-sm font-semibold text-white">Schedule for patient</span>
                <span className="mt-0.5 block text-[11px] font-normal leading-snug text-white/75">
                  Only when you need to book a visit — not required for publishing slots on the calendar.
                </span>
              </span>
            </button>
          )}
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {slotErr && <p className="text-sm text-red-600">{slotErr}</p>}
          {slotMsg && <p className="text-sm text-emerald-800">{slotMsg}</p>}

          {slotTab === "calendar" && (
            <>
              {user?.role === "ADMIN" && !slotClinicianId ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  Select a clinician in the sidebar to load your calendar.
                </p>
              ) : (
                <DashCard title="Your calendar" icon={<Calendar className="h-5 w-5 text-brand-600" />}>
                  <p className="mb-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{staffWeekDisplayCounts.open}</span> open ·{" "}
                    <span className="font-semibold text-slate-800">{staffWeekDisplayCounts.booked}</span> booked this
                    week
                    {(calViewFilter !== "all" || calPatientFilter.trim()) && (
                      <span className="text-slate-500">
                        {" "}
                        (full week: {staffWeekCounts.open} open · {staffWeekCounts.booked} booked)
                      </span>
                    )}
                    . Tap a day header to publish, or a block for details.
                  </p>
                  <div className="mb-4 rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <ListFilter className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Show</span>
                      <div
                        className="flex flex-wrap gap-1.5"
                        role="group"
                        aria-label="Calendar view filter"
                      >
                        {(
                          [
                            { id: "all" as const, label: "All" },
                            { id: "open" as const, label: "Open slots" },
                            { id: "booked" as const, label: "Booked" },
                          ] as const
                        ).map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setCalViewFilter(id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              calViewFilter === id
                                ? "bg-[#0059B3] text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <label
                          className="text-xs font-bold uppercase tracking-wide text-slate-600"
                          htmlFor="cal-patient-filter"
                        >
                          Patient
                        </label>
                        <div className="mt-1 flex gap-2">
                          <input
                            id="cal-patient-filter"
                            type="text"
                            value={calPatientFilter}
                            onChange={(e) => setCalPatientFilter(e.target.value)}
                            disabled={calViewFilter === "open"}
                            list="cal-patient-datalist"
                            placeholder={
                              calViewFilter === "open"
                                ? "Switch to All or Booked to filter by patient"
                                : "Name or visit title…"
                            }
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                          />
                          {calPatientFilter.trim() && calViewFilter !== "open" && (
                            <button
                              type="button"
                              onClick={() => setCalPatientFilter("")}
                              className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <datalist id="cal-patient-datalist">
                          {calPatientSuggestions.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Narrows <strong>booked</strong> visits. Open slots are never filtered by patient.
                        </p>
                      </div>
                    </div>
                  </div>
                  <ClinicianCalendarWeek
                    weekOffset={calWeekOffset}
                    onWeekOffsetChange={setCalWeekOffset}
                    openSlots={calendarDisplayOpen}
                    staffBookings={calendarDisplayBookings}
                    onDayHeaderClick={(day) => {
                      const t = new Date(day);
                      t.setHours(9, 0, 0, 0);
                      setPublishDialogWhen(isoToDatetimeLocalValue(t.toISOString()));
                      setPublishDayDialog(day);
                    }}
                    onOpenSlotClick={(s) => setOpenSlotDialog(s)}
                    onBookingClick={(b) => {
                      setBookingNotesDraft(b.notes ?? "");
                      setBookingDialog(b);
                    }}
                  />
                </DashCard>
              )}
            </>
          )}

          {slotTab === "bulk" && (
            <DashCard title="Paste many times" icon={<Calendar className="h-5 w-5 text-brand-600" />}>
              <form onSubmit={submitBulk} className="space-y-3">
                <label className="text-sm font-medium text-slate-700" htmlFor="bulk-lines">
                  One date/time per line (ISO or paste from spreadsheets)
                </label>
                <textarea
                  id="bulk-lines"
                  required
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"2026-04-15T09:00:00.000Z\n2026-04-15T09:30:00.000Z"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                />
                <p className="text-xs text-slate-500">
                  Up to 200 future times per save. Past times and conflicts are skipped.
                </p>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-md bg-[#0059B3] px-5 text-sm font-bold text-white transition hover:bg-[#004a99]"
                >
                  Publish all
                </button>
              </form>
            </DashCard>
          )}

          {slotTab === "week" && (
            <DashCard title="Weekly pattern" icon={<Calendar className="h-5 w-5 text-brand-600" />}>
          <form onSubmit={submitWeek} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">From date</label>
                <input
                  type="date"
                  required
                  value={weekFrom}
                  onChange={(e) => setWeekFrom(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">To date</label>
                <input
                  type="date"
                  required
                  value={weekTo}
                  onChange={(e) => setWeekTo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-3 py-2 font-semibold text-slate-700">Day</th>
                    <th className="px-3 py-2 font-semibold text-slate-700">On</th>
                    <th className="px-3 py-2 font-semibold text-slate-700">From</th>
                    <th className="px-3 py-2 font-semibold text-slate-700">To</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAY_ROWS.map(({ dow, label }) => (
                    <tr key={dow} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{label}</td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={perDay[dow]?.enabled ?? false}
                          onChange={(e) => patchPerDay(dow, { enabled: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={perDay[dow]?.start ?? "09:00"}
                          onChange={(e) => patchPerDay(dow, { start: e.target.value })}
                          className="w-full rounded border border-slate-200 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={perDay[dow]?.end ?? "17:00"}
                          onChange={(e) => patchPerDay(dow, { end: e.target.value })}
                          className="w-full rounded border border-slate-200 px-2 py-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="week-slot-min">
                  Slot length
                </label>
                <select
                  id="week-slot-min"
                  value={weekSlotMinutes}
                  onChange={(e) => setWeekSlotMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              ~<strong>{weekPreviewCount}</strong> future slot(s) in range (max 200 per save).
            </p>
            <button
              type="submit"
              className="min-h-[44px] rounded-md bg-[#0059B3] px-5 text-sm font-bold text-white transition hover:bg-[#004a99]"
            >
              Publish pattern
            </button>
          </form>
            </DashCard>
          )}
        </div>
      </div>

      {schedulePatientOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-patient-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSchedulePatientOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="schedule-patient-title" className="font-display text-lg font-semibold text-slate-900">
                Schedule for patient
              </h2>
              <button
                type="button"
                onClick={() => setSchedulePatientOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Book a visit for a specific time. Publishing open availability stays on the main calendar.
            </p>
            <form onSubmit={submit} className="mt-5 grid gap-5">
              <PatientSearch browseOnly sortPatients linkToChart onSelect={setPatient} />
              {patient && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-slate-600">
                    Selected: <span className="font-semibold text-slate-900">{patient.fullName}</span>
                  </p>
                  <Link
                    to={`/dashboard/patients/${patient.id}`}
                    className="text-sm font-semibold text-[#0059B3] underline decoration-[#0059B3]/40 underline-offset-2 hover:text-[#004a99]"
                  >
                    Open full chart (history)
                  </Link>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Clinician</label>
                  <select
                    value={clinicianId}
                    onChange={(e) => setClinicianId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                  >
                    <option value="">
                      {user?.role === "CLINICIAN" ? "Me (default)" : "Select clinician"}
                    </option>
                    {clinicians.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                {effectiveClinicianId ? (
                  <div className="sm:col-span-2">
                    <StaffTimeGrid
                      title="Pick date & time"
                      weekOffset={scheduleWeekOffset}
                      onWeekOffsetChange={setScheduleWeekOffset}
                      slotMinutes={30}
                      dayStartHour={7}
                      dayEndHour={19}
                      selectedIso={when ? new Date(when).toISOString() : null}
                      onSelectIso={(iso) => setWhen(isoToDatetimeLocalValue(iso))}
                      busyMinuteKeys={scheduleBusyMinuteKeys}
                    />
                    {slotTaken && patient && (
                      <p className="mt-2 text-xs font-medium text-red-700">
                        This time is already booked for the selected clinician. Tap another cell.
                      </p>
                    )}
                  </div>
                ) : (
                  user?.role === "ADMIN" && (
                    <p className="text-sm text-amber-900 sm:col-span-2">Select a clinician to open the calendar.</p>
                  )
                )}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Facility (optional)</label>
                  <input
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="Defaults to — if empty"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={!patient || slotTaken || !effectiveClinicianId}
                    className="min-h-[48px] rounded-md bg-[#0059B3] px-6 text-sm font-bold text-white transition hover:bg-[#004a99] disabled:opacity-50"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedulePatientOpen(false)}
                    className="min-h-[48px] rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  {!effectiveClinicianId && user?.role === "ADMIN" && (
                    <p className="w-full text-xs text-slate-500">Select a clinician first.</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {publishDayDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-slot-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPublishDayDialog(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 id="publish-slot-title" className="font-display text-lg font-semibold text-slate-900">
              Publish open slots
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {publishDayDialog.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="mt-4 flex gap-2 rounded-lg border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => setPublishDialogMode("single")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  publishDialogMode === "single"
                    ? "bg-[#0059B3] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                One time
              </button>
              <button
                type="button"
                onClick={() => setPublishDialogMode("fillDay")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  publishDialogMode === "fillDay"
                    ? "bg-[#0059B3] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Fill day
              </button>
            </div>
            {publishDialogMode === "single" ? (
              <>
                <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="pub-when">
                  Date & time
                </label>
                <input
                  id="pub-when"
                  type="datetime-local"
                  value={publishDialogWhen}
                  onChange={(e) => setPublishDialogWhen(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
                />
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  Publish every slot between start and end on this date (same title/facility as the sidebar). Past times
                  are skipped; max 200 per save. Optional skip window removes that block (e.g. lunch).
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="pub-fill-start">
                      From
                    </label>
                    <input
                      id="pub-fill-start"
                      type="time"
                      value={publishFillStart}
                      onChange={(e) => setPublishFillStart(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="pub-fill-end">
                      To
                    </label>
                    <input
                      id="pub-fill-end"
                      type="time"
                      value={publishFillEnd}
                      onChange={(e) => setPublishFillEnd(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="pub-fill-step">
                      Slot length
                    </label>
                    <select
                      id="pub-fill-step"
                      value={publishFillSlotMinutes}
                      onChange={(e) => setPublishFillSlotMinutes(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="pub-fill-skip-from">
                      Skip from (optional)
                    </label>
                    <input
                      id="pub-fill-skip-from"
                      type="time"
                      value={publishFillBreakStart}
                      onChange={(e) => setPublishFillBreakStart(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="pub-fill-skip-to">
                      Skip to (optional)
                    </label>
                    <input
                      id="pub-fill-skip-to"
                      type="time"
                      value={publishFillBreakEnd}
                      onChange={(e) => setPublishFillBreakEnd(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Leave skip blank for a continuous day. Example: 12:00 and 13:00 to skip lunch between morning and
                  afternoon.
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishDayDialog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </button>
              {publishDialogMode === "single" ? (
                <button
                  type="button"
                  onClick={() => {
                    const iso = new Date(publishDialogWhen).toISOString();
                    void publishOneSlot(iso);
                  }}
                  className="rounded-lg bg-[#0059B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#004a99]"
                >
                  Publish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void publishFillDayFromDialog()}
                  className="rounded-lg bg-[#0059B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#004a99]"
                >
                  Publish all slots
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {openSlotDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenSlotDialog(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-slate-900">Open slot</h3>
            <p className="mt-2 text-sm text-slate-700">
              {new Date(openSlotDialog.startAt).toLocaleString()} · {openSlotDialog.title} ·{" "}
              {openSlotDialog.facilityName}
            </p>
            <p className="mt-4 text-xs text-slate-500">Remove this if you no longer want it bookable.</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenSlotDialog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void removeSlot(openSlotDialog.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Remove slot
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBookingDialog(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-semibold text-slate-900">Booked visit</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">{bookingDialog.title}</span> ·{" "}
                {bookingDialog.facilityName}
              </p>
              <p>{new Date(bookingDialog.startAt).toLocaleString()}</p>
              <p>
                Patient: <strong>{bookingDialog.patientName}</strong>
              </p>
              <p>
                Doctor: <strong>{bookingDialog.clinicianName || "—"}</strong>
              </p>
              <p className="text-xs uppercase text-slate-500">Status: {bookingDialog.status}</p>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="visit-notes">
              Visit notes (clinical)
            </label>
            <textarea
              id="visit-notes"
              rows={5}
              value={bookingNotesDraft}
              onChange={(e) => setBookingNotesDraft(e.target.value)}
              placeholder="Add or update notes after the visit…"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/dashboard/patients/${encodeURIComponent(bookingDialog.patientId)}`}
                className="inline-flex items-center rounded-lg border border-[#0059B3]/30 bg-[#0059B3]/5 px-4 py-2 text-sm font-semibold text-[#0059B3] hover:bg-[#0059B3]/10"
              >
                Full patient history
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingDialog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void saveBookingNotes()}
                className="rounded-lg bg-[#0059B3] px-4 py-2 text-sm font-bold text-white hover:bg-[#004a99]"
              >
                Save notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
