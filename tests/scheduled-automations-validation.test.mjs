import assert from "node:assert/strict";
import test from "node:test";
import { validateAdminScheduledAutomationPayload } from "../src/lib/api/validation.ts";

test("règle: création valide", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Relance inscriptions", conditionKey: "registrations_stale", thresholdDays: 7, channel: "IN_APP" });
  assert.equal(r.ok, true);
  assert.equal(r.data.conditionKey, "registrations_stale");
});

test("règle: canal par défaut IN_APP", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Regle", conditionKey: "recruitment_stale" });
  assert.equal(r.ok, true);
  assert.equal(r.data.channel, "IN_APP");
});

test("règle: condition inconnue rejetée", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Regle", conditionKey: "everything" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "conditionKey"));
});

test("règle: condition requise à la création", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Regle" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "conditionKey"));
});

test("règle: seuil hors bornes rejeté", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Regle", conditionKey: "registrations_stale", thresholdDays: -1 });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "thresholdDays"));
});

test("règle: e-mail invalide rejeté", () => {
  const r = validateAdminScheduledAutomationPayload({ name: "Regle", conditionKey: "registrations_stale", recipientEmail: "x" });
  assert.equal(r.ok, false);
});

test("règle: édition partielle (désactivation)", () => {
  const r = validateAdminScheduledAutomationPayload({ isActive: false }, { partial: true });
  assert.equal(r.ok, true);
  assert.equal(r.data.isActive, false);
});
