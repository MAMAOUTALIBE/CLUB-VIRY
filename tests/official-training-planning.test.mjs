import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../supabase/migrations/20260902090000_seed_official_training_planning_2026_2027.sql", import.meta.url), "utf8");
const mondayU12U13Correction = await readFile(new URL("../supabase/migrations/20260903080000_fix_u12_u13_monday_start_time.sql", import.meta.url), "utf8");

test("le planning officiel 2026-2027 couvre toutes les catégories de l’affiche", () => {
  for (const category of ["U6 – U7", "U8 – U9", "U10 (CM2)", "U11 (6e)", "U12 – U13", "U14", "U16", "U18", "Féminines", "Seniors", "Vétérans"]) {
    assert.match(migration, new RegExp(category.replace(/[()]/g, "\\$&")));
  }
});

test("les créneaux sont publics, hebdomadaires, idempotents et sensibles au fuseau de Paris", () => {
  assert.match(migration, /generate_series\('2026-08-31'::date, '2027-06-30'::date/);
  assert.match(migration, /at time zone 'Europe\/Paris'/);
  assert.match(migration, /'PUBLIC'[\s\S]*'SCHEDULED'/);
  assert.match(migration, /on conflict \(id\) do update/);
  assert.match(migration, /une semaine sur deux/);
});

test("le créneau U12 – U13 du lundi commence à 18h00", () => {
  assert.match(mondayU12U13Correction, /category\.name = 'U12 – U13'/);
  assert.match(mondayU12U13Correction, /extract\(isodow[\s\S]*\) = 1/);
  assert.match(mondayU12U13Correction, /time '17:30'/);
  assert.match(mondayU12U13Correction, /time '18:00'/);
  assert.match(mondayU12U13Correction, /at time zone 'Europe\/Paris'/);
});

test("la légende frontend reprend les quatre terrains officiels", async () => {
  const source = await readFile(new URL("../src/lib/public-weekly-planning.ts", import.meta.url), "utf8");
  const publicPlanning = await readFile(new URL("../src/components/PublicWeeklyPlanning.tsx", import.meta.url), "utf8");
  const homePlanning = await readFile(new URL("../src/components/HomeSportsHub.tsx", import.meta.url), "utf8");
  for (const label of ["Honneur", "Synthétique", "Annexe", "Stade Raoul Perrin"]) assert.match(source, new RegExp(label));
  for (const component of [publicPlanning, homePlanning]) assert.match(component, /Object\.entries\(publicPitchLabels\)/);
});
