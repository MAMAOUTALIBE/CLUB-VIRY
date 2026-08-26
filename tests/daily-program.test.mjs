import test from "node:test";
import assert from "node:assert/strict";
import { getParisCivilDay, selectDailyProgramItems } from "../src/lib/daily-program.ts";

const base = (overrides = {}) => ({ id: "1", kind: "match", eyebrow: "Match officiel", title: "U15", home: "ES Viry", away: "Évry", dateLabel: "", timeLabel: "19h00", place: "Longuet", startsAt: "2026-09-03T17:00:00Z", status: "SCHEDULED", homeScore: null, awayScore: null, ...overrides });
const now = new Date("2026-09-03T10:00:00Z");

test("sélectionne le jour Paris et trie", () => assert.deepEqual(selectDailyProgramItems([base(), base({ id: "2", kind: "event", eventType: "TRAINING", title: "U9", startsAt: "2026-09-03T15:30:00Z" }), base({ id: "3", startsAt: "2026-09-04T17:00:00Z" })], now).map((x) => x.id), ["2", "1"]));
test("journée vide sans fallback", () => assert.deepEqual(selectDailyProgramItems([], now), []));
test("match sans score reste Match", () => { const [x] = selectDailyProgramItems([base()], now); assert.equal(x.badge, "Match"); assert.equal(x.showScore, false); });
test("match terminé avec scores montre le résultat", () => { const [x] = selectDailyProgramItems([base({ status: "FINISHED", homeScore: 3, awayScore: 1 })], now); assert.equal(x.badge, "Terminé"); assert.equal(x.showScore, true); });
test("match terminé sans deux scores ne montre aucun résultat", () => { const [x] = selectDailyProgramItems([base({ status: "FINISHED", homeScore: 3 })], now); assert.equal(x.badge, "Terminé"); assert.equal(x.showScore, false); });
test("séance annulée persistée", () => { const [x] = selectDailyProgramItems([base({ kind: "event", eventType: "TRAINING", status: "CANCELLED" })], now); assert.equal(x.badge, "Annulé"); });
test("bascule à minuit Europe Paris", () => { assert.equal(getParisCivilDay("2026-08-26T21:59:59Z"), "2026-08-26"); assert.equal(getParisCivilDay("2026-08-26T22:00:00Z"), "2026-08-27"); });
