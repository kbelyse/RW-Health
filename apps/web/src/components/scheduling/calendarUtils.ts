export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function minuteKeyFromIso(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 60000);
}

export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isoAtLocalMinute(day: Date, minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const dt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
  return dt.toISOString();
}

export function weekDaysMondayFirst(weekStartMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartMonday, i));
}

export function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekOffsetForDayContaining(day: Date): number {
  const ref = startOfWeekMonday(new Date());
  const target = startOfWeekMonday(day);
  return Math.round((target.getTime() - ref.getTime()) / (7 * 24 * 60 * 60 * 1000));
}
