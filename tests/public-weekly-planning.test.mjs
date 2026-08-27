import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { publicPlanningDateKey, publicPlanningRows, publicPlanningWeek } from "../src/lib/public-weekly-planning.ts";

const base = {
  source: "event",
  startsAt: "2026-09-02T15:30:00.000Z",
  endsAt: "2026-09-02T17:00:00.000Z",
  categoryId: "u11-u14",
  categoryName: "U11 à U14",
  teamName: "U12",
  groupLabel: "A – B – C",
  pitchCode: "T2"
};

test("la vue publique regroupe les mêmes lignes CRM par catégorie", () => {
  const rows = publicPlanningRows([{ ...base, id: "one" }, { ...base, id: "two", categoryId: "primary", categoryName: "U6 à U10" }]);
  assert.deepEqual(rows.map((row) => row.label), ["U11 à U14", "U6 à U10"]);
  assert.equal(rows.flatMap((row) => row.items).length, 2);
});

test("la semaine publique commence le lundi et affiche les cinq jours ouvrés", () => {
  const week = publicPlanningWeek(new Date("2026-09-03T12:00:00.000Z"));
  assert.deepEqual(week.keys, ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"]);
  assert.equal(publicPlanningDateKey(base.startsAt), "2026-09-02");
});

test("le composant public reste compact et n’expose aucun contrôle administratif", async () => {
  const source = await readFile(new URL("../src/components/PublicWeeklyPlanning.tsx", import.meta.url), "utf8");
  for (const visible of ["startsAt", "endsAt", "pitchCode", "groupLabel", "teamName"]) assert.match(source, new RegExp(visible));
  for (const forbidden of ["useDraggable", "Pencil", "Trash2", "description", "visibility", "status"]) assert.doesNotMatch(source, new RegExp(forbidden));
  assert.match(source, /min-h-\[86px\][\s\S]*w-\[calc\(100%-1rem\)\][\s\S]*bg-\[#11523f\]/);
});

test("la requête publique filtre visibilité et annulation sans fallback", async () => {
  const source = await readFile(new URL("../src/lib/db/calendar.ts", import.meta.url), "utf8");
  assert.match(source, /listPublicWeeklyPlanning[\s\S]*eq\("visibility", "PUBLIC"\)[\s\S]*neq\("status", "CANCELLED"\)/);
  assert.doesNotMatch(source.slice(source.indexOf("listPublicWeeklyPlanning")), /Fallback|fallback/);
});
