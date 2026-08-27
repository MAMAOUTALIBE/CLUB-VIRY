import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const appDir = new URL("../src/app/", import.meta.url);

/**
 * Garde-fou de fraicheur du contenu public.
 *
 * L'image Docker est construite HORS du reseau Supabase (le service role n'est pas
 * un argument de build, et `kong` n'est joignable qu'au runtime). Toute page publique
 * qui lit la base et ne declare NI `revalidate` NI `dynamic = "force-dynamic"` est donc
 * figee au build sur les seules donnees de repli (mock), et servie telle quelle pendant
 * un an (`s-maxage=31536000`). C'est ce qui etait arrive au plan de site, a /academy et
 * aux articles prerendus : ils annoncaient des equipes et un encadrement fictifs alors
 * que le CRM etait rempli.
 */
const DB_IMPORTS = ['@/lib/public-content', '@/lib/db/'];

async function collect(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) {
      // Le CRM est entierement rendu a la demande derriere une session : hors sujet ici.
      if (entry.name === "admin") continue;
      await collect(child, acc);
    } else if (entry.name === "page.tsx" || entry.name === "sitemap.ts") {
      acc.push(child);
    }
  }
  return acc;
}

const files = await collect(appDir);

test("toute page publique alimentee par la base declare une politique de fraicheur", async () => {
  const stale = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");

    if (!DB_IMPORTS.some((needle) => source.includes(needle))) {
      continue;
    }

    const hasRevalidate = /^export const revalidate\s*=\s*\d+/m.test(source);
    const isDynamic = /^export const dynamic\s*=\s*"force-dynamic"/m.test(source);

    if (!hasRevalidate && !isDynamic) {
      stale.push(path.relative(appDir.pathname, file.pathname));
    }
  }

  assert.deepEqual(
    stale,
    [],
    `Ces routes lisent la base mais seraient figees sur les donnees de repli du build : ${stale.join(", ")}`
  );
});

test("le plan de site se regenere au runtime", async () => {
  const source = await readFile(new URL("sitemap.ts", appDir), "utf8");

  // sitemap.ts est un Route Handler, pas une page : il est mis en cache par defaut et
  // seule une config dynamique le rend a la demande. Un `revalidate` seul laissait la
  // reponse en HIT permanent, donc fige sur le rendu de build (sans base, donc mocke).
  assert.match(
    source,
    /^export const dynamic\s*=\s*"force-dynamic"/m,
    "sitemap.ts doit etre force-dynamic : un revalidate seul ne sort pas le Route Handler du cache"
  );
});

test("le plan de site couvre les fiches personnes publiees (dirigeants ET educateurs)", async () => {
  const source = await readFile(new URL("sitemap.ts", appDir), "utf8");

  assert.ok(source.includes("/le-club/organigramme/"), "les fiches dirigeants doivent figurer au plan de site");
  assert.ok(source.includes("/le-club/encadrement/"), "les fiches educateurs doivent figurer au plan de site");
});
