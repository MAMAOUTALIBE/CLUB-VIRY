import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * Le site rend deux mises en page : <MobileScreen> sous 1280 px et <DesktopOnly>
 * au-dessus. Une section cible d'ancre enfermee dans <DesktopOnly> est en
 * display:none sur mobile : le navigateur ne defile nulle part et le visiteur
 * n'atteint jamais le contenu promis.
 *
 * Ce test verrouille l'inverse : toutes les ancres publiques declarees dans
 * PUBLIC_HERO_ANCHORS (src/lib/home-hero.ts) sont rendues a TOUTES les largeurs.
 */

const ANCHORS = {
  "app/academy/page.tsx": ["projet", "entraineurs", "encadrement", "ecole-de-foot", "football-a-11", "stages", "formations"],
  "app/le-club/infrastructures/page.tsx": ["installations", "stade-henri-longuet"],
  "app/le-club/organigramme/page.tsx": ["bureau", "dirigeants"],
  "app/le-club/valeurs-partenaires/page.tsx": ["valeurs", "partenaires", "devenir-partenaire"]
};

/** Intervalles [debut, fin) couverts par un bloc <DesktopOnly>…</DesktopOnly>. */
function desktopOnlyRanges(source) {
  const ranges = [];
  const open = /<DesktopOnly>/g;
  let match;

  while ((match = open.exec(source))) {
    const close = source.indexOf("</DesktopOnly>", match.index);
    assert.notEqual(close, -1, "<DesktopOnly> non ferme");
    ranges.push([match.index, close]);
    open.lastIndex = close;
  }

  return ranges;
}

for (const [file, ids] of Object.entries(ANCHORS)) {
  const source = await readFile(new URL(`../src/${file}`, import.meta.url), "utf8");
  const ranges = desktopOnlyRanges(source);

  test(`${file} : les ancres sont rendues a toutes les largeurs`, () => {
    for (const id of ids) {
      // L'id peut etre litteral (id="valeurs") ou calcule
      // (id={title === "Bureau exécutif" ? "bureau" : "dirigeants"}).
      const found = source.match(new RegExp(`id=(?:"${id}"|\\{[^}]*"${id}"[^}]*\\})`));
      assert.notEqual(found, null, `ancre #${id} absente de ${file}`);
      const at = found.index;

      const hidden = ranges.find(([start, end]) => at > start && at < end);
      assert.equal(hidden, undefined, `l'ancre #${id} est enfermee dans <DesktopOnly> : invisible sous 1280 px`);
    }
  });
}

test("les ancres du menu mobile pointent vers des sections partagees", async () => {
  const header = await readFile(new URL("../src/components/Header.tsx", import.meta.url), "utf8");
  const declared = new Set(Object.values(ANCHORS).flat());

  for (const match of header.matchAll(/href="\/[^"#]*#([a-z0-9-]+)"/g)) {
    assert.ok(declared.has(match[1]), `l'en-tete pointe vers #${match[1]}, absente du contrat d'ancres`);
  }
});

test("le pied de page ne pointe que vers des ancres existantes", async () => {
  const footer = await readFile(new URL("../src/components/Footer.tsx", import.meta.url), "utf8");
  const declared = new Set(Object.values(ANCHORS).flat());

  for (const match of footer.matchAll(/"\/[^"#]*#([a-z0-9-]+)"/g)) {
    assert.ok(declared.has(match[1]), `le pied de page pointe vers #${match[1]}, absente du contrat d'ancres`);
  }
});
