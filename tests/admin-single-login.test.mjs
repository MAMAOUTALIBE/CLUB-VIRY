import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ADMIN_COMPONENTS = [
  "../src/components/admin/AdminCrud.tsx",
  "../src/components/admin/Admin360Explorer.tsx",
  "../src/components/admin/Admin360Detail.tsx",
  "../src/components/admin/AdminModuleBoard.tsx",
  "../src/components/admin/modules/SettingsAdmin.tsx",
  "../src/components/admin/modules/TeamRosterEditor.tsx",
  "../src/components/admin/modules/TrashAdmin.tsx",
  "../src/components/admin/modules/AuditLogAdmin.tsx"
];

test("aucun module CRM ne redemande email et mot de passe", async () => {
  for (const path of ADMIN_COMPONENTS) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /AdminAccessControl/, path);
  }
});

test("une session CRM expirée revient à la connexion centrale", async () => {
  const redirect = await readFile(new URL("../src/components/admin/AdminSessionRedirect.tsx", import.meta.url), "utf8");
  const login = await readFile(new URL("../src/app/connexion/page.tsx", import.meta.url), "utf8");
  const proxy = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");

  assert.match(redirect, /window\.location\.replace\(`\/connexion\?next=/);
  assert.match(login, /AdminLoginPanel/);
  assert.match(proxy, /request\.nextUrl\.pathname\.startsWith\("\/admin"\)/);

  for (const path of [
    "../src/components/admin/Admin360Explorer.tsx",
    "../src/components/admin/Admin360Detail.tsx",
    "../src/components/admin/AdminModuleBoard.tsx"
  ]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /response\.status === 401/, path);
    assert.match(source, /<AdminSessionRedirect \/>/, path);
  }
});
