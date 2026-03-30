import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, startOfWeekMonday } from "./calendarUtils";

export type ClinicianOpenSlot = {
  id: string;
  startAt: string;
  facilityName: string;
  title: string;
  clinician?: { id: string; fullName: string; email: string };
};

export type StaffBookingDetail = {
  appointmentId: string;
  startAt: string;
  patientId: string;
  patientName: string;
  title: string;
  facilityName: string;
  notes: string | null;
  status: string;
  clinicianName: string;
};

type Props = {
  weekOffset: number;
  onWeekOffsetChange: (n: number) => void;
  openSlots: ClinicianOpenSlot[];
  staffBookings: StaffBookingDetail[];
  onDayHeaderClick: (day: Date) => void;
  onOpenSlotClick: (slot: ClinicianOpenSlot) => void;
  onBookingClick: (b: StaffBookingDetail) => void;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayIndexMonday(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function ClinicianCalendarWeek({
  weekOffset,
  onWeekOffsetChange,
  openSlots,
  staffBookings,
  onDayHeaderClick,
  onOpenSlotClick,
  onBookingClick,
}: Props) {
  const anchor = addDays(startOfWeekMonday(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
  const startBoundary = new Date(days[0]);
  startBoundary.setHours(0, 0, 0, 0);
  const startMs = startBoundary.getTime();
  const endBoundary = new Date(days[6]);
  endBoundary.setDate(endBoundary.getDate() + 1);
  endBoundary.setHours(0, 0, 0, 0);
  const endMs = endBoundary.getTime();

  const openByCol = Array.from({ length: 7 }, () => [] as ClinicianOpenSlot[]);
  for (const s of openSlots) {
    const t = new Date(s.startAt).getTime();
    if (t < startMs || t >= endMs) continue;
    openByCol[dayIndexMonday(new Date(s.startAt))].push(s);
  }
  openByCol.forEach((arr) => arr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));

  const bookByCol = Array.from({ length: 7 }, () => [] as StaffBookingDetail[]);
  for (const b of staffBookings) {
    const t = new Date(b.startAt).getTime();
    if (t < startMs || t >= endMs) continue;
    bookByCol[dayIndexMonday(new Date(b.startAt))].push(b);
  }
  bookByCol.forEach((arr) => arr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <button
          type="button"
          onClick={() => onWeekOffsetChange(weekOffset - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <p className="text-sm font-semibold text-slate-800">
          {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" – "}
          {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => onWeekOffsetChange(weekOffset + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid min-w-[720px] grid-cols-7 gap-px bg-slate-200 p-px">
        {days.map((d, i) => (
          <div key={i} className="flex min-h-[280px] flex-col bg-slate-50/90">
            <button
              type="button"
              onClick={() => onDayHeaderClick(d)}
              className="border-b border-slate-100 bg-gradient-to-b from-emerald-600/12 to-transparent px-2 py-2 text-center transition hover:bg-emerald-600/20"
              title="Add an open slot on this day"
            >
              <div className="text-xs font-bold text-slate-800">{DAY_LABELS[i]}</div>
              <div className="text-xs text-slate-600">{d.getDate()}</div>
              <span className="mt-1 block text-[9px] font-semibold uppercase text-emerald-800">+ Publish</span>
            </button>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Open</p>
                <div className="flex flex-col gap-1.5">
                  {openByCol[i].length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400">—</p>
                  ) : (
                    openByCol[i].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onOpenSlotClick(s)}
                        className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-left text-xs font-semibold text-slate-800 transition hover:border-brand-400 hover:ring-1 hover:ring-brand-300"
                      >
                        <span className="block font-semibold text-slate-900">
                          {new Date(s.startAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-normal text-slate-600 line-clamp-2">
                          {s.title} · {s.facilityName}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase text-emerald-700">
                          Open · tap
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Booked</p>
                <div className="flex flex-col gap-1.5">
                  {bookByCol[i].length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400">—</p>
                  ) : (
                    bookByCol[i].map((b) => (
                      <button
                        key={b.appointmentId}
                        type="button"
                        onClick={() => onBookingClick(b)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-left text-xs transition hover:border-[#0059B3]/40 hover:ring-1 hover:ring-[#0059B3]/25"
                      >
                        <span className="font-semibold text-slate-900">
                          {new Date(b.startAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="mt-0.5 block truncate font-medium text-slate-800">{b.patientName}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-500 line-clamp-1">{b.title}</span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase text-[#0059B3]">
                          Booked · tap
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
