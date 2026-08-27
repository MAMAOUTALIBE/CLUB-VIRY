import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { detectPlanningConflicts, matchesPlanningFilters, movePlanningRange, planningDateKey, planningWeekDays, startOfPlanningWeek } from "../src/lib/planning-kanban.ts";

test("le planning commence le lundi et expose sept dates réelles", () => {
  const monday = startOfPlanningWeek(new Date(2026, 8, 3, 15, 30));
  assert.equal(planningDateKey(monday), "2026-08-31");
  assert.deepEqual(planningWeekDays(monday).map(planningDateKey), ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06"]);
});

test("un déplacement change seulement la date et conserve la durée réelle", () => {
  const moved = movePlanningRange("2026-09-01T15:30:00.000Z", "2026-09-01T17:00:00.000Z", "2026-09-04");
  assert.equal(Date.parse(moved.endsAt) - Date.parse(moved.startsAt), 90 * 60 * 1000);
  assert.equal(planningDateKey(moved.startsAt), "2026-09-04");
});

test("les conflits utilisent les chevauchements réels d'équipe et de terrain", () => {
  const conflicts = detectPlanningConflicts([
    { id: "a", startsAt: "2026-09-01T17:00:00.000Z", endsAt: "2026-09-01T18:30:00.000Z", teamId: "u14", venue: "Terrain T2" },
    { id: "b", startsAt: "2026-09-01T18:00:00.000Z", endsAt: "2026-09-01T19:00:00.000Z", teamId: "u14", venue: "Terrain T3" },
    { id: "c", startsAt: "2026-09-01T18:15:00.000Z", endsAt: "2026-09-01T20:00:00.000Z", teamId: "u16", venue: "terrain t2" },
    { id: "cancelled", startsAt: "2026-09-01T18:15:00.000Z", endsAt: "2026-09-01T20:00:00.000Z", teamId: "u14", venue: "Terrain T2", cancelled: true }
  ]);
  assert.deepEqual(conflicts.get("a"), ["Équipe déjà planifiée sur ce créneau", "Terrain déjà occupé sur ce créneau"]);
  assert.deepEqual(conflicts.get("b"), ["Équipe déjà planifiée sur ce créneau"]);
  assert.deepEqual(conflicts.get("c"), ["Terrain déjà occupé sur ce créneau"]);
  assert.equal(conflicts.has("cancelled"), false);
});

test("les filtres combinent type, équipe et terrain", () => {
  const item = { kind: "TRAINING", teamId: "u14", venue: "Terrain T2" };
  assert.equal(matchesPlanningFilters(item, { kind: "TRAINING", teamId: "u14", venue: "terrain t2" }), true);
  assert.equal(matchesPlanningFilters(item, { kind: "MATCH", teamId: "u14", venue: "Terrain T2" }), false);
});

test("le contrat Kanban expose le panneau, le drag and drop, les filtres et les conflits", async () => {
  const source = await readFile(new URL("../src/components/admin/modules/CalendarAdmin.tsx", import.meta.url), "utf8");
  for (const contract of ["DndContext", "useDraggable", "useDroppable", "Créer un événement", "Déposer ici", "Toutes les équipes", "Tous les terrains", "Conflit de planning"]) {
    assert.match(source, new RegExp(contract));
  }
});
