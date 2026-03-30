export function isVisitTimeReached(scheduledAtIso: string): boolean {
  return new Date(scheduledAtIso).getTime() <= Date.now();
}
