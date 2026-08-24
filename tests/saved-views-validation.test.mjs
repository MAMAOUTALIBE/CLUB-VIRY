import assert from "node:assert/strict";
import test from "node:test";
import { validateAdminSavedViewPayload } from "../src/lib/api/validation.ts";

test("vue: création valide", () => {
  const r = validateAdminSavedViewPayload({ scope: "partners", name: "Partenaires actifs", config: { search: "or", hiddenColumns: ["Clé"] } });
  assert.equal(r.ok, true);
  assert.equal(r.data.scope, "partners");
  assert.deepEqual(r.data.config.hiddenColumns, ["Clé"]);
});

test("vue: scope requis", () => {
  const r = validateAdminSavedViewPayload({ name: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "scope"));
});

test("vue: scope invalide rejeté", () => {
  const r = validateAdminSavedViewPayload({ scope: "Partners!", name: "X view" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "scope"));
});

test("vue: nom trop court rejeté", () => {
  const r = validateAdminSavedViewPayload({ scope: "partners", name: "X" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "name"));
});

test("vue: config non-objet rejetée", () => {
  const r = validateAdminSavedViewPayload({ scope: "partners", name: "Vue X", config: "x" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "config"));
});

test("vue: édition partielle (juste le nom)", () => {
  const r = validateAdminSavedViewPayload({ name: "Renommée" }, { partial: true });
  assert.equal(r.ok, true);
  assert.equal(r.data.name, "Renommée");
});
