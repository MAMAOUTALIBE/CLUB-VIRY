import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/admin/families/[id]/access/route.ts", import.meta.url), "utf8");
const database = await readFile(new URL("../src/lib/db/family-access.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/admin/FamilyAccessAdmin.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/app/admin/familles/[id]/page.tsx", import.meta.url), "utf8");

test("family access administration is protected by user-management permission", () => {
  const permissionChecks = route.match(/getAdminContext\(request, "admin:manage_users"\)/g) ?? [];
  assert.equal(permissionChecks.length, 5);
  assert.match(route, /validateAdminFamilyAccessCreatePayload/);
  assert.match(route, /validateAdminFamilyAccessPasswordPayload/);
  assert.doesNotMatch(route, /password[^\n]*metadata/i);
});

test("family accounts are always created with the FAMILLE role and confirmed email", () => {
  assert.match(database, /email_confirm:\s*true/);
  assert.match(database, /role:\s*"FAMILLE"/);
  assert.match(database, /status:\s*"ACTIVE"/);
  assert.match(database, /family_members/);
  assert.match(database, /primary_contact_id/);
  assert.match(database, /deleteUser\(authData\.user\.id\)/);
});

test("family detail exposes account creation, linking, reset and unlink actions", () => {
  assert.match(page, /FamilyAccessAdmin/);
  assert.match(component, /Créer un accès/);
  assert.match(component, /Rattacher un compte existant/);
  assert.match(component, /Nouveau mot de passe/);
  assert.match(component, /Retirer l’accès/);
  assert.match(component, /\/espace-famille/);
});
