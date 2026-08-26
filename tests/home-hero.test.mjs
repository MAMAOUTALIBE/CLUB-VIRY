import assert from "node:assert/strict";
import test from "node:test";

import { getVisibleHeroSlides, isAllowedHeroImageUrl, isSafeHeroLink, validateHomeHeroSetting } from "../src/lib/home-hero.ts";
import { isAllowedSettingKey } from "../src/lib/settings-keys.ts";

const slide = (overrides = {}) => ({ id: "one", title: "Bienvenue", description: "Au club", imageUrl: "/hero.jpg", buttonLabel: "Découvrir", buttonHref: "/le-club", active: true, startAt: "", endAt: "", ...overrides });

test("home hero accepts only image sources supported by Next and CSP", () => {
  assert.equal(isAllowedHeroImageUrl("/images/hero.jpg"), true);
  assert.equal(isAllowedHeroImageUrl("https://images.unsplash.com/photo-1"), true);
  assert.equal(isAllowedHeroImageUrl("https://club.supabase.co/storage/v1/object/public/hero.jpg"), true);
  assert.equal(isAllowedHeroImageUrl("https://example.com/hero.jpg"), false);
  assert.equal(isAllowedHeroImageUrl("javascript:alert(1)"), false);
});

test("home hero validator enforces required fields, unique ids, safe links and ordered dates", () => {
  assert.equal(validateHomeHeroSetting({ slides: [slide()] }).ok, true);
  const result = validateHomeHeroSetting({ slides: [slide({ imageUrl: "https://example.com/x.jpg", startAt: "2026-02-02", endAt: "2026-01-01" }), slide()] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some((issue) => issue.field === "slides.0.imageUrl"));
    assert.ok(result.issues.some((issue) => issue.field === "slides.0.endAt"));
    assert.ok(result.issues.some((issue) => issue.field === "slides.1.id"));
  }
});

test("home hero links accept only real public routes, known anchors and HTTPS URLs", () => {
  assert.equal(isSafeHeroLink(""), false);
  assert.equal(isSafeHeroLink("#"), false);
  assert.equal(isSafeHeroLink("#valeurs"), false);
  assert.equal(isSafeHeroLink("/route-inexistante"), false);
  assert.equal(isSafeHeroLink("/le-club/valeurs-partenaires#valeurs"), true);
  assert.equal(isSafeHeroLink("/le-club/valeurs-partenaires#inconnue"), false);
  assert.equal(isSafeHeroLink("/equipes/u18-a"), true);
  assert.equal(isSafeHeroLink("/actualites/un-nouvel-article"), true);
  assert.equal(isSafeHeroLink("https://example.com/campagne"), true);
  assert.equal(isSafeHeroLink("https://user:password@example.com/campagne"), false);
  assert.equal(isSafeHeroLink("http://example.com/campagne"), false);
});

test("home hero validator rejects a missing CTA destination", () => {
  const result = validateHomeHeroSetting({ slides: [slide({ buttonHref: "   " })] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.issues.some((issue) => issue.field === "slides.0.buttonHref"));
});

test("home hero filters scheduled slides and falls back if none is visible", () => {
  const fallback = [slide({ id: "fallback" })];
  const now = new Date("2026-01-10T12:00:00Z").getTime();
  assert.deepEqual(getVisibleHeroSlides([slide({ active: false })], fallback, now), fallback);
  assert.deepEqual(getVisibleHeroSlides([slide({ startAt: "2026-02-01T00:00:00Z" })], fallback, now), fallback);
  assert.equal(getVisibleHeroSlides([slide({ startAt: "2026-01-01T00:00:00Z", endAt: "2026-02-01T00:00:00Z" })], fallback, now)[0].id, "one");
});

test("home_hero is an explicitly authorized setting key", () => {
  assert.equal(isAllowedSettingKey("home_hero"), true);
  assert.equal(isAllowedSettingKey("unknown_setting"), false);
});
