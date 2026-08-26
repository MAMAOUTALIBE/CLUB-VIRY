import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const carouselSource = await readFile(new URL("../src/components/HomeHeroCarousel.tsx", import.meta.url), "utf8");

test("mobile and tablet reuse the CMS carousel while desktop keeps its existing variant", () => {
  assert.match(homeSource, /<HomeHeroCarousel slides=\{heroSlides\} variant="mobile" \/>/);
  assert.match(homeSource, /<HomeHeroCarousel slides=\{heroSlides\} \/>/);
  assert.doesNotMatch(homeSource, /const heroLead =/);
});

test("the mobile hero exposes its CMS title, balanced calls to action and accessible controls", () => {
  assert.match(carouselSource, /variant\?: "desktop" \| "mobile"/);
  assert.match(carouselSource, /activeSlide\?\.title/);
  assert.ok(carouselSource.includes(">Nos équipes<"));
  assert.match(carouselSource, /grid grid-cols-2 gap-3/);
  assert.match(carouselSource, /aria-current=/);
  assert.match(carouselSource, /Afficher la diapositive/);
  assert.match(carouselSource, /prefers-reduced-motion: reduce/);
  assert.match(carouselSource, /isMobile \? "center 78%" : \(slide\.objectPosition \?\? "center"\)/);
  assert.match(carouselSource, /onTouchStart=/);
  assert.match(carouselSource, /onTouchEnd=/);
});
