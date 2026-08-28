import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("la page d'inscription affiche la saison active du CRM sans année codée en dur", async () => {
  const page = await readFile(new URL("../src/app/inscriptions/page.tsx", import.meta.url), "utf8");

  assert.match(page, /getActiveSeason\(\)\.catch\(\(\) => null\)/);
  assert.match(page, /activeSeason \? `Saison \$\{activeSeason\.name\}` : "Inscriptions"/);
  assert.match(page, /activeSeason \? `Inscriptions \$\{activeSeason\.name\}` : "Inscriptions"/);
  assert.doesNotMatch(page, /2025\s*\/\s*2026/);
});

test("une demande publique enregistre la saison active côté serveur", async () => {
  const route = await readFile(new URL("../src/app/api/inscriptions/route.ts", import.meta.url), "utf8");

  assert.match(route, /getActiveSeason\(\)\.catch\(\(\) => null\)/);
  assert.match(route, /seasonId: activeSeason\.id, season: activeSeason\.name/);
});

test("la migration active la saison 2026 / 2027 après avoir désactivé l'ancienne", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260828160000_activate_2026_2027_season.sql", import.meta.url), "utf8");
  const deactivateAt = migration.indexOf("set is_active = false");
  const activateAt = migration.indexOf("values ('2026 / 2027', '2026-07-01', '2027-06-30', true)");

  assert.ok(deactivateAt >= 0);
  assert.ok(activateAt > deactivateAt);
  assert.match(migration, /on conflict \(name\) do update/);
});
