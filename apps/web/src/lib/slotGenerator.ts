export type DaySchedule = {
    enabled: boolean;
    start: string;
    end: string;
};
function minutesToHhmm(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function parseTimeToMinutes(hhmm: string): number | null {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
    if (!m)
        return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59)
        return null;
    return h * 60 + min;
}
export function generateWeeklySlotIsoList(opts: {
    dateFrom: string;
    dateTo: string;
    perDay: Record<number, DaySchedule>;
    slotMinutes: number;
}): string[] {
    const out: string[] = [];
    const from = new Date(opts.dateFrom + "T12:00:00");
    const to = new Date(opts.dateTo + "T12:00:00");
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to)
        return [];
    if (opts.slotMinutes <= 0)
        return [];
    const now = new Date();
    for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
        const dow = day.getDay();
        const cfg = opts.perDay[dow];
        if (!cfg?.enabled)
            continue;
        const startTotal = parseTimeToMinutes(cfg.start);
        const endTotal = parseTimeToMinutes(cfg.end);
        if (startTotal === null || endTotal === null || startTotal >= endTotal)
            continue;
        for (let m = startTotal; m + opts.slotMinutes <= endTotal; m += opts.slotMinutes) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            const dt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, min, 0, 0);
            if (dt > now)
                out.push(dt.toISOString());
        }
    }
    return [...new Set(out)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}
export function generateDaySlotIsoList(dayAnchor: Date, startHhmm: string, endHhmm: string, slotMinutes: number): string[] {
    const startTotal = parseTimeToMinutes(startHhmm);
    const endTotal = parseTimeToMinutes(endHhmm);
    if (startTotal === null || endTotal === null || startTotal >= endTotal || slotMinutes <= 0)
        return [];
    const y = dayAnchor.getFullYear();
    const mo = dayAnchor.getMonth();
    const d = dayAnchor.getDate();
    const now = new Date();
    const out: string[] = [];
    for (let m = startTotal; m + slotMinutes <= endTotal; m += slotMinutes) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const dt = new Date(y, mo, d, h, min, 0, 0);
        if (dt > now)
            out.push(dt.toISOString());
    }
    return [...new Set(out)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}
export function generateDaySlotIsoListWithOptionalBreak(dayAnchor: Date, startHhmm: string, endHhmm: string, slotMinutes: number, breakFromHhmm?: string, breakToHhmm?: string): string[] {
    const bf = breakFromHhmm?.trim();
    const bt = breakToHhmm?.trim();
    if (!bf || !bt)
        return generateDaySlotIsoList(dayAnchor, startHhmm, endHhmm, slotMinutes);
    const dayStart = parseTimeToMinutes(startHhmm);
    const dayEnd = parseTimeToMinutes(endHhmm);
    const bs = parseTimeToMinutes(bf);
    const be = parseTimeToMinutes(bt);
    if (dayStart === null || dayEnd === null || dayStart >= dayEnd || slotMinutes <= 0)
        return [];
    if (bs === null || be === null || bs >= be) {
        return generateDaySlotIsoList(dayAnchor, startHhmm, endHhmm, slotMinutes);
    }
    const gapStart = Math.max(dayStart, bs);
    const gapEnd = Math.min(dayEnd, be);
    if (gapStart >= gapEnd) {
        return generateDaySlotIsoList(dayAnchor, startHhmm, endHhmm, slotMinutes);
    }
    const out: string[] = [];
    if (gapStart > dayStart) {
        out.push(...generateDaySlotIsoList(dayAnchor, startHhmm, minutesToHhmm(gapStart), slotMinutes));
    }
    if (gapEnd < dayEnd) {
        out.push(...generateDaySlotIsoList(dayAnchor, minutesToHhmm(gapEnd), endHhmm, slotMinutes));
    }
    return [...new Set(out)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}
export function parseBulkSlotLines(text: string): string[] {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    const out: string[] = [];
    for (const line of lines) {
        const d = new Date(line);
        if (!Number.isNaN(d.getTime()))
            out.push(d.toISOString());
    }
    return [...new Set(out)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}
