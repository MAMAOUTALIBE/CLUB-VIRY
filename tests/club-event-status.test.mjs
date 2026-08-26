import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
test("mapping du statut et du type CRM avec heure Europe Paris", async () => {
  const source = await readFile(new URL("../src/lib/calendar-view.ts", import.meta.url), "utf8");
  assert.match(source, /eventType: event\.type/);
  assert.match(source, /status: event\.status/);
  assert.match(source, /timeZone: "Europe\/Paris"/);
});

test("le pipeline quotidien préserve un lieu CRM absent sans placeholder", async () => {
  const calendarSource = await readFile(new URL("../src/lib/calendar-view.ts", import.meta.url), "utf8");
  const dailySource = await readFile(new URL("../src/components/MobileDailyProgram.tsx", import.meta.url), "utf8");
  assert.match(calendarSource, /strictNoFallback \? event\.venue \?\? undefined/);
  assert.match(calendarSource, /calendarApiToItems\(calendar, \{ strictNoFallback: true \}\)/);
  assert.doesNotMatch(dailySource, /Lieu à confirmer|Éducateur à confirmer|educator\s*\?\?/i);
  assert.match(dailySource, /item\.place \? <p/);
});
test("migration additive et contrainte", async () => { const sql = await readFile(new URL("../supabase/migrations/20260826173000_club_event_status.sql", import.meta.url), "utf8"); assert.match(sql, /add column if not exists status text not null default 'SCHEDULED'/); assert.match(sql, /status in \('SCHEDULED', 'CANCELLED'\)/); });
