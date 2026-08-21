import assert from "node:assert/strict";
import test from "node:test";

import { getVisibleAnnouncements, isSafeAnnouncementLink, validateAnnouncementsSetting } from "../src/lib/announcements.ts";
import { isAllowedSettingKey } from "../src/lib/settings-keys.ts";

const announcement = (overrides = {}) => ({ id: "one", message: "Match déplacé", type: "info", linkLabel: "Calendrier", linkHref: "/calendrier", active: true, startAt: "", endAt: "", priority: 50, ...overrides });

test("announcement links allow internal paths and HTTPS only", () => {
  assert.equal(isSafeAnnouncementLink("/calendrier"), true);
  assert.equal(isSafeAnnouncementLink("https://example.com/info"), true);
  assert.equal(isSafeAnnouncementLink("//example.com/info"), false);
  assert.equal(isSafeAnnouncementLink("javascript:alert(1)"), false);
});

test("announcement validator is strict and checks ids, dates, fields and priority", () => {
  assert.equal(validateAnnouncementsSetting({ items: [announcement()] }).ok, true);
  assert.equal(validateAnnouncementsSetting({ items: [] }).ok, true);
  const result = validateAnnouncementsSetting({ items: [announcement({ type: "danger", priority: 101, startAt: "2026-03-01", endAt: "2026-02-01" }), announcement()] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.field === "items.0.type"));
    assert.ok(result.issues.some((issue) => issue.field === "items.0.priority"));
    assert.ok(result.issues.some((issue) => issue.field === "items.0.endAt"));
    assert.ok(result.issues.some((issue) => issue.field === "items.1.id"));
  }
});

test("public announcements filter active windows then sort by priority and editor order", () => {
  const now = new Date("2026-02-10T12:00:00Z").getTime();
  const items = [announcement({ id: "normal", priority: 20 }), announcement({ id: "high-first", priority: 80 }), announcement({ id: "high-second", priority: 80 }), announcement({ id: "off", active: false, priority: 100 }), announcement({ id: "future", startAt: "2026-03-01", priority: 100 })];
  assert.deepEqual(getVisibleAnnouncements(items, now).map((item) => item.id), ["high-first", "high-second", "normal"]);
  assert.deepEqual(getVisibleAnnouncements(null, now), []);
});

test("announcements is an explicitly authorized setting key", () => {
  assert.equal(isAllowedSettingKey("announcements"), true);
});
