import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const globalStyles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("home partners section renders only the two institutional partners", () => {
  assert.match(homeSource, /const institutionalPartnerNames = \["Essonne Département", "Ville de Viry-Châtillon"\] as const/);
  assert.match(homeSource, /getInstitutionalPartners\(featuredPartners\)/);
  assert.match(homeSource, /institutionalPartners\.map/);
  assert.match(homeSource, /institutional-partners-marquee/);
  assert.match(homeSource, /\[false, true\]\.map/);
});

test("home partners section starts with its compact partnership banner", () => {
  const sectionStart = homeSource.indexOf('aria-label="Partenaires institutionnels"');
  const banner = homeSource.indexOf("Devenez partenaire du club", sectionStart);
  const cards = homeSource.indexOf("institutionalPartners.map", sectionStart);

  assert.ok(sectionStart >= 0);
  assert.ok(banner > sectionStart);
  assert.ok(cards > banner);
  assert.match(homeSource.slice(sectionStart, cards), /Nous rejoindre/);
  assert.doesNotMatch(homeSource.slice(sectionStart, cards), /<SectionTitle/);
});

test("institutional partner links and logo fallbacks remain wired", () => {
  assert.match(homeSource, /interactive && partner\.websiteUrl \?/);
  assert.match(homeSource, /href=\{partner\.websiteUrl\}/);
  assert.match(homeSource, /partner\.logoUrl \?\? getPartnerLogo\(partner\.name\)/);
});

test("institutional partners animate below desktop and remain a fixed desktop grid", () => {
  assert.match(homeSource, /institutional-partners-marquee mt-4 overflow-hidden sm:mt-5 lg:hidden/);
  assert.match(homeSource, /mt-5 hidden grid-cols-2 gap-5 lg:grid/);
  assert.match(homeSource, /interactive=\{!isDuplicate\}/);
  assert.match(homeSource, /aria-hidden=\{isDuplicate \|\| undefined\}/);
  assert.match(globalStyles, /\.institutional-partners-marquee__track \{[\s\S]*?animation: institutional-partners-scroll 12s linear infinite/);
  assert.match(globalStyles, /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.institutional-partners-marquee:hover[\s\S]*?\.institutional-partners-marquee:focus-within/);
  assert.match(globalStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.institutional-partners-marquee__track[\s\S]*?animation: none/);
});
