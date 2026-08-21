import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateAdminFamilyPayload, validateAdminPlayerCreatePayload } from "../src/lib/api/validation.ts";

const familySource = await readFile(new URL("../src/lib/db/family.ts", import.meta.url), "utf8");
const subscriptionSource = await readFile(new URL("../src/lib/db/subscriptions.ts", import.meta.url), "utf8");
const teamsSource = await readFile(new URL("../src/lib/db/teams.ts", import.meta.url), "utf8");
const softDeleteSource = await readFile(new URL("../src/lib/db/soft-delete.ts", import.meta.url), "utf8");

function functionSource(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `${name} doit exister`);
  const next = source.indexOf("\nexport ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

test("les listes CRM d'adhérents excluent les fiches archivées", () => {
  for (const name of ["listPlayersForAdmin", "listFamiliesForAdmin", "getPlayerDetailForAdmin", "getFamilyDetailForAdmin"]) {
    assert.match(functionSource(familySource, name), /\.is\("deleted_at", null\)/, name);
  }
});

test("l'espace famille ne montre plus un joueur archivé", () => {
  assert.match(functionSource(familySource, "getFamilyDashboard"), /players[\s\S]*?\.is\("deleted_at", null\)/);
});

test("une fiche archivée n'est plus modifiable", () => {
  assert.match(functionSource(familySource, "updatePlayerForAdmin"), /\.is\("deleted_at", null\)/);
  assert.match(functionSource(familySource, "updateFamilyForAdmin"), /\.is\("deleted_at", null\)/);
});

test("les effectifs et joueurs assignables ignorent les archivés", () => {
  assert.match(functionSource(teamsSource, "listAssignablePlayers"), /\.is\("deleted_at", null\)/);
});

test("les abonnements archivés sortent des listes et ne changent plus de statut", () => {
  assert.match(functionSource(subscriptionSource, "listSubscriptionsForAdmin"), /\.is\("deleted_at", null\)/);
  assert.match(functionSource(subscriptionSource, "updateSubscriptionStatus"), /\.is\("deleted_at", null\)/);
});

// Sans cette remise à zéro, valider une inscription ressusciterait la ligne archivée
// tout en la laissant invisible : l'abonnement existerait sans apparaître nulle part.
test("réactiver un abonnement le sort de la corbeille", () => {
  const source = functionSource(subscriptionSource, "ensureSubscription");
  assert.match(source, /deleted_at: null/);
  assert.match(source, /deleted_by: null/);
});

test("la purge d'un adhérent est protégée par ses rattachements", () => {
  for (const dependency of ["team_players", "registrations", "player_guardians", "match_callups"]) {
    assert.ok(softDeleteSource.includes(`table: "${dependency}"`), `dépendance joueur manquante : ${dependency}`);
  }
  assert.match(softDeleteSource, /families: \[[\s\S]*?table: "players", column: "family_id"/);
});

test("la corbeille affiche le nom complet d'un joueur, pas seulement son nom de famille", () => {
  assert.match(softDeleteSource, /labelColumns: \["first_name", "last_name"\]/);
});

test("la migration ajoute l'archivage aux trois tables d'adhérents", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260821110000_archive_members.sql", import.meta.url), "utf8");
  for (const table of ["players", "families", "subscriptions"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} add column if not exists deleted_at`), table);
    assert.match(sql, new RegExp(`alter table public\\.${table} add column if not exists deleted_by`), table);
  }
});

test("la création d'un joueur exige une identité complète mais pas de famille", () => {
  const valid = validateAdminPlayerCreatePayload({ firstName: "Lina", lastName: "Diallo", birthDate: "2014-05-12" });
  assert.equal(valid.ok, true);
  assert.equal(valid.data.familyId, null);
  assert.equal(valid.data.gender, "NON_RENSEIGNE");

  assert.equal(validateAdminPlayerCreatePayload({ lastName: "Diallo", birthDate: "2014-05-12" }).ok, false);
  assert.equal(validateAdminPlayerCreatePayload({ firstName: "Lina", lastName: "Diallo" }).ok, false);
  assert.equal(validateAdminPlayerCreatePayload({ firstName: "L", lastName: "Diallo", birthDate: "2014-05-12" }).ok, false);
  assert.equal(
    validateAdminPlayerCreatePayload({ firstName: "Lina", lastName: "Diallo", birthDate: "2014-05-12", familyId: "pas-un-uuid" }).ok,
    false
  );
});

test("le nom d'une famille est obligatoire et borné", () => {
  assert.deepEqual(validateAdminFamilyPayload({ name: "  Famille Diallo  " }), { ok: true, data: { name: "Famille Diallo" } });
  assert.equal(validateAdminFamilyPayload({ name: "X" }).ok, false);
  assert.equal(validateAdminFamilyPayload({ name: "x".repeat(121) }).ok, false);
  assert.equal(validateAdminFamilyPayload({}).ok, false);
});
