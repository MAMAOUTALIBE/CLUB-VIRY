import { expect, test, type Page } from "@playwright/test";

/**
 * Audit de navigation : on clique reellement sur chaque element, puis on verifie
 * l'URL obtenue, le titre affiche et le contenu reellement visible a la largeur
 * du projet en cours (mobile / tablette / ordinateur).
 */

const PUBLIC_PAGES: Array<{ route: string; title: RegExp; heading: RegExp }> = [
  { route: "/", title: /ES Viry-Châtillon Football/, heading: /./ },
  { route: "/le-club", title: /Le Club/, heading: /maison|histoire/i },
  { route: "/le-club/histoire", title: /Histoire/, heading: /histoire/i },
  { route: "/le-club/galerie", title: /Galerie/, heading: /archives|galerie/i },
  { route: "/le-club/organigramme", title: /Organisation/, heading: /organisation/i },
  { route: "/le-club/infrastructures", title: /Infrastructures/, heading: /infrastructures/i },
  { route: "/le-club/valeurs-partenaires", title: /Valeurs et partenaires/, heading: /valeurs et partenaires/i },
  { route: "/academy", title: /Academy/, heading: /academy|sport/i },
  { route: "/equipes", title: /quipes/, heading: /quipes|cat[ée]gories/i },
  { route: "/actualites", title: /Actualit/, heading: /actualit|vie du club/i },
  // Le <h1> public annonce la semaine de planning (et non le mot « calendrier »)
  // depuis la separation des vues CRM / publique.
  { route: "/calendrier", title: /Calendrier/, heading: /semaine|calendrier/i },
  { route: "/resultats", title: /sultats/, heading: /sultats/i },
  { route: "/medias", title: /dias/, heading: /galerie|dias/i },
  { route: "/boutique", title: /Boutique/, heading: /boutique|produits/i },
  { route: "/boutique/conditions-generales", title: /Conditions/, heading: /conditions/i },
  { route: "/boutique/livraison-retour", title: /Livraison/, heading: /livraison/i },
  { route: "/inscriptions", title: /Inscriptions/, heading: /saison|inscriptions/i },
  { route: "/detections-recrutement", title: /tections/, heading: /recrutement|tections/i },
  { route: "/contact", title: /Contact/, heading: /contact|crire/i },
  { route: "/plan-du-site", title: /Plan du site/, heading: /plan du site/i },
  { route: "/mentions-legales", title: /Mentions/, heading: /mentions/i },
  { route: "/politique-confidentialite", title: /confidentialit/, heading: /confidentialit/i },
  { route: "/espace-membre", title: /Espace famille/, heading: /espace famille/i }
];

/** Redirections historiques : URL demandee → ancre qui doit etre visible a l'arrivee. */
const ANCHOR_REDIRECTS: Array<{ from: string; to: string; anchor: string }> = [
  { from: "/partenaires", to: "/le-club/valeurs-partenaires", anchor: "partenaires" },
  { from: "/le-club/codes-de-conduite", to: "/le-club/valeurs-partenaires", anchor: "valeurs" },
  { from: "/le-club/installations", to: "/le-club/infrastructures", anchor: "installations" },
  { from: "/le-club/stade-henri-longuet", to: "/le-club/infrastructures", anchor: "stade-henri-longuet" },
  { from: "/le-club/bureau", to: "/le-club/organigramme", anchor: "bureau" },
  { from: "/le-club/dirigeants", to: "/le-club/organigramme", anchor: "dirigeants" },
  { from: "/le-club/entraineurs", to: "/academy", anchor: "entraineurs" },
  { from: "/le-club/encadrement", to: "/academy", anchor: "encadrement" },
  { from: "/formation", to: "/academy", anchor: "projet" },
  { from: "/formation/ecole-de-foot", to: "/academy", anchor: "ecole-de-foot" },
  { from: "/formation/football-a-11", to: "/academy", anchor: "football-a-11" },
  { from: "/formation/stages", to: "/academy", anchor: "stages" }
];

async function isMobileLayout(page: Page): Promise<boolean> {
  return (page.viewportSize()?.width ?? 1440) < 1280;
}

test.describe("Pages publiques", () => {
  for (const { route, title, heading } of PUBLIC_PAGES) {
    test(`${route} : repond, s'intitule et affiche un titre unique`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} doit repondre 200`).toBe(200);
      await expect(page).toHaveTitle(title);

      // Un seul <h1> reellement visible a cette largeur.
      const visibleHeadings = page.locator("h1:visible");
      await expect(visibleHeadings).toHaveCount(1);
      await expect(visibleHeadings.first()).toHaveText(heading);
    });
  }
});

test.describe("Indexation", () => {
  test("les semaines datees du calendrier ne sont pas indexables", async ({ page }) => {
    await page.goto("/calendrier");
    // La vue « cette semaine » reste la page de reference indexee.
    await expect(page.locator('head meta[name="robots"][content*="noindex"]')).toHaveCount(0);

    // Les fleches precedent/suivant ouvrent une infinite de semaines : elles restent
    // navigables mais ne doivent pas entrer dans l'index.
    await page.goto("/calendrier?week=2026-01-05");
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", /\/calendrier$/);
  });
});

test.describe("Redirections et ancres", () => {
  for (const { from, to, anchor } of ANCHOR_REDIRECTS) {
    test(`${from} aboutit sur ${to}#${anchor} et la section est visible`, async ({ page }) => {
      const response = await page.goto(from);
      expect(response?.status()).toBe(200);
      expect(page.url()).toContain(`${to}#${anchor}`);

      // Le coeur de l'audit : la cible doit etre REELLEMENT visible, pas seulement
      // presente dans le HTML (elle etait en display:none sous 1280 px).
      await expect(page.locator(`#${anchor}`)).toBeVisible();
    });
  }

  test("aucune redirection en boucle sur les anciens slugs d'equipe", async ({ page }) => {
    for (const [from, to] of [
      ["/equipes/seniors-r1", "/equipes/seniors-a"],
      ["/equipes/seniors-d2", "/equipes/seniors-b"],
      ["/equipes/u18-r1", "/equipes/u18-a"],
      ["/equipes/u15-r1", "/equipes/u16-a"],
      ["/equipes/u14", "/equipes/u14-a"]
    ]) {
      const response = await page.goto(from);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(to);
    }
  });
});

test.describe("Navigation principale", () => {
  test("le menu mene aux bonnes pages", async ({ page }) => {
    // Ce parcours enchaine plusieurs chargements de page complets (un par lien
    // clique, avec reouverture du menu) : il depasse legitimement le delai standard.
    test.slow();
    await page.goto("/");

    if (await isMobileLayout(page)) {
      const menu = page.locator("#mobile-menu");

      // « Partenaires » vit dans le groupe « Le Club », deplie par defaut :
      // il doit atterrir sur une section reellement visible a cette largeur.
      await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await expect(menu).toBeVisible();
      await menu.getByRole("link", { name: "Partenaires", exact: true }).click();
      await expect(page).toHaveURL(/\/le-club\/valeurs-partenaires#partenaires$/);
      await expect(page.locator("#partenaires")).toBeVisible();

      // « Inscriptions » et « Boutique » sont dans le groupe « Infos pratiques »,
      // qu'il faut deplier : on verifie que le parcours complet aboutit.
      for (const [label, expected] of [
        ["Inscriptions", "/inscriptions"],
        ["Boutique", "/boutique"]
      ] as const) {
        await page.goto("/");
        await page.getByRole("button", { name: "Ouvrir le menu" }).click();
        await expect(menu).toBeVisible();
        await menu.getByRole("button", { name: "Infos pratiques" }).click();
        const link = menu.getByRole("link", { name: label, exact: true });
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${expected}$`));
      }
      return;
    }

    // Ordinateur : chaque sous-menu s'ouvre et ses liens menent a la bonne page.
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await nav.getByRole("button", { name: "Le Club" }).click();
    await nav.getByRole("link", { name: "Histoire" }).click();
    await expect(page).toHaveURL(/\/le-club\/histoire$/);

    await page.goto("/");
    await nav.getByRole("button", { name: "Actu & Médias" }).click();
    await nav.getByRole("link", { name: "Résultats" }).click();
    await expect(page).toHaveURL(/\/resultats$/);

    await page.goto("/");
    await nav.getByRole("link", { name: "Rejoindre", exact: true }).click();
    await expect(page).toHaveURL(/\/inscriptions$/);
  });

  test("le menu mobile s'ouvre, se deplie et se ferme", async ({ page }) => {
    test.skip(!(await isMobileLayout(page)), "menu mobile uniquement");
    await page.goto("/");

    const openButton = page.getByRole("button", { name: "Ouvrir le menu" });
    await openButton.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();

    // Accordeon : « Actu & Médias » se deplie et expose ses liens.
    const accordion = menu.getByRole("button", { name: "Actu & Médias" });
    await accordion.click();
    await expect(accordion).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("link", { name: "Médias", exact: true })).toBeVisible();

    // Il se replie.
    await accordion.click();
    await expect(accordion).toHaveAttribute("aria-expanded", "false");

    // Bouton fermer.
    await menu.getByRole("button", { name: "Fermer le menu" }).click();
    await expect(menu).toBeHidden();

    // Echap ferme aussi.
    await openButton.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("le bandeau d'inscriptions mene au formulaire", async ({ page }) => {
    test.skip(await isMobileLayout(page), "bandeau affiche sur ordinateur");
    await page.goto("/");
    await page.getByRole("link", { name: /Inscriptions des licenciés/ }).click();
    await expect(page).toHaveURL(/\/inscriptions$/);
  });
});

test.describe("Appels a l'action", () => {
  test("« Nous rejoindre » mene au formulaire partenaire visible", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Nous rejoindre", exact: true }).click();
    await expect(page).toHaveURL(/\/le-club\/valeurs-partenaires#devenir-partenaire$/);
    await expect(page.locator("#devenir-partenaire")).toBeVisible();
    const form = page.locator("#devenir-partenaire");
    await expect(form.getByRole("heading", { name: "Devenir partenaire" })).toBeVisible();
    await expect(form.getByRole("button", { name: "Envoyer ma demande" })).toBeVisible();
  });

  test("les partenaires institutionnels ouvrent leur site", async ({ page }) => {
    await page.goto("/");
    const essonne = page.getByRole("link", { name: /Essonne/ }).first();
    await expect(essonne).toHaveAttribute("href", /^https:\/\//);
    await expect(essonne).toHaveAttribute("target", "_blank");
  });

  test("les onglets du hub sportif changent de panneau", async ({ page }) => {
    // Le hub à onglets n'existe que sur ordinateur : sous 1280 px, l'accueil affiche
    // le programme du jour et le bloc direct à la place.
    test.skip(await isMobileLayout(page), "hub sportif : ordinateur uniquement");
    await page.goto("/");
    const tablist = page.getByRole("tablist", { name: "Choisir le calendrier" });
    await expect(tablist.getByRole("tab", { name: "Entraînements" })).toHaveAttribute("aria-selected", "true");

    await tablist.getByRole("tab", { name: "Matchs à venir" }).click();
    await expect(tablist.getByRole("tab", { name: "Matchs à venir" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("link", { name: /Voir tous les matchs/ })).toBeVisible();

    await tablist.getByRole("tab", { name: "Résultats" }).click();
    await expect(page.getByRole("link", { name: /Voir tous les résultats/ })).toBeVisible();
  });

  test("l'accueil mobile affiche le programme du jour et mène au planning", async ({ page }) => {
    test.skip(!(await isMobileLayout(page)), "accueil mobile uniquement");
    await page.goto("/");

    const program = page.getByRole("region", { name: "Programme du jour" });
    await expect(program).toBeVisible();

    const programItems = program.locator("article");
    const itemCount = await programItems.count();
    expect(itemCount).toBeLessThanOrEqual(3);

    const totalLabel = program.getByText(/\d+ événements?/i);
    if (await totalLabel.count()) {
      const total = Number.parseInt((await totalLabel.textContent()) ?? "0", 10);
      expect(itemCount).toBe(Math.min(total, 3));
    }

    await program.getByRole("link", { name: /Voir tout le planning/ }).click();
    await expect(page).toHaveURL(/\/calendrier$/);
  });

  test("la carte match ou photos est visible uniquement sur mobile", async ({ page }, testInfo) => {
    await page.goto("/");
    const section = page.locator('section[aria-label="Match en direct, replay, entraînement ou photos"]');
    if (testInfo.project.name !== "mobile") {
      await expect(section).toBeHidden();
      return;
    }

    await expect(section).toBeVisible();
    const selectedHeading = section.getByRole("heading", { name: /Match en direct|Replay du dernier match|Dans les coulisses de l’entraînement|Dernières images des matchs/ });
    await expect(selectedHeading).toHaveCount(1);
    const galleryLink = section.getByRole("link", { name: "Voir toutes les photos" });
    const heading = await selectedHeading.textContent();
    if (heading === "Dernières images des matchs") {
      await expect(galleryLink).toBeVisible();
      await galleryLink.click();
      await expect(page).toHaveURL(/\/medias$/);
    } else {
      await expect(galleryLink).toHaveCount(0);
      if (heading === "Match en direct") {
        await expect(section.getByRole("link", { name: /Voir le match en direct/ })).toBeVisible();
      }
    }
  });

  test("le calendrier et les résultats mènent à la fiche du match", async ({ page }) => {
    // La fiche n'existe que si le CRM contient de vrais matchs : sans données
    // exploitables, la carte reste volontairement non cliquable.
    for (const route of ["/calendrier", "/resultats"]) {
      await page.goto(route);
      const link = page.locator('a[href^="/matchs/"]:visible').first();
      if (!(await link.count())) continue;
      await link.click();
      await expect(page).toHaveURL(/\/matchs\/[0-9a-f-]{36}$/);
      await expect(page.locator("h1:visible")).toHaveCount(1);
      // Une seule région principale : le layout en fournit déjà une.
      await expect(page.locator("main")).toHaveCount(1);
    }
  });

  test("les actualites sont accessibles a toutes les largeurs", async ({ page }) => {
    await page.goto("/");
    const firstArticle = page.locator('a[href^="/actualites/"]').first();
    await expect(firstArticle).toBeVisible();
    await firstArticle.click();
    await expect(page).toHaveURL(/\/actualites\/[a-z0-9-]+$/);
    await expect(page.locator("h1:visible")).toHaveCount(1);

    // Retour navigateur.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Galerie et boutique", () => {
  test("la visionneuse s'ouvre, navigue et se ferme", async ({ page }) => {
    await page.goto("/medias");
    await page.getByRole("button", { name: /^Agrandir :/ }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Image suivante" }).click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("le panier accepte un article puis se ferme", async ({ page }) => {
    await page.goto("/boutique");
    const addButton = page.getByRole("button", { name: /^Ajouter .* au panier$/ }).first();

    // L'environnement E2E n'invente aucun produit si Supabase n'est pas configuré.
    // Dans ce cas, on vérifie l'état vide ; le parcours panier est testé dès qu'un
    // catalogue CRM est disponible (notamment lors du smoke test de production).
    if ((await addButton.count()) === 0) {
      await expect(page.locator("p:visible", { hasText: "Aucun produit n’est actuellement en vente." })).toBeVisible();
      return;
    }

    await addButton.click();

    await page.getByRole("button", { name: /^Ouvrir le panier/ }).click();
    const cart = page.getByRole("dialog", { name: "Panier" });
    await expect(cart).toBeVisible();
    await expect(cart.getByRole("button", { name: "Augmenter la quantité" })).toBeVisible();

    await cart.getByRole("button", { name: "Fermer le panier" }).click();
    await expect(cart).toBeHidden();
  });
});

test.describe("Formulaires et acces proteges", () => {
  test("le formulaire de contact refuse un envoi vide", async ({ page }) => {
    await page.goto("/contact");
    const submit = page.getByRole("button", { name: "Envoyer", exact: true }).first();
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    // La validation cote client bloque l'envoi : on reste sur la page.
    await expect(page).toHaveURL(/\/contact$/);
    await expect(submit).toBeVisible();
  });

  test("le CRM redirige vers la connexion sans session", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain("/connexion?next=%2Fadmin");
    await expect(page.getByRole("heading", { name: /Acc[èe]s CRM Club/ })).toBeVisible();

    await page.getByRole("link", { name: "Retour au site" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("l'espace membre demande une connexion", async ({ page }) => {
    await page.goto("/espace-membre");
    await expect(page.getByRole("button", { name: /Se connecter/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Demander une inscription" })).toHaveAttribute("href", "/inscriptions");
  });
});

test.describe("Pages introuvables", () => {
  test("une URL inexistante rend la page 404 avec un retour a l'accueil", async ({ page }) => {
    const response = await page.goto("/page-qui-nexiste-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Page introuvable/ })).toBeVisible();

    await page.getByRole("link", { name: /Retour à l'accueil/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
