import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, isoAtLocalMinute, minuteKeyFromIso, startOfWeekMonday, } from "./calendarUtils";
type StaffTimeGridProps = {
    title?: string;
    weekOffset: number;
    onWeekOffsetChange: (n: number) => void;
    slotMinutes: number;
    dayStartHour: number;
    dayEndHour: number;
    selectedIso: string | null;
    onSelectIso: (iso: string) => void;
    busyMinuteKeys: Set<number>;
};
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export function StaffTimeGrid({ title, weekOffset, onWeekOffsetChange, slotMinutes, dayStartHour, dayEndHour, selectedIso, onSelectIso, busyMinuteKeys, }: StaffTimeGridProps) {
    const anchor = addDays(startOfWeekMonday(new Date()), weekOffset * 7);
    const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
    const startMin = dayStartHour * 60;
    const endMin = dayEndHour * 60;
    const rows: number[] = [];
    for (let m = startMin; m + slotMinutes <= endMin; m += slotMinutes) {
        rows.push(m);
    }
    const now = new Date();
    const selectedKey = selectedIso ? minuteKeyFromIso(selectedIso) : null;
    function fmtTime(minutesFromMidnight: number): string {
        const h = Math.floor(minutesFromMidnight / 60);
        const m = minutesFromMidnight % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return (<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      {title ? (<p className="border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">{title}</p>) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <button type="button" onClick={() => onWeekOffsetChange(weekOffset - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <ChevronLeft className="h-4 w-4"/>
          Prev
        </button>
        <p className="text-sm font-semibold text-slate-800">
          {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" – "}
          {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <button type="button" onClick={() => onWeekOffsetChange(weekOffset + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Next
          <ChevronRight className="h-4 w-4"/>
        </button>
      </div>
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] gap-px bg-slate-200">
          <div className="bg-slate-50/90 p-2 text-xs font-semibold text-slate-500"/>
          {days.map((d, i) => (<div key={i} className="bg-gradient-to-b from-[#0059B3]/8 to-slate-50/90 p-2 text-center text-xs font-bold text-slate-800">
              <div>{DAY_LABELS[i]}</div>
              <div className="font-normal text-slate-600">{d.getDate()}</div>
            </div>))}
          {rows.map((rowMin) => (<div key={rowMin} className="contents">
              <div className="flex items-start justify-end bg-slate-50/90 px-2 py-1.5 text-[11px] font-medium text-slate-500">
                {fmtTime(rowMin)}
              </div>
              {days.map((day) => {
                const iso = isoAtLocalMinute(day, rowMin);
                const dt = new Date(iso);
                const mk = minuteKeyFromIso(iso);
                const past = dt <= now;
                const busy = busyMinuteKeys.has(mk);
                const selected = selectedKey !== null && mk === selectedKey;
                const disabled = past || busy;
                return (<button key={`${day.toISOString()}-${rowMin}`} type="button" disabled={disabled} onClick={() => onSelectIso(iso)} className={`min-h-[36px] border border-transparent px-1 py-1 text-xs font-medium transition ${disabled
                        ? past
                            ? "cursor-not-allowed bg-slate-100/80 text-slate-300"
                            : "cursor-not-allowed bg-rose-50/90 text-rose-300 line-through"
                        : selected
                            ? "bg-[#0059B3] text-white shadow-inner ring-2 ring-[#0059B3]/40"
                            : "bg-white text-slate-700 hover:bg-[#0059B3]/10 hover:ring-1 hover:ring-[#0059B3]/30"}`}>
                    {busy ? "Taken" : past ? "" : "Pick"}
                  </button>);
            })}
            </div>))}
        </div>
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-sm text-slate-500">
        Free cells set the time below. Taken = already booked for this clinician.
      </p>
    </div>);
}
