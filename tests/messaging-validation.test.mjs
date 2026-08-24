import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAdminMessageTemplatePayload,
  validateAdminReminderPayload
} from "../src/lib/api/validation.ts";

test("modèle: création valide (e-mail)", () => {
  const r = validateAdminMessageTemplatePayload({ key: "rappel_cotisation", name: "Rappel cotisation", channel: "EMAIL", subject: "Rappel", body: "Bonjour {prenom}" });
  assert.equal(r.ok, true);
  assert.equal(r.data.channel, "EMAIL");
});

test("modèle: canal par défaut EMAIL", () => {
  const r = validateAdminMessageTemplatePayload({ key: "k", name: "Nom modèle", body: "Texte" });
  assert.equal(r.ok, true);
  assert.equal(r.data.channel, "EMAIL");
});

test("modèle: corps requis à la création", () => {
  const r = validateAdminMessageTemplatePayload({ key: "k", name: "Nom modèle" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "body"));
});

test("modèle: canal invalide rejeté", () => {
  const r = validateAdminMessageTemplatePayload({ key: "k", name: "Nom", body: "x", channel: "FAX" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "channel"));
});

test("modèle: clé invalide rejetée", () => {
  const r = validateAdminMessageTemplatePayload({ key: "Clé!", name: "Nom", body: "x" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "key"));
});

test("modèle: édition partielle (juste le corps)", () => {
  const r = validateAdminMessageTemplatePayload({ body: "Nouveau texte" }, { partial: true });
  assert.equal(r.ok, true);
  assert.equal(r.data.body, "Nouveau texte");
});

test("rappel: création valide (in-app)", () => {
  const r = validateAdminReminderPayload({ title: "Relance dossiers", channel: "IN_APP", body: "Vérifier les dossiers", runAt: "2026-09-01T09:00" });
  assert.equal(r.ok, true);
  assert.equal(r.data.channel, "IN_APP");
});

test("rappel: canal par défaut IN_APP", () => {
  const r = validateAdminReminderPayload({ title: "Relance", runAt: "2026-09-01T09:00" });
  assert.equal(r.ok, true);
  assert.equal(r.data.channel, "IN_APP");
});

test("rappel: date requise", () => {
  const r = validateAdminReminderPayload({ title: "Relance" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "runAt"));
});

test("rappel: date invalide rejetée", () => {
  const r = validateAdminReminderPayload({ title: "Relance", runAt: "pas-une-date" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "runAt"));
});

test("rappel: e-mail destinataire invalide rejeté", () => {
  const r = validateAdminReminderPayload({ title: "Relance", runAt: "2026-09-01T09:00", recipientEmail: "pasunemail" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "recipientEmail"));
});

test("rappel: templateId non-UUID rejeté", () => {
  const r = validateAdminReminderPayload({ title: "Relance", runAt: "2026-09-01T09:00", templateId: "abc" });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "templateId"));
});

test("rappel: statut invalide rejeté", () => {
  const r = validateAdminReminderPayload({ title: "Relance", runAt: "2026-09-01T09:00", status: "DONE" }, { partial: true });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "status"));
});
