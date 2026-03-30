import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateKeyLocal } from "./calendarUtils";

type MiniMonthCalendarProps = {
  month: Date;
  onMonthChange: (d: Date) => void;
  activityKeys: Set<string>;
  onPickDay: (d: Date) => void;
};

export function MiniMonthCalendar({ month, onMonthChange, activityKeys, onPickDay }: MiniMonthCalendarProps) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(y, m, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const label = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayKey = dateKeyLocal(new Date());

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white shadow-inner backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(y, m - 1, 1))}
          className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-center text-xs font-bold tracking-wide">{label}</p>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(y, m + 1, 1))}
          className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase text-white/55">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((h) => (
          <div key={h} className="py-1">
            {h}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="aspect-square min-h-[28px]" />;
          const key = dateKeyLocal(cell);
          const isToday = key === todayKey;
          const dot = activityKeys.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPickDay(cell)}
              className={`relative flex aspect-square min-h-[28px] flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${
                isToday ? "bg-white text-[#0059B3] ring-2 ring-white/80" : "text-white hover:bg-white/15"
              }`}
            >
              {cell.getDate()}
              {dot && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${isToday ? "bg-[#0059B3]" : "bg-emerald-300"}`}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-white/65">
        Dot = a day with open times, your visits, or booked slots (when a doctor is selected).
      </p>
    </div>
  );
}
