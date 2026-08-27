const parisDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

export type PublicPlanningItem = {
  id: string;
  source: "event" | "match";
  startsAt: string;
  endsAt: string | null;
  categoryId: string | null;
  categoryName: string | null;
  teamName: string | null;
  groupLabel: string | null;
  pitchCode: "T1" | "T2" | "T3" | "T4" | null;
};

export type PublicPlanningRow = {
  key: string;
  label: string;
  items: PublicPlanningItem[];
};

export function publicPlanningRows(items: PublicPlanningItem[]): PublicPlanningRow[] {
  const rows = new Map<string, PublicPlanningRow>();
  for (const item of items) {
    const key = item.categoryId ?? "uncategorized";
    const label = item.categoryName?.trim() || "Sans catégorie";
    const row = rows.get(key) ?? { key, label, items: [] };
    row.items.push(item);
    rows.set(key, row);
  }
  return [...rows.values()]
    .map((row) => ({ ...row, items: row.items.sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)) }))
    .sort((left, right) => left.label.localeCompare(right.label, "fr"));
}

export function publicPlanningWeek(reference = new Date()) {
  const referenceKey = publicPlanningDateKey(reference.toISOString());
  const [year, month, day] = referenceKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const mondayKey = shiftDateKey(referenceKey, -((weekday + 6) % 7));
  const keys = Array.from({ length: 7 }, (_, index) => shiftDateKey(mondayKey, index));
  return {
    keys: keys.slice(0, 5),
    mondayKey: keys[0],
    fridayKey: keys[4],
    previousKey: shiftDateKey(keys[0], -7),
    nextKey: shiftDateKey(keys[0], 7)
  };
}

export function publicPlanningDateKey(value: string): string {
  return parisDateFormatter.format(new Date(value));
}
