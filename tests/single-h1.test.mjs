import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

/**
 * Les pages publiques servent deux mises en page dans le meme document :
 * <MobileScreen> (xl:hidden) et <DesktopOnly> (hidden xl:block). Chacune porte son
 * propre <h1>, mais les deux ne sont JAMAIS rendues ensemble : a chaque largeur,
 * un seul <h1> est affiche.
 *
 * Ce test verrouille cette isolation par point de rupture. Si l'un des deux
 * conteneurs perdait sa classe de visibilite, la page afficherait deux titres de
 * niveau 1 en meme temps — ou, pire, aucun.
 *
 * La verification du rendu reel (« exactement un <h1> visible ») est faite aux trois
 * largeurs par tests/e2e/navigation.spec.ts.
 */

const srcDir = new URL("../src/", import.meta.url);

async function collect(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) await collect(child, acc);
    else if (entry.name.endsWith(".tsx")) acc.push(child);
  }
  return acc;
}

const files = await collect(srcDir);

test("les deux mises en page restent mutuellement exclusives", async () => {
  const source = await readFile(new URL("components/MobilePage.tsx", srcDir), "utf8");

  // MobileScreen : visible seulement SOUS 1280 px.
  assert.match(source, /<section className="[^"]*\bxl:hidden\b/);
  // DesktopOnly : visible seulement AU-DESSUS de 1280 px.
  assert.match(source, /<div className="hidden xl:block">\{children\}<\/div>/);
  // Un seul <h1> dans MobileScreen.
  assert.equal((source.match(/<h1[\s>]/g) ?? []).length, 1);
});

test("PageHero porte un <h1> et un seul", async () => {
  const source = await readFile(new URL("components/PageHero.tsx", srcDir), "utf8");
  assert.equal((source.match(/<h1[\s>]/g) ?? []).length, 1);
});

test("aucune page ne place deux <h1> dans la meme mise en page", async () => {
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (!source.includes("<MobileScreen")) continue;

    const name = path.relative(srcDir.pathname, file.pathname);
    const heroCount = (source.match(/<PageHero[\s>]/g) ?? []).length;
    const ownHeadingCount = (source.match(/<h1[\s>]/g) ?? []).length;

    // Une page combine au plus un hero desktop : PageHero OU un <h1> maison,
    // jamais les deux, sinon la version desktop afficherait deux titres.
    if (heroCount > 0 && ownHeadingCount > 0) {
      offenders.push(`${name} : PageHero + <h1> maison`);
    }
    if (heroCount > 1) {
      offenders.push(`${name} : ${heroCount} PageHero`);
    }
    if (ownHeadingCount > 1) {
      offenders.push(`${name} : ${ownHeadingCount} <h1> maison`);
    }
    if (heroCount === 0 && ownHeadingCount === 0) {
      offenders.push(`${name} : aucun titre desktop`);
    }
  }

  assert.deepEqual(offenders, [], `titres de niveau 1 incorrects :\n${offenders.join("\n")}`);
});
