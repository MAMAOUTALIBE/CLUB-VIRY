import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sportsHubSource = await readFile(new URL("../src/components/HomeSportsHub.tsx", import.meta.url), "utf8");
const adminShellSource = await readFile(new URL("../src/components/admin/AdminShell.tsx", import.meta.url), "utf8");
const layoutSource = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const globalStyles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("the training calendar no longer exposes a misleading formation link", () => {
  assert.doesNotMatch(sportsHubSource, /href="\/formation"/);
  assert.doesNotMatch(sportsHubSource, /Voir tout le planning|Voir le planning complet/);
  assert.match(sportsHubSource, /Planning des entraînements/);
  assert.match(sportsHubSource, /displayedSchedule\.map/);
});

test("the CRM header contains no inactive search or fake notification control", () => {
  assert.doesNotMatch(adminShellSource, /Rechercher dans le CRM|placeholder="Rechercher|aria-label="Notifications"/);
  assert.doesNotMatch(adminShellSource, /\bBell\b|\bSearch\b/);
  assert.match(adminShellSource, /aria-haspopup="menu"/);
  assert.match(adminShellSource, /Voir le site public/);
});

test("the script font uses local system fallbacks without next font network imports", () => {
  assert.doesNotMatch(layoutSource, /next\/font\/google|Kaushan_Script|scriptFont/);
  assert.match(globalStyles, /--font-script:\s*"Snell Roundhand"/);
  assert.match(globalStyles, /font-family:\s*var\(--font-script\)/);
});
