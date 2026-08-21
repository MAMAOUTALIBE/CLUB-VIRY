import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const teamsSource = await readFile(new URL("../src/lib/db/teams.ts", import.meta.url), "utf8");

function functionSource(name) {
  const start = teamsSource.indexOf(`async function ${name}`);
  assert.notEqual(start, -1, `${name} doit exister`);
  const next = teamsSource.indexOf("\nasync function ", start + 1);
  return teamsSource.slice(start, next === -1 ? undefined : next);
}

test("educator staff lookup does not query a nonexistent deleted_at column", () => {
  const source = functionSource("getTeamStaffByTeamIds");
  assert.match(source, /\.from\("team_staff"\)/);
  assert.doesNotMatch(source, /deleted_at/);
});

test("educator match lookup excludes archived matches", () => {
  const source = functionSource("getTeamMatchesByTeamIds");
  assert.match(source, /\.from\("matches"\)[\s\S]*?\.is\("deleted_at", null\)/);
});
