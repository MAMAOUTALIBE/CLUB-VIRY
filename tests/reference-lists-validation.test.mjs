import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAdminReferenceListPayload,
  validateAdminReferenceItemPayload,
  validateEntityTagsPayload
} from "../src/lib/api/validation.ts";

test("liste: création valide (TAG sur partenaires)", () => {
  const r = validateAdminReferenceListPayload({ key: "etapes_recrutement", name: "Étapes de recrutement", kind: "STAGE" });
  assert.equal(r.ok, true);
  assert.equal(r.data.kind, "STAGE");
  assert.equal(r.data.key, "etapes_recrutement");
});

test("liste: kind par défaut LABEL", () => {
  const r = validateAdminReferenceListPayload({ key: "sources", name: "Sources" });
  assert.equal(r.ok, true);
  assert.equal(r.data.kind, "LABEL");
});

test("liste: kind invalide rejeté", () => {
  const r = validateAdminReferenceListPayload({ key: "x", name: "X", kind: "PIPELINE" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "kind"));
});

test("liste: appliesTo doit être des entités connues", () => {
  const ok = validateAdminReferenceListPayload({ key: "kx", name: "Liste K", kind: "TAG", appliesTo: ["partner", "player"] });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.data.appliesTo, ["partner", "player"]);
  const ko = validateAdminReferenceListPayload({ key: "kx", name: "Liste K", kind: "TAG", appliesTo: ["dragon"] });
  assert.equal(ko.ok, false);
  assert.ok(ko.issues.some((i) => i.field === "appliesTo"));
});

test("liste: clé invalide rejetée", () => {
  const r = validateAdminReferenceListPayload({ key: "Ma-Liste", name: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "key"));
});

test("item: création valide avec couleur", () => {
  const r = validateAdminReferenceItemPayload({ listId: "11111111-1111-4111-8111-111111111111", value: "or", label: "Or", color: "#f7c600" });
  assert.equal(r.ok, true);
  assert.equal(r.data.color, "#f7c600");
});

test("item: couleur non hexadécimale rejetée", () => {
  const r = validateAdminReferenceItemPayload({ listId: "11111111-1111-4111-8111-111111111111", value: "or", label: "Or", color: "gold" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "color"));
});

test("item: valeur invalide rejetée", () => {
  const r = validateAdminReferenceItemPayload({ listId: "11111111-1111-4111-8111-111111111111", value: "Contacté", label: "Contacté" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "value"));
});

test("item: listId manquant rejeté à la création", () => {
  const r = validateAdminReferenceItemPayload({ value: "or", label: "Or" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "listId"));
});

test("item: édition partielle (juste le libellé)", () => {
  const r = validateAdminReferenceItemPayload({ label: "Nouveau" }, { partial: true });
  assert.equal(r.ok, true);
  assert.equal(r.data.label, "Nouveau");
});

test("tags: payload valide", () => {
  const r = validateEntityTagsPayload({ entityType: "partner", entityId: "11111111-1111-4111-8111-111111111111", itemIds: ["22222222-2222-4222-8222-222222222222"] });
  assert.equal(r.ok, true);
  assert.equal(r.data.itemIds.length, 1);
});

test("tags: itemIds doit être un tableau d'UUID", () => {
  const r = validateEntityTagsPayload({ entityType: "partner", entityId: "11111111-1111-4111-8111-111111111111", itemIds: ["nope"] });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "itemIds"));
});

test("tags: entité inconnue rejetée", () => {
  const r = validateEntityTagsPayload({ entityType: "dragon", entityId: "11111111-1111-4111-8111-111111111111", itemIds: [] });
  assert.equal(r.ok, false);
});

test("tags: liste vide acceptée (retire tous les tags)", () => {
  const r = validateEntityTagsPayload({ entityType: "partner", entityId: "11111111-1111-4111-8111-111111111111", itemIds: [] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.itemIds, []);
});
