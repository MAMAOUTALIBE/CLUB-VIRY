import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/MobileDailyProgram.tsx", import.meta.url), "utf8");

test("l’accueil mobile limite le programme du jour aux trois premiers événements", () => {
  assert.match(source, /dailyItems\.slice\(0, 3\)/);
  assert.match(source, /visibleDailyItems\.map/);
});

test("le compteur total reste visible et le planning complet reste accessible", () => {
  assert.match(source, /\{dailyItems\.length\} événement/);
  assert.match(source, /href="\/calendrier"/);
  assert.match(source, />Voir tout le planning /);
});
