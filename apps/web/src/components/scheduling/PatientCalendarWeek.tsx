import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, startOfWeekMonday } from "./calendarUtils";

export type OpenSlotChip = {
  id: string;
  startAt: string;
  facilityName: string;
  title: string;
  clinician?: { id: string; fullName: string; email: string };
};

export type CalendarViewFilter = "all" | "open" | "mine";

export type PatientCalendarWeekProps = {
  weekOffset: number;
  onWeekOffsetChange: (n: number) => void;
  openSlots: OpenSlotChip[];
  unavailableBlocks: { startAt: string }[];
  myVisits: { appointmentId: string; startAt: string }[];
  selectedSlotId: string | null;
  onSelectOpenSlot: (id: string) => void;
  viewFilter: CalendarViewFilter;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayIndexMonday(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function PatientCalendarWeek({
  weekOffset,
  onWeekOffsetChange,
  openSlots,
  unavailableBlocks,
  myVisits,
  selectedSlotId,
  onSelectOpenSlot,
  viewFilter,
}: PatientCalendarWeekProps) {
  const anchor = addDays(startOfWeekMonday(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
  const startBoundary = new Date(days[0]);
  startBoundary.setHours(0, 0, 0, 0);
  const startMs = startBoundary.getTime();
  const endBoundary = new Date(days[6]);
  endBoundary.setDate(endBoundary.getDate() + 1);
  endBoundary.setHours(0, 0, 0, 0);
  const endMs = endBoundary.getTime();

  const openByCol = Array.from({ length: 7 }, () => [] as OpenSlotChip[]);
  for (const s of openSlots) {
    const t = new Date(s.startAt).getTime();
    if (t < startMs || t >= endMs) continue;
    const col = dayIndexMonday(new Date(s.startAt));
    openByCol[col].push(s);
  }
  openByCol.forEach((arr) => arr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));

  const unavailByCol = Array.from({ length: 7 }, () => [] as string[]);
  for (const b of unavailableBlocks) {
    const t = new Date(b.startAt).getTime();
    if (t < startMs || t >= endMs) continue;
    const col = dayIndexMonday(new Date(b.startAt));
    unavailByCol[col].push(b.startAt);
  }
  unavailByCol.forEach((arr) => arr.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));

  const mineByCol = Array.from({ length: 7 }, () => [] as { appointmentId: string; startAt: string }[]);
  for (const m of myVisits) {
    const t = new Date(m.startAt).getTime();
    if (t < startMs || t >= endMs) continue;
    const col = dayIndexMonday(new Date(m.startAt));
    mineByCol[col].push(m);
  }
  mineByCol.forEach((arr) => arr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));

  const showOpen = viewFilter === "all" || viewFilter === "open";
  const showTaken = viewFilter === "all";
  const showMine = viewFilter === "all" || viewFilter === "mine";

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
            <div className="border-b border-slate-100 bg-gradient-to-b from-emerald-600/12 to-transparent px-2 py-2 text-center">
              <div className="text-xs font-bold text-slate-800">{DAY_LABELS[i]}</div>
              <div className="text-xs text-slate-600">{d.getDate()}</div>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
              {showOpen && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  Open
                </p>
                <div className="flex flex-col gap-1.5">
                  {openByCol[i].length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400">No open slots</p>
                  ) : (
                    openByCol[i].map((s) => {
                      const sel = selectedSlotId === s.id;
                      const docName = s.clinician?.fullName?.trim();
                      const doctorLine = docName ? `Dr. ${docName}` : "Doctor not listed";
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectOpenSlot(s.id)}
                          className={`rounded-lg px-2 py-2 text-left text-xs font-semibold transition ${
                            sel
                              ? "bg-brand-600 text-white ring-2 ring-brand-500/40"
                              : "border border-emerald-200 bg-white text-slate-800 hover:border-brand-400"
                          }`}
                        >
                          <span className={`block font-semibold ${sel ? "text-white" : "text-slate-900"}`}>
                            {new Date(s.startAt).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            className={`mt-0.5 block font-normal ${sel ? "text-white/90" : "text-slate-600"}`}
                          >
                            {doctorLine}
                          </span>
                          <span
                            className={`mt-0.5 block text-[10px] font-bold uppercase ${sel ? "text-white/80" : "text-emerald-700"}`}
                          >
                            Open
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              )}
              {showTaken && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Taken</p>
                <div className="flex flex-col gap-1.5">
                  {unavailByCol[i].length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400">—</p>
                  ) : (
                    unavailByCol[i].map((iso) => (
                      <div
                        key={iso}
                        className="rounded-lg border border-slate-200 bg-slate-100/90 px-2 py-2 text-xs text-slate-600"
                      >
                        <span className="font-medium text-slate-700">
                          {new Date(iso).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="mt-1 block text-[10px] font-semibold uppercase text-slate-500">
                          Taken
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">Other patient</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}
              {showMine && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0059B3]">Your visits</p>
                <div className="flex flex-col gap-1.5">
                  {mineByCol[i].length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400">—</p>
                  ) : (
                    mineByCol[i].map((mv) => (
                      <div
                        key={mv.appointmentId}
                        className="rounded-lg border border-[#0059B3]/25 bg-[#0059B3]/8 px-2 py-2 text-xs text-slate-800"
                      >
                        <span className="font-semibold">
                          {new Date(mv.startAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase text-[#0059B3]">Your booking</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
