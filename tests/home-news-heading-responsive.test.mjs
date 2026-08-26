import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

test("mobile and tablet show only the compact actualites link above news cards", () => {
  const newsSection = homeSource.slice(homeSource.indexOf("{gridNews.length > 0 ? ("));

  assert.match(newsSection, /<Link\s+href="\/actualites"[\s\S]*?xl:hidden[\s\S]*?>\s*Actualités <ArrowRight/);
  assert.match(newsSection, /<ArrowRight size=\{18\} aria-hidden="true"/);
});

test("desktop keeps the complete news heading and call to action", () => {
  const newsSection = homeSource.slice(homeSource.indexOf("{gridNews.length > 0 ? ("));

  assert.match(newsSection, /className="mb-8 hidden flex-col gap-4 xl:flex/);
  assert.match(newsSection, /<SectionTitle eyebrow="Actualités" title="Dernières actualités" text="Résultats, stages, détections et temps forts : toute la vie du club\." \/>/);
  assert.match(newsSection, /<ButtonLink href="\/actualites" variant="dark">Voir toutes les actualités<\/ButtonLink>/);
});
