import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = new URL("../src/", import.meta.url);
const appDir = new URL("app/", root);

// Routes qui ne servent qu'a rediriger (permanentRedirect) ou qui sont declarees
// dans next.config.ts : un lien INTERNE ne doit jamais les viser, sinon chaque clic
// paie un aller-retour 308 inutile. Elles restent en place pour les liens entrants.
const REDIRECT_ONLY_ROUTES = new Set([
  "/partenaires",
  "/formation",
  "/formation/ecole-de-foot",
  "/formation/football-a-11",
  "/formation/projet-ecole-de-foot",
  "/formation/stages",
  "/le-club/bureau",
  "/le-club/codes-de-conduite",
  "/le-club/dirigeants",
  "/le-club/encadrement",
  "/le-club/entraineurs",
  "/le-club/installations",
  "/le-club/mot-du-president",
  "/le-club/stade-henri-longuet",
  "/equipes/seniors-r1",
  "/equipes/seniors-d2",
  "/equipes/u18-r1",
  "/equipes/u15-r1",
  "/equipes/u14"
]);

// Fichiers qui ont de bonnes raisons de nommer une route de redirection :
// la page de redirection elle-meme, les metadonnees SEO des anciennes URLs,
// et l'allow-list des liens du CRM (qui autorise volontairement les deux formes).
const ALLOWED_FILES = new Set([
  "lib/seo.ts",
  "lib/home-hero.ts",
  "lib/data.ts"
]);

async function collectFiles(dir, extensions, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) {
      await collectFiles(child, extensions, acc);
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      acc.push(child);
    }
  }
  return acc;
}

function relative(fileUrl) {
  return path.relative(root.pathname, fileUrl.pathname);
}

const sourceFiles = await collectFiles(root, [".ts", ".tsx"]);

test("aucun lien interne ne vise une route de redirection", async () => {
  const offenders = [];

  for (const file of sourceFiles) {
    const name = relative(file);
    if (ALLOWED_FILES.has(name)) continue;

    const source = await readFile(file, "utf8");
    if (source.includes("permanentRedirect(")) continue;

    for (const match of source.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      if (REDIRECT_ONLY_ROUTES.has(match[1])) {
        offenders.push(`${name} → ${match[0]}`);
      }
    }
  }

  assert.deepEqual(offenders, [], `liens internes visant une redirection :\n${offenders.join("\n")}`);
});

test("chaque route de redirection existe encore et cible une destination servie", async () => {
  const pages = await collectFiles(appDir, ["page.tsx"]);
  const redirectTargets = [];

  for (const file of pages) {
    const source = await readFile(file, "utf8");
    const match = source.match(/permanentRedirect\("([^"]+)"\)/);
    if (!match) continue;

    const route = `/${path.relative(appDir.pathname, path.dirname(file.pathname))}`;
    assert.ok(REDIRECT_ONLY_ROUTES.has(route), `${route} redirige mais n'est pas declaree dans le contrat`);
    redirectTargets.push(match[1]);
  }

  // Une redirection ne doit jamais pointer vers une autre redirection (chaine 308 → 308).
  for (const target of redirectTargets) {
    const targetPath = target.split("#")[0];
    assert.ok(!REDIRECT_ONLY_ROUTES.has(targetPath), `redirection en chaine vers ${target}`);
  }

  assert.ok(redirectTargets.length >= 14, "les redirections historiques doivent rester en place");
});

test("aucun lien mort : ni href vide, ni href=\"#\", ni ancre seule", async () => {
  const offenders = [];

  for (const file of sourceFiles) {
    // Les commentaires citent parfois href="" pour expliquer ce qui est evite :
    // on ne scanne que le code.
    const source = (await readFile(file, "utf8"))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");

    for (const match of source.matchAll(/href="(#|)"/g)) {
      offenders.push(`${relative(file)} → href="${match[1]}"`);
    }
  }

  assert.deepEqual(offenders, [], `liens morts :\n${offenders.join("\n")}`);
});
