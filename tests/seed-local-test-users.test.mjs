import assert from "node:assert/strict";
import test from "node:test";

import { isLocalSupabaseUrl, testUsers } from "../scripts/seed-local-test-users.mjs";

test("seed guard accepts local Supabase URLs only", () => {
  assert.equal(isLocalSupabaseUrl("http://127.0.0.1:54321"), true);
  assert.equal(isLocalSupabaseUrl("http://localhost:54321"), true);
  assert.equal(isLocalSupabaseUrl("https://club-viry.localhost"), true);
  assert.equal(isLocalSupabaseUrl("https://example.supabase.co"), false);
  assert.equal(isLocalSupabaseUrl("not-a-url"), false);
});

test("local test seed contains one admin and ten educators", () => {
  assert.equal(testUsers.filter((user) => user.role === "SUPER_ADMIN").length, 1);
  assert.equal(testUsers.filter((user) => user.role === "EDUCATEUR").length, 10);
  assert.equal(testUsers.every((user) => user.email.endsWith("@club-viry.local")), true);
});
