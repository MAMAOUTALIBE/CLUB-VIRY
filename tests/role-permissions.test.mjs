import assert from "node:assert/strict";
import test from "node:test";

import {
  applyPermissionOverrides,
  resetPermissionOverrides,
  hasPermission,
  getEffectivePermissions,
  ROLE_PERMISSIONS
} from "../src/lib/auth/permissions.ts";
import { validateRolePermissionsPayload } from "../src/lib/api/validation.ts";

test("par défaut : permissions = ROLE_PERMISSIONS du code", () => {
  resetPermissionOverrides();
  assert.equal(hasPermission("DIRIGEANT", "teams:manage"), true);
  assert.equal(hasPermission("EDITEUR", "shop:manage"), false);
});

test("surcharge : remplace le jeu d'un rôle", () => {
  resetPermissionOverrides();
  applyPermissionOverrides({ EDITEUR: ["admin:access", "shop:manage"] });
  assert.equal(hasPermission("EDITEUR", "shop:manage"), true);
  assert.equal(hasPermission("EDITEUR", "content:manage"), false); // retiré par la surcharge
  // Rôle non surchargé : inchangé
  assert.equal(hasPermission("DIRIGEANT", "teams:manage"), true);
  resetPermissionOverrides();
});

test("SUPER_ADMIN est verrouillé : une surcharge ne le réduit pas", () => {
  resetPermissionOverrides();
  applyPermissionOverrides({ SUPER_ADMIN: ["public:read"] });
  // Doit conserver TOUTES ses permissions par défaut malgré la tentative
  for (const perm of ROLE_PERMISSIONS.SUPER_ADMIN) {
    assert.equal(hasPermission("SUPER_ADMIN", perm), true);
  }
  resetPermissionOverrides();
});

test("reset : retour aux défauts", () => {
  applyPermissionOverrides({ DIRIGEANT: [] });
  assert.equal(hasPermission("DIRIGEANT", "teams:manage"), false);
  resetPermissionOverrides();
  assert.equal(hasPermission("DIRIGEANT", "teams:manage"), true);
});

test("getEffectivePermissions reflète la surcharge", () => {
  resetPermissionOverrides();
  applyPermissionOverrides({ CONTRIBUTEUR: ["admin:access", "content:publish", "public:read"] });
  const perms = getEffectivePermissions("CONTRIBUTEUR");
  assert.ok(perms.includes("content:publish"));
  assert.ok(!perms.includes("content:manage"));
  resetPermissionOverrides();
});

test("validateur : liste valide", () => {
  const r = validateRolePermissionsPayload({ permissions: ["admin:access", "teams:manage", "teams:manage"] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.permissions.sort(), ["admin:access", "teams:manage"]);
});

test("validateur : permission inconnue rejetée", () => {
  const r = validateRolePermissionsPayload({ permissions: ["admin:access", "god:mode"] });
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.field === "permissions"));
});

test("validateur : non-tableau rejeté", () => {
  const r = validateRolePermissionsPayload({ permissions: "admin:access" });
  assert.equal(r.ok, false);
});
