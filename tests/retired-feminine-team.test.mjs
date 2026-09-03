import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("l'équipe féminine est retirée de toutes les entrées publiques", async () => {
  const [content, data, header, directory, forms] = await Promise.all([
    source("src/lib/public-content.ts"),
    source("src/lib/data.ts"),
    source("src/components/Header.tsx"),
    source("src/components/TeamsDirectory.tsx"),
    source("src/components/Forms.tsx")
  ]);

  assert.match(content, /RETIRED_PUBLIC_TEAM_SLUGS = new Set\(\["futsal", "feminines"\]\)/);
  assert.doesNotMatch(data, /slug: "feminines"/);
  assert.doesNotMatch(header, /\/equipes\/feminines/);
  assert.doesNotMatch(directory, /"Féminines"/);
  assert.doesNotMatch(forms, /"Féminines"/);
});

test("la migration supprime les dépendances avant l'équipe et ses catégories", async () => {
  const migration = await source("supabase/migrations/20260903090000_remove_feminine_team.sql");
  const emptyFamilyPasses = migration.indexOf("delete from public.family_media_passes");
  const familyPasses = migration.indexOf("delete from public.family_media_pass_teams");
  const events = migration.indexOf("delete from public.club_events");
  const matches = migration.indexOf("delete from public.matches");
  const teams = migration.indexOf("delete from public.teams");
  const categories = migration.indexOf("delete from public.categories");

  assert.ok(emptyFamilyPasses >= 0 && familyPasses > emptyFamilyPasses && events > familyPasses && matches > events && teams > matches && categories > teams);
  assert.match(migration, /where slug = 'feminines'/);
  assert.match(migration, /'FÉMININES', 'Féminines', 'Feminines'/);
  assert.match(migration, /where key = 'organigramme'/);
  assert.match(migration, /where key = 'home_sports'/);
});
