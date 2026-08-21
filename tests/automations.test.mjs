import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { AUTOMATION_CATALOG, AUTOMATION_KEYS, getAutomationDefinition, isAutomationKey } from "../src/lib/automations.ts";
import { validateAutomationRuleTogglePayload } from "../src/lib/api/validation.ts";
import { hasPermission } from "../src/lib/auth/permissions.ts";

test("le catalogue couvre exactement les clés déclarées", () => {
  assert.deepEqual(
    AUTOMATION_CATALOG.map((definition) => definition.key).sort(),
    [...AUTOMATION_KEYS].sort()
  );
});

test("chaque automatisation décrit son déclencheur, son action, son public et son impact", () => {
  for (const definition of AUTOMATION_CATALOG) {
    for (const field of ["event", "action", "audience", "impact", "iconName"]) {
      assert.equal(typeof definition[field], "string", `${definition.key}.${field}`);
      assert.ok(definition[field].length > 0, `${definition.key}.${field} ne doit pas être vide`);
    }
    assert.equal(getAutomationDefinition(definition.key), definition);
  }
});

test("isAutomationKey rejette les clés inconnues et les non-chaînes", () => {
  assert.equal(isAutomationKey("match_callups"), true);
  assert.equal(isAutomationKey("regle_inventee"), false);
  assert.equal(isAutomationKey(null), false);
  assert.equal(isAutomationKey(42), false);
});

// Garde-fou : une clé au catalogue mais câblée nulle part afficherait dans le CRM
// une automatisation qui ne se déclenche jamais — exactement ce que ce lot corrige.
test("chaque clé du catalogue est réellement câblée dans le code serveur", async () => {
  const sources = await Promise.all(
    ["family-notifications", "notifications", "registrations"].map((name) =>
      readFile(new URL(`../src/lib/db/${name}.ts`, import.meta.url), "utf8")
    )
  );
  const wired = sources.join("\n");

  for (const key of AUTOMATION_KEYS) {
    assert.ok(wired.includes(`"${key}"`), `l'automatisation ${key} n'est déclenchée nulle part`);
  }
});

test("la migration crée en base exactement les règles du catalogue", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260821100000_automations.sql", import.meta.url), "utf8");

  for (const key of AUTOMATION_KEYS) {
    assert.match(sql, new RegExp(`\\('${key}'\\)`), `la règle ${key} n'est pas insérée par la migration`);
  }
});

test("le journal ne peut pas enregistrer un statut hors des trois attendus", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260821100000_automations.sql", import.meta.url), "utf8");
  assert.match(sql, /check \(status in \('SUCCESS', 'SKIPPED', 'FAILED'\)\)/);
});

test("le pilotage des automatisations est réservé à la direction du club", () => {
  for (const role of ["SUPER_ADMIN", "ADMIN_CLUB", "DIRIGEANT"]) {
    assert.equal(hasPermission(role, "automations:manage"), true, role);
  }
  for (const role of ["EDITEUR", "CONTRIBUTEUR", "RESP_SPORTIF", "RESP_BOUTIQUE", "EDUCATEUR", "FAMILLE"]) {
    assert.equal(hasPermission(role, "automations:manage"), false, role);
  }
});

test("la bascule n'accepte qu'un vrai booléen", () => {
  assert.deepEqual(validateAutomationRuleTogglePayload({ isEnabled: false }), { ok: true, data: { isEnabled: false } });
  assert.deepEqual(validateAutomationRuleTogglePayload({ isEnabled: true }), { ok: true, data: { isEnabled: true } });

  // "false" en chaîne activerait la règle par erreur si on se contentait d'un cast.
  assert.equal(validateAutomationRuleTogglePayload({ isEnabled: "false" }).ok, false);
  assert.equal(validateAutomationRuleTogglePayload({}).ok, false);
  assert.equal(validateAutomationRuleTogglePayload(null).ok, false);
  assert.equal(validateAutomationRuleTogglePayload([]).ok, false);
});
