import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAdminMatchPayload,
  validateAdminContactMessageReviewPayload,
  validateAdminDocumentReviewPayload,
  validateAdminEventPayload,
  validateAdminMediaAlbumPayload,
  validateAdminMediaAssetPayload,
  validateAdminNewsPayload,
  validateAdminNotificationUpdatePayload,
  validateAdminOrderStatusPayload,
  validateAdminPartnerPayload,
  validateAdminPaymentUpdatePayload,
  validateAdminPartnershipRequestReviewPayload,
  validateAdminProductCategoryPayload,
  validateAdminProductPayload,
  validateAdminProductVariantPayload,
  validateAdminRecruitmentReviewPayload,
  validateAdminRegistrationReviewPayload,
  validateAdminTeamPayload,
  validateAdminTeamPlayerPayload,
  validateAdminTeamStaffPayload,
  validateAdminUserUpdatePayload,
  validateChildPayload,
  validateContactMessagePayload,
  validateCheckoutPayload,
  validateDocumentUploadPayload,
  validateLoginPayload,
  validateOrderPayload,
  validatePartnershipRequestPayload,
  validateProfileUpdatePayload,
  validateRefreshSessionPayload,
  validateRecruitmentApplicationPayload,
  validateRegistrationPayload,
  validateRegisterPayload
} from "../src/lib/api/validation.ts";
import { isSameOriginRequest } from "../src/lib/api/origin.ts";
import { canAccessCrmPath, hasPermission, isEducatorCrmPath } from "../src/lib/auth/permissions.ts";
import { canAdminUpdateProfile } from "../src/lib/auth/roles.ts";

function originRequest(headers, nextOrigin = "https://club.example") {
  const normalized = new Map(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
  return {
    nextUrl: { origin: nextOrigin },
    headers: {
      get(name) {
        return normalized.get(name.toLowerCase()) ?? null;
      }
    }
  };
}

test("public registration rejects privileged roles", () => {
  const result = validateRegisterPayload({
    email: "admin@example.com",
    password: "Password123",
    role: "SUPER_ADMIN"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Role non autorise/);
});

test("public registration normalizes email and accepts family role", () => {
  const result = validateRegisterPayload({
    email: " Parent@Example.COM ",
    password: "Password123",
    firstName: "Mamadou",
    lastName: "Bah",
    role: "FAMILLE"
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.email, "parent@example.com");
    assert.equal(result.data.role, "FAMILLE");
  }
});

test("login validation requires a valid email", () => {
  const result = validateLoginPayload({
    email: "not-an-email",
    password: "Password123"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Adresse email invalide/);
});

test("same-origin guard accepts same origin and server clients", () => {
  assert.equal(isSameOriginRequest(originRequest({ origin: "https://club.example" })), true);
  assert.equal(isSameOriginRequest(originRequest({ referer: "https://club.example/admin" })), true);
  assert.equal(isSameOriginRequest(originRequest({})), true);
});

test("same-origin guard accepts the request host when next origin differs", () => {
  assert.equal(
    isSameOriginRequest(
      originRequest({ origin: "http://127.0.0.1:3002", host: "127.0.0.1:3002", "x-forwarded-proto": "http" }, "http://localhost:3002")
    ),
    true
  );
});

test("same-origin guard rejects cross-origin browser requests", () => {
  assert.equal(isSameOriginRequest(originRequest({ origin: "https://evil.example" })), false);
  assert.equal(isSameOriginRequest(originRequest({ referer: "https://evil.example/form" })), false);
  assert.equal(isSameOriginRequest(originRequest({ referer: "not a url" })), false);
});

test("refresh token validation rejects short tokens", () => {
  const result = validateRefreshSessionPayload({
    refreshToken: "short"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Refresh token invalide/);
});

test("child validation accepts a valid player payload", () => {
  const result = validateChildPayload({
    firstName: "Ibrahima",
    lastName: "Diallo",
    birthDate: "2013-04-21",
    gender: "MASCULIN"
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.gender, "MASCULIN");
    assert.equal(result.data.birthDate, "2013-04-21");
  }
});

test("child validation rejects future birth dates", () => {
  const result = validateChildPayload({
    firstName: "Ibrahima",
    lastName: "Diallo",
    birthDate: "2999-01-01",
    gender: "MASCULIN"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Date de naissance invalide/);
});

test("registration validation requires a valid player id", () => {
  const result = validateRegistrationPayload({
    playerId: "not-a-uuid"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Identifiant joueur invalide/);
});

test("registration validation accepts a minimal payload", () => {
  const result = validateRegistrationPayload({
    playerId: "00000000-0000-4000-8000-000000000000"
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.playerId, "00000000-0000-4000-8000-000000000000");
  }
});

test("document upload validation rejects unsafe document types", () => {
  const result = validateDocumentUploadPayload({
    registrationId: "00000000-0000-4000-8000-000000000000",
    documentType: "../secret"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Type de document invalide/);
});

test("document upload validation accepts expected metadata", () => {
  const result = validateDocumentUploadPayload({
    registrationId: "00000000-0000-4000-8000-000000000000",
    documentType: "medical_certificate"
  });

  assert.equal(result.ok, true);
});

test("partnership request validation rejects invalid email", () => {
  const result = validatePartnershipRequestPayload({
    companyName: "Sponsor Local",
    contactName: "Mamadou Bah",
    email: "bad-email"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Adresse email invalide/);
});

test("partnership request validation accepts a valid request", () => {
  const result = validatePartnershipRequestPayload({
    companyName: "Sponsor Local",
    contactName: "Mamadou Bah",
    email: "contact@example.com",
    phone: "0169243950",
    message: "Nous souhaitons devenir partenaire."
  });

  assert.equal(result.ok, true);
});

test("recruitment application validation rejects future birth dates", () => {
  const result = validateRecruitmentApplicationPayload({
    firstName: "Ibrahima",
    lastName: "Diallo",
    birthDate: "2999-01-01",
    email: "joueur@example.com"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Date de naissance invalide/);
});

test("recruitment application validation accepts a valid application", () => {
  const result = validateRecruitmentApplicationPayload({
    firstName: "Ibrahima",
    lastName: "Diallo",
    birthDate: "2010-03-14",
    email: "joueur@example.com",
    currentClub: "Club actuel",
    position: "Milieu"
  });

  assert.equal(result.ok, true);
});

test("contact message validation rejects short messages", () => {
  const result = validateContactMessagePayload({
    fullName: "Mamadou Bah",
    email: "contact@example.com",
    subject: "Question",
    message: "Court"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Message invalide/);
});

test("contact message validation accepts a valid request", () => {
  const result = validateContactMessagePayload({
    fullName: "Mamadou Bah",
    email: "contact@example.com",
    phone: "0169243950",
    subject: "Inscription",
    message: "Bonjour, je souhaite avoir des informations sur les inscriptions."
  });

  assert.equal(result.ok, true);
});

test("admin permission is not granted to family role", () => {
  assert.equal(hasPermission("FAMILLE", "admin:access"), false);
});

test("admin permission is granted to club admin role", () => {
  assert.equal(hasPermission("ADMIN_CLUB", "admin:access"), true);
});

test("crm page access is limited to club management roles", () => {
  assert.equal(hasPermission("SUPER_ADMIN", "admin:access"), true);
  assert.equal(hasPermission("ADMIN_CLUB", "admin:access"), true);
  assert.equal(hasPermission("DIRIGEANT", "admin:access"), true);
  assert.equal(hasPermission("EDUCATEUR", "admin:access"), false);
  assert.equal(hasPermission("FAMILLE", "admin:access"), false);
  assert.equal(hasPermission("MEMBRE", "admin:access"), false);
});

test("educator crm access is limited to convocations", () => {
  assert.equal(isEducatorCrmPath("/admin/convocations"), true);
  assert.equal(isEducatorCrmPath("/admin/convocations/weekend"), true);
  assert.equal(isEducatorCrmPath("/admin"), false);
  assert.equal(isEducatorCrmPath("/admin/equipes"), false);

  assert.equal(canAccessCrmPath("EDUCATEUR", "/admin/convocations"), true);
  assert.equal(canAccessCrmPath("EDUCATEUR", "/admin"), false);
  assert.equal(canAccessCrmPath("EDUCATEUR", "/admin/equipes"), false);
  assert.equal(canAccessCrmPath("FAMILLE", "/admin/convocations"), false);
  assert.equal(canAccessCrmPath("ADMIN_CLUB", "/admin/equipes"), true);
});

test("educator permission is limited to educator and club management roles", () => {
  assert.equal(hasPermission("EDUCATEUR", "educator:manage_own_teams"), true);
  assert.equal(hasPermission("FAMILLE", "educator:manage_own_teams"), false);
  assert.equal(hasPermission("DIRIGEANT", "teams:manage"), true);
});

test("order validation rejects empty carts", () => {
  const result = validateOrderPayload({
    email: "client@example.com",
    customerName: "Client Test",
    items: []
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /commande doit contenir/);
});

test("order validation accepts a valid cart", () => {
  const result = validateOrderPayload({
    email: "client@example.com",
    customerName: "Client Test",
    items: [
      {
        productId: "00000000-0000-4000-8000-000000000000",
        quantity: 2
      }
    ]
  });

  assert.equal(result.ok, true);
});

test("checkout validation requires an order or registration", () => {
  const result = validateCheckoutPayload({
    provider: "manual"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /commande ou une inscription/);
});

test("checkout validation accepts a manual order checkout", () => {
  const result = validateCheckoutPayload({
    orderId: "00000000-0000-4000-8000-000000000000",
    provider: "manual"
  });

  assert.equal(result.ok, true);
});

test("admin product category validation rejects invalid slugs", () => {
  const result = validateAdminProductCategoryPayload({
    name: "Textile",
    slug: "Textile Club"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Slug categorie produit invalide/);
});

test("admin product validation requires a valid price on creation", () => {
  const result = validateAdminProductPayload({
    name: "Maillot domicile",
    priceCents: -1
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Prix produit invalide/);
});

test("admin product variant validation accepts stock updates", () => {
  const result = validateAdminProductVariantPayload({
    label: "Taille M",
    stockQuantity: 12,
    priceDeltaCents: 0,
    isActive: true
  });

  assert.equal(result.ok, true);
});

test("admin order status validation rejects unknown statuses", () => {
  const result = validateAdminOrderStatusPayload({
    status: "SHIPPED"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Statut commande invalide/);
});

test("admin payment update validation accepts provider references", () => {
  const result = validateAdminPaymentUpdatePayload({
    status: "SUCCEEDED",
    providerReference: "manual-2026-0001",
    metadata: { source: "admin" }
  });

  assert.equal(result.ok, true);
});

test("admin payment update validation rejects non-object metadata", () => {
  const result = validateAdminPaymentUpdatePayload({
    metadata: "bad"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Metadata paiement invalide/);
});

test("admin notification update validation rejects invalid statuses", () => {
  const result = validateAdminNotificationUpdatePayload({
    status: "DONE"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Statut notification invalide/);
});

test("admin news validation rejects short content", () => {
  const result = validateAdminNewsPayload({
    title: "Victoire",
    content: "Court"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Contenu invalide/);
});

test("admin news validation accepts a publishable article", () => {
  const result = validateAdminNewsPayload({
    title: "Victoire des Seniors R1",
    slug: "victoire-seniors-r1",
    content: "Un contenu complet pour publier une actualite officielle du club.",
    status: "PUBLISHED",
    publishedAt: "2026-06-06T10:00:00.000Z"
  });

  assert.equal(result.ok, true);
});

test("admin match validation rejects invalid scores", () => {
  const result = validateAdminMatchPayload({
    opponentName: "Evry FC",
    startsAt: "2026-09-01T15:00:00.000Z",
    homeScore: -1
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Score domicile invalide/);
});

test("admin match validation accepts a scheduled match", () => {
  const result = validateAdminMatchPayload({
    opponentName: "Evry FC",
    startsAt: "2026-09-01T15:00:00.000Z",
    location: "HOME",
    status: "SCHEDULED",
    venue: "Stade Henri Longuet"
  });

  assert.equal(result.ok, true);
});

test("admin event validation rejects inverted dates", () => {
  const result = validateAdminEventPayload({
    title: "Reunion educateurs",
    startsAt: "2026-09-01T18:00:00.000Z",
    endsAt: "2026-09-01T17:00:00.000Z"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /fin doit etre apres le debut/);
});

test("admin event validation accepts a public club event", () => {
  const result = validateAdminEventPayload({
    title: "Forum des associations",
    type: "CLUB_EVENT",
    startsAt: "2026-09-05T10:00:00.000Z",
    endsAt: "2026-09-05T16:00:00.000Z",
    venue: "Stade Henri Longuet",
    visibility: "PUBLIC",
    isFeatured: true
  });

  assert.equal(result.ok, true);
});

test("admin team validation rejects invalid slugs", () => {
  const result = validateAdminTeamPayload({
    name: "Seniors R1",
    slug: "Seniors R1"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Slug equipe invalide/);
});

test("admin team validation accepts a publishable team", () => {
  const result = validateAdminTeamPayload({
    name: "Seniors R1",
    slug: "seniors-r1",
    gender: "MASCULIN",
    orderIndex: 1,
    isActive: true
  });

  assert.equal(result.ok, true);
});

test("admin team staff validation accepts a coach", () => {
  const result = validateAdminTeamStaffPayload({
    profileId: "00000000-0000-4000-8000-000000000000",
    displayName: "Coach Principal",
    roleTitle: "Entraineur principal",
    isHeadCoach: true
  });

  assert.equal(result.ok, true);
});

test("admin team player validation rejects invalid shirt numbers", () => {
  const result = validateAdminTeamPlayerPayload({
    playerId: "00000000-0000-4000-8000-000000000000",
    shirtNumber: 120
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Numero de maillot invalide/);
});

test("admin registration review rejects invalid statuses", () => {
  const result = validateAdminRegistrationReviewPayload({
    status: "DONE"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Statut de dossier invalide/);
});

test("admin registration review accepts validation", () => {
  const result = validateAdminRegistrationReviewPayload({
    status: "VALIDATED",
    adminNotes: "Dossier complet."
  });

  assert.equal(result.ok, true);
});

test("admin document review requires a rejection reason when rejected", () => {
  const result = validateAdminDocumentReviewPayload({
    status: "REJECTED"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Motif obligatoire/);
});

test("admin document review accepts validation", () => {
  const result = validateAdminDocumentReviewPayload({
    status: "VALIDATED"
  });

  assert.equal(result.ok, true);
});

test("admin media album validation accepts a published album", () => {
  const result = validateAdminMediaAlbumPayload({
    title: "Photos Seniors",
    slug: "photos-seniors",
    status: "PUBLISHED",
    publishedAt: "2026-06-06T10:00:00.000Z"
  });

  assert.equal(result.ok, true);
});

test("admin media asset validation requires an url on creation", () => {
  const result = validateAdminMediaAssetPayload({
    title: "Photo equipe"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /URL media invalide/);
});

test("admin partner validation rejects invalid slugs", () => {
  const result = validateAdminPartnerPayload({
    name: "Partenaire Local",
    slug: "Partenaire Local"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Slug partenaire invalide/);
});

test("admin partnership request review accepts status updates", () => {
  const result = validateAdminPartnershipRequestReviewPayload({
    status: "CONTACTED"
  });

  assert.equal(result.ok, true);
});

test("admin recruitment review accepts trial scheduling", () => {
  const result = validateAdminRecruitmentReviewPayload({
    status: "TRIAL_SCHEDULED"
  });

  assert.equal(result.ok, true);
});

test("admin contact message review rejects invalid assignees", () => {
  const result = validateAdminContactMessageReviewPayload({
    assignedTo: "bad-id"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Identifiant responsable invalide/);
});

test("profile update validation requires at least one profile field", () => {
  const result = validateProfileUpdatePayload({});

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Au moins un champ/);
});

test("profile update validation accepts normalized public fields", () => {
  const result = validateProfileUpdatePayload({
    firstName: " Mamadou ",
    lastName: " Bah ",
    phone: "01 69 24 39 50",
    birthDate: "1989-03-12"
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.firstName, "Mamadou");
    assert.equal(result.data.lastName, "Bah");
    assert.equal(result.data.birthDate, "1989-03-12");
  }
});

test("profile update validation rejects future birth dates", () => {
  const result = validateProfileUpdatePayload({
    birthDate: "2999-01-01"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Date de naissance invalide/);
});

test("admin user update validation rejects invalid role and status", () => {
  const result = validateAdminUserUpdatePayload({
    role: "ROOT",
    status: "BLOCKED"
  });

  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result), /Role invalide/);
  assert.match(JSON.stringify(result), /Statut profil invalide/);
});

test("admin user update validation normalizes email and accepts profile fields", () => {
  const result = validateAdminUserUpdatePayload({
    email: " Dirigeant@Example.COM ",
    role: "DIRIGEANT",
    status: "ACTIVE",
    displayName: "Dirigeant Club"
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.data.email, "dirigeant@example.com");
    assert.equal(result.data.role, "DIRIGEANT");
    assert.equal(result.data.status, "ACTIVE");
    assert.equal(result.data.displayName, "Dirigeant Club");
  }
});

test("ADMIN_CLUB cannot promote a user to SUPER_ADMIN", () => {
  const guard = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "actor-1",
    targetId: "target-1",
    targetCurrentRole: "FAMILLE",
    requestedRole: "SUPER_ADMIN"
  });
  assert.equal(guard.ok, false);
});

test("ADMIN_CLUB cannot promote a user to ADMIN_CLUB (equal level)", () => {
  const guard = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "actor-1",
    targetId: "target-1",
    targetCurrentRole: "FAMILLE",
    requestedRole: "ADMIN_CLUB"
  });
  assert.equal(guard.ok, false);
});

test("ADMIN_CLUB cannot modify a SUPER_ADMIN account", () => {
  const guard = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "actor-1",
    targetId: "target-1",
    targetCurrentRole: "SUPER_ADMIN",
    changesStatus: true
  });
  assert.equal(guard.ok, false);
});

test("an actor cannot change their own role or status", () => {
  const roleChange = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "same",
    targetId: "same",
    targetCurrentRole: "ADMIN_CLUB",
    requestedRole: "ADMIN_CLUB"
  });
  assert.equal(roleChange.ok, false);

  const statusChange = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "same",
    targetId: "same",
    targetCurrentRole: "ADMIN_CLUB",
    changesStatus: true
  });
  assert.equal(statusChange.ok, false);
});

test("ADMIN_CLUB can update a lower-privilege account to a lower role", () => {
  const guard = canAdminUpdateProfile({
    actorRole: "ADMIN_CLUB",
    actorId: "actor-1",
    targetId: "target-1",
    targetCurrentRole: "FAMILLE",
    requestedRole: "EDUCATEUR"
  });
  assert.equal(guard.ok, true);
});

test("SUPER_ADMIN can promote anyone to SUPER_ADMIN", () => {
  const guard = canAdminUpdateProfile({
    actorRole: "SUPER_ADMIN",
    actorId: "actor-1",
    targetId: "target-1",
    targetCurrentRole: "ADMIN_CLUB",
    requestedRole: "SUPER_ADMIN"
  });
  assert.equal(guard.ok, true);
});
