import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAdminCustomFieldPayload,
  validateCustomFieldValuesPayload
} from "../src/lib/api/validation.ts";

test("custom field: création valide (texte)", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "secteur_activite", label: "Secteur d'activité", type: "TEXT" });
  assert.equal(r.ok, true);
  assert.equal(r.data.entityType, "partner");
  assert.equal(r.data.key, "secteur_activite");
  assert.equal(r.data.type, "TEXT");
});

test("custom field: type par défaut TEXT à la création", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "player", key: "taille", label: "Taille" });
  assert.equal(r.ok, true);
  assert.equal(r.data.type, "TEXT");
});

test("custom field: entité inconnue rejetée", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "dragon", key: "x", label: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "entityType"));
});

test("custom field: clé invalide rejetée (majuscule / tiret)", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "Mon-Champ", label: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "key"));
});

test("custom field: clé commençant par un chiffre rejetée", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "1champ", label: "X" });
  assert.equal(r.ok, false);
});

test("custom field: libellé trop court rejeté", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "ok", label: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "label"));
});

test("custom field: SELECT sans option rejeté", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "niveau", label: "Niveau", type: "SELECT", options: [] });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "options"));
});

test("custom field: SELECT avec options accepté et normalisé", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "niveau", label: "Niveau", type: "SELECT", options: ["Or", " Argent ", "", "Bronze"] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.options, ["Or", "Argent", "Bronze"]);
});

test("custom field: type de champ invalide rejeté", () => {
  const r = validateAdminCustomFieldPayload({ entityType: "partner", key: "x2", label: "X2", type: "COLOR" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "type"));
});

test("custom field: édition partielle (juste le libellé)", () => {
  const r = validateAdminCustomFieldPayload({ label: "Nouveau libellé" }, { partial: true });
  assert.equal(r.ok, true);
  assert.equal(r.data.label, "Nouveau libellé");
  assert.equal(r.data.entityType, undefined);
});

test("custom field: helpText trop long rejeté", () => {
  const r = validateAdminCustomFieldPayload({ label: "OK", helpText: "x".repeat(301) }, { partial: true });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "helpText"));
});

test("custom field values: payload valide", () => {
  const r = validateCustomFieldValuesPayload({
    entityType: "partner",
    entityId: "11111111-1111-4111-8111-111111111111",
    values: { secteur_activite: "BTP", niveau: "Or" }
  });
  assert.equal(r.ok, true);
  assert.equal(r.data.entityId, "11111111-1111-4111-8111-111111111111");
  assert.deepEqual(r.data.values, { secteur_activite: "BTP", niveau: "Or" });
});

test("custom field values: entityId non-UUID rejeté", () => {
  const r = validateCustomFieldValuesPayload({ entityType: "partner", entityId: "abc", values: {} });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "entityId"));
});

test("custom field values: entité inconnue rejetée", () => {
  const r = validateCustomFieldValuesPayload({ entityType: "nope", entityId: "11111111-1111-4111-8111-111111111111", values: {} });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "entityType"));
});

test("custom field values: valeurs non-objet rejetées", () => {
  const r = validateCustomFieldValuesPayload({ entityType: "partner", entityId: "11111111-1111-4111-8111-111111111111", values: "x" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "values"));
});
