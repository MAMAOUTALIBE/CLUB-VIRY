import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerSource = await readFile(new URL("../src/components/Header.tsx", import.meta.url), "utf8");

test("the premium mobile menu keeps the desktop navigation breakpoint isolated", () => {
  assert.match(headerSource, /min-\[1280px\]:hidden/);
  assert.match(headerSource, /min-\[1280px\]:flex/);
  assert.match(headerSource, /id="mobile-menu"/);
});

test("the mobile menu moves the former shortcuts into its four accordion groups", () => {
  for (const label of ["Le Club", "Academy & équipes", "Actu & Médias", "Infos pratiques"]) {
    assert.ok(headerSource.includes(`label: "${label}"`), `missing ${label} accordion`);
  }

  assert.doesNotMatch(headerSource, /aria-label="Accès rapides mobile"/);
  assert.match(headerSource, /label: "Le Club",[\s\S]*?\["Partenaires", "\/le-club\/valeurs-partenaires#partenaires"\]/);
  assert.match(headerSource, /label: "Actu & Médias",[\s\S]*?\["Calendrier", "\/calendrier"\]/);
  assert.match(headerSource, /label: "Infos pratiques",[\s\S]*?\["Inscriptions", "\/inscriptions"\][\s\S]*?\["Boutique", "\/boutique"\]/);
  assert.match(headerSource, /const navItems = \[[\s\S]*?\["Valeurs et partenaires", "\/le-club\/valeurs-partenaires"\][\s\S]*?\];\s+\s*const mobileNavGroups/);
  assert.doesNotMatch(headerSource, /label: "Boutique",\s+href: "\/boutique",\s+links:/);
  assert.doesNotMatch(headerSource, /label: "Nous rejoindre",\s+href: "\/inscriptions",\s+links:/);
});

test("the premium treatment and sticky actions preserve accessibility and safe scrolling", () => {
  assert.match(headerSource, /bg-\[url\('\/stade\/tribune2\.jpg'\)\]/);
  assert.match(headerSource, /backdrop-blur-xl/);
  assert.match(headerSource, /aria-controls=\{controlsId\}/);
  assert.match(headerSource, /aria-expanded=\{expanded\}/);
  assert.match(headerSource, /pb-\[max\(0\.75rem,env\(safe-area-inset-bottom\)\)\]/);
  assert.match(headerSource, /pb-32/);
  assert.ok(headerSource.includes("Mon espace"));
  assert.ok(headerSource.includes("Rejoindre le club"));
  assert.match(headerSource, /event\.key === "Escape"/);
  assert.match(headerSource, /document\.body\.style\.overflow = "hidden"/);
});
