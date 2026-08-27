import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAdminOfficialPayload,
  validateAdminPartnerPayload,
  validateAdminPlayerUpdatePayload,
  validateEducatorPublicProfilePayload,
  validateNewsletterPayload,
  validateOrderRequestPayload,
  validatePasswordResetPayload,
  validateRegistrationLeadPayload
} from "../src/lib/api/validation.ts";

/**
 * Sept validateurs n'avaient aucune couverture, dont quatre servant des routes
 * PUBLIQUES non authentifiees (newsletter, panier, demande d'inscription,
 * reinitialisation de mot de passe). Ce fichier comble le trou et fige au passage
 * les regles d'URL ajoutees sur les partenaires et les dirigeants.
 */

function fieldsOf(result) {
  assert.equal(result.ok, false, "le payload devait etre refuse");
  return result.issues.map((issue) => issue.field);
}

// --- Routes publiques -------------------------------------------------------

test("newsletter : email normalise, sinon refus", () => {
  assert.deepEqual(validateNewsletterPayload({ email: "  Contact@Example.ORG " }), { ok: true, data: { email: "contact@example.org" } });
  for (const bad of [null, "chaine", {}, { email: "" }, { email: "pas-un-email" }, { email: "a@b" }, { email: 42 }]) {
    assert.equal(validateNewsletterPayload(bad).ok, false, `${JSON.stringify(bad)} devait etre refuse`);
  }
});

test("reinitialisation de mot de passe : email seul, normalise", () => {
  assert.deepEqual(validatePasswordResetPayload({ email: "Famille@Club.FR" }), { ok: true, data: { email: "famille@club.fr" } });
  for (const bad of [null, undefined, {}, { email: "   " }, { email: "sans-arobase" }]) {
    assert.equal(validatePasswordResetPayload(bad).ok, false);
  }
});

test("demande d'inscription : tous les champs obligatoires sont controles", () => {
  const valide = {
    firstName: "Lina", lastName: "Bernard", email: "PARENT@Example.org", phone: "0601020304",
    birthDate: "2015-05-05", category: "U12 / U13", message: "Merci"
  };
  const ok = validateRegistrationLeadPayload(valide);
  assert.equal(ok.ok, true);
  assert.equal(ok.data.email, "parent@example.org");

  const vide = fieldsOf(validateRegistrationLeadPayload({}));
  for (const field of ["firstName", "lastName", "email", "phone", "birthDate", "category"]) {
    assert.ok(vide.includes(field), `${field} doit etre signale`);
  }

  // Une date de naissance dans le futur ou hors calendrier n'a pas de sens.
  assert.ok(fieldsOf(validateRegistrationLeadPayload({ ...valide, birthDate: "2099-01-01" })).includes("birthDate"));
  assert.ok(fieldsOf(validateRegistrationLeadPayload({ ...valide, birthDate: "2015-13-45" })).includes("birthDate"));
  assert.ok(fieldsOf(validateRegistrationLeadPayload({ ...valide, birthDate: "05/05/2015" })).includes("birthDate"));
  assert.ok(fieldsOf(validateRegistrationLeadPayload({ ...valide, message: "x".repeat(1501) })).includes("message"));
  assert.ok(fieldsOf(validateRegistrationLeadPayload({ ...valide, phone: "123" })).includes("phone"));
});

test("commande boutique : panier borne et articles controles", () => {
  const base = { fullName: "Famille Test", email: "famille@example.org", items: [{ name: "Maillot", quantity: 2, price: "35 €" }] };
  const ok = validateOrderRequestPayload(base);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.data.items, [{ name: "Maillot", quantity: 2, price: "35 €" }]);

  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, items: [] })).includes("items"));
  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, items: undefined })).includes("items"));
  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, items: Array.from({ length: 51 }, () => ({ name: "A", quantity: 1 })) })).includes("items"));
  // Quantites hors bornes : ni zero, ni negatif, ni au-dela du stock raisonnable.
  for (const quantity of [0, -1, 100, 1.5, "deux", null]) {
    assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, items: [{ name: "Maillot", quantity }] })).includes("items"), `quantite ${quantity} devait etre refusee`);
  }
  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, items: [{ name: "", quantity: 1 }] })).includes("items"));
  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, fullName: "A" })).includes("fullName"));
  assert.ok(fieldsOf(validateOrderRequestPayload({ ...base, email: "nope" })).includes("email"));
});

// --- Ecritures CRM ----------------------------------------------------------

test("mise a jour joueur : au moins un champ, et chaque champ borne", () => {
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({})).includes("body"));
  assert.equal(validateAdminPlayerUpdatePayload({ firstName: "Ana" }).ok, true);
  // Effacer une donnee facultative reste possible via null.
  assert.equal(validateAdminPlayerUpdatePayload({ licenseNumber: null }).ok, true);

  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ firstName: "A" })).includes("firstName"));
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ lastName: "B" })).includes("lastName"));
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ birthDate: "2099-01-01" })).includes("birthDate"));
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ gender: "AUTRE" })).includes("gender"));
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ categoryId: "pas-un-uuid" })).includes("categoryId"));
  assert.ok(fieldsOf(validateAdminPlayerUpdatePayload({ medicalNotes: "x".repeat(2001) })).includes("medicalNotes"));
});

test("profil public educateur : bornes de chaque champ affiche", () => {
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({})).includes("body"));
  assert.equal(validateEducatorPublicProfilePayload({ publicProfile: true }).ok, true);

  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ displayName: "A" })).includes("displayName"));
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ publicTitle: "x".repeat(121) })).includes("publicTitle"));
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ publicDiploma: "x".repeat(61) })).includes("publicDiploma"));
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ publicQuote: "x".repeat(281) })).includes("publicQuote"));
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ publicBio: "x".repeat(601) })).includes("publicBio"));
  assert.ok(fieldsOf(validateEducatorPublicProfilePayload({ publicJoinedYear: 1800 })).includes("publicJoinedYear"));
});

test("dirigeant : categorie fermee, bornes, et photo refusee si ce n'est pas une image", () => {
  const valide = { category: "BUREAU", fullName: "Ferhat Saglam", position: "President" };
  assert.equal(validateAdminOfficialPayload(valide).ok, true);
  assert.equal(validateAdminOfficialPayload({ ...valide, photoUrl: "/images/direction/president.jpg" }).ok, true);
  assert.equal(validateAdminOfficialPayload({ ...valide, photoUrl: "https://cdn.example.org/p.jpg" }).ok, true);
  // Le televersement Supabase auto-heberge produit une origine http : elle doit passer.
  assert.equal(validateAdminOfficialPayload({ ...valide, photoUrl: "http://kong:8000/storage/v1/object/public/x.jpg" }).ok, true);

  assert.ok(fieldsOf(validateAdminOfficialPayload({ ...valide, category: "AUTRE" })).includes("category"));
  assert.ok(fieldsOf(validateAdminOfficialPayload({ category: "BUREAU" })).includes("fullName"));
  for (const photoUrl of ["javascript:alert(1)", "data:text/html,<script>", "//evil.example.com/p.jpg", "https://user:pass@example.org/p.jpg", "x".repeat(1001)]) {
    assert.ok(fieldsOf(validateAdminOfficialPayload({ ...valide, photoUrl })).includes("photoUrl"), `${photoUrl.slice(0, 30)} devait etre refuse`);
  }
});

test("partenaire : logo et site web controles avant publication", () => {
  const valide = { name: "Pro Emba" };
  assert.equal(validateAdminPartnerPayload(valide).ok, true);
  assert.equal(validateAdminPartnerPayload({ ...valide, logoUrl: "/images/partners/pro-emba.svg" }).ok, true);
  assert.equal(validateAdminPartnerPayload({ ...valide, logoUrl: "http://kong:8000/storage/v1/object/public/logos/x.png" }).ok, true);
  assert.equal(validateAdminPartnerPayload({ ...valide, websiteUrl: "https://pro-emba.fr" }).ok, true);

  // Le site du partenaire devient un <a href> de l'accueil : pas de schema exotique.
  for (const websiteUrl of ["javascript:alert(1)", "data:text/html,<script>", "http://pro-emba.fr", "//evil.example.com"]) {
    assert.ok(fieldsOf(validateAdminPartnerPayload({ ...valide, websiteUrl })).includes("websiteUrl"), `${websiteUrl} devait etre refuse`);
  }
  for (const logoUrl of ["javascript:alert(1)", "data:image/svg+xml,<svg onload=alert(1)>", "//evil.example.com/l.png"]) {
    assert.ok(fieldsOf(validateAdminPartnerPayload({ ...valide, logoUrl })).includes("logoUrl"), `${logoUrl.slice(0, 30)} devait etre refuse`);
  }
});
