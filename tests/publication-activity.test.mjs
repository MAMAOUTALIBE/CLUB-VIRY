import assert from "node:assert/strict";
import test from "node:test";
import { bucketPublicationActivity, dedupeRowsById, effectivePublicationTimestamps, getParisWeekWindow, getPublicationActivityWindow, parisDateKey, parisWeekDateKeys } from "../src/lib/publication-activity.ts";

test("publication activity uses thirty Europe/Paris calendar days across DST", () => {
  const now = new Date("2026-04-02T10:00:00Z");
  const window = getPublicationActivityWindow(now);
  assert.equal(window.dateKeys.length, 30);
  assert.equal(window.dateKeys.at(-1), "2026-04-02");
  assert.equal(window.startIso, "2026-03-03T23:00:00.000Z");
  assert.equal(window.endExclusiveIso, "2026-04-02T22:00:00.000Z");
});

test("publication timestamps are bucketed by Paris date and invalid values ignored", () => {
  const result = bucketPublicationActivity(["2026-04-01T22:30:00Z", "2026-04-02T21:59:59Z", "invalid"], new Date("2026-04-02T12:00:00Z"));
  assert.equal(result.at(-1)?.date, "2026-04-02");
  assert.equal(result.at(-1)?.count, 2);
  assert.equal(parisDateKey(new Date("2026-04-01T22:30:00Z")), "2026-04-02");
});

test("Paris week window starts Monday and excludes next Monday", () => {
  assert.deepEqual(getParisWeekWindow(new Date("2026-08-20T12:00:00Z")), { startIso: "2026-08-16T22:00:00.000Z", endExclusiveIso: "2026-08-23T22:00:00.000Z" });
});

test("immediate publications fall back to created_at and rows are deduplicated", () => {
  assert.deepEqual(effectivePublicationTimestamps([{ id: "a", published_at: null, created_at: "2026-08-20T12:00:00Z" }, { id: "a", published_at: null, created_at: "2026-08-20T12:00:00Z" }, { id: "b", published_at: "2026-08-19T10:00:00Z", created_at: "2026-08-18T10:00:00Z" }]), ["2026-08-20T12:00:00Z", "2026-08-19T10:00:00Z"]);
});

test("client week keys and midnight matching remain locked to Paris", () => {
  const keys = parisWeekDateKeys("2026-03-29T22:00:00.000Z");
  assert.deepEqual(keys, ["2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05"]);
  assert.equal(parisDateKey(new Date("2026-03-29T22:30:00Z")), "2026-03-30");
});

test("calendar boundary duplicates are removed without changing stable order", () => {
  const rows = [{ id: "a", value: 1 }, { id: "b", value: 2 }, { id: "b", value: 3 }, { id: "c", value: 4 }];
  assert.deepEqual(dedupeRowsById(rows), [rows[0], rows[1], rows[3]]);
});
