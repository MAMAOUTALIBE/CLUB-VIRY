export type PlanningKind = "TRAINING" | "MATCH" | "STAGE" | "EVENT";

export type PlanningConflictItem = {
  id: string;
  startsAt: string;
  endsAt: string | null;
  teamId: string | null;
  venue: string | null;
  cancelled?: boolean;
};

export type PlanningFilters = {
  kind: PlanningKind | "ALL";
  teamId: string;
  venue: string;
};

export function startOfPlanningWeek(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
}

export function planningDateKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function planningWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function movePlanningRange(startsAt: string, endsAt: string | null, targetDate: string): { startsAt: string; endsAt: string | null } {
  const start = new Date(startsAt);
  const [year, month, day] = targetDate.split("-").map(Number);
  if (!Number.isFinite(start.getTime()) || !year || !month || !day) return { startsAt, endsAt };

  const movedStart = new Date(start);
  movedStart.setFullYear(year, month - 1, day);
  const end = endsAt ? new Date(endsAt) : null;
  const duration = end && Number.isFinite(end.getTime()) ? end.getTime() - start.getTime() : null;
  return {
    startsAt: movedStart.toISOString(),
    endsAt: duration === null ? null : new Date(movedStart.getTime() + duration).toISOString()
  };
}

function normalizeVenue(value: string | null): string {
  return value?.trim().toLocaleLowerCase("fr-FR") ?? "";
}

function overlaps(left: PlanningConflictItem, right: PlanningConflictItem): boolean {
  const leftStart = Date.parse(left.startsAt);
  const rightStart = Date.parse(right.startsAt);
  if (!Number.isFinite(leftStart) || !Number.isFinite(rightStart)) return false;
  const leftEnd = left.endsAt ? Date.parse(left.endsAt) : leftStart;
  const rightEnd = right.endsAt ? Date.parse(right.endsAt) : rightStart;
  if (!Number.isFinite(leftEnd) || !Number.isFinite(rightEnd)) return false;
  if (leftEnd === leftStart && rightEnd === rightStart) return leftStart === rightStart;
  if (leftEnd === leftStart) return leftStart >= rightStart && leftStart < rightEnd;
  if (rightEnd === rightStart) return rightStart >= leftStart && rightStart < leftEnd;
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function detectPlanningConflicts(items: PlanningConflictItem[]): Map<string, string[]> {
  const conflicts = new Map<string, Set<string>>();
  const active = items.filter((item) => !item.cancelled);
  const add = (id: string, reason: string) => {
    const reasons = conflicts.get(id) ?? new Set<string>();
    reasons.add(reason);
    conflicts.set(id, reasons);
  };

  for (let leftIndex = 0; leftIndex < active.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < active.length; rightIndex += 1) {
      const left = active[leftIndex];
      const right = active[rightIndex];
      if (!overlaps(left, right)) continue;
      const sameTeam = Boolean(left.teamId && right.teamId && left.teamId === right.teamId);
      const leftVenue = normalizeVenue(left.venue);
      const sameVenue = Boolean(leftVenue && leftVenue === normalizeVenue(right.venue));
      if (sameTeam) {
        add(left.id, "Équipe déjà planifiée sur ce créneau");
        add(right.id, "Équipe déjà planifiée sur ce créneau");
      }
      if (sameVenue) {
        add(left.id, "Terrain déjà occupé sur ce créneau");
        add(right.id, "Terrain déjà occupé sur ce créneau");
      }
    }
  }

  return new Map([...conflicts].map(([id, reasons]) => [id, [...reasons]]));
}

export function matchesPlanningFilters(item: { kind: PlanningKind; teamId: string | null; venue: string | null }, filters: PlanningFilters): boolean {
  if (filters.kind !== "ALL" && item.kind !== filters.kind) return false;
  if (filters.teamId && item.teamId !== filters.teamId) return false;
  if (filters.venue && normalizeVenue(item.venue) !== normalizeVenue(filters.venue)) return false;
  return true;
}
