# Audit premium — Site ES Viry-Châtillon Football

> **Périmètre** : Next.js 16 (App Router, TypeScript strict, TailwindCSS v4), mode « vitrine » (formulaires publics en capture de leads JSONL + webhook ; admin/CRM et auth nécessitent Supabase, non configuré → 503/401 ; pages publiques en données mockées `src/lib/data.ts`).
> **Méthode** : consolidation de 9 audits d'experts (Architecture, QA, UX, UI, Football/identité, A11y, Performance, SEO, Sécurité) et de 10 audits de pages, dédoublonnés et hiérarchisés.
> **Date** : 2026-06-08.

---

## 1. Résumé exécutif

### Note globale : **5,4 / 10**

**Verdict** : *Un template premium crédible au premier coup d'œil, mais inachevé en profondeur.*

Le site a une vraie coquille professionnelle : direction artistique cohérente (jaune/vert, surfaces sombres en dégradé, micro-animations soignées), architecture de code propre en couches (api/auth/db avec validation serveur stricte), navigation claire et **trois tunnels de conversion qui fonctionnent réellement** (inscription, contact, détection → 201 + référence vérifiés en live). C'est la fondation d'un bon produit.

Mais l'exécution révèle un écart béant entre l'ambition affichée et la réalité livrée, sur **quatre axes critiques** :

1. **Sécurité & vie privée** — `/admin` est servi en HTTP 200 à tout visiteur anonyme (aucun middleware), les en-têtes de sécurité HTTP sont totalement absents (pas de CSP/HSTS/X-Frame-Options), le rate-limiting est contournable (X-Forwarded-For falsifiable, prouvé en live), et des **données personnelles de mineurs** sont stockées en clair dans des fichiers world-readable.
2. **Authenticité football** — 100 % de photos Unsplash génériques (jamais le Stade Henri Longuet ni les vraies équipes), un **classement inventé** (`51 - index*4`) identique pour toutes les équipes y compris Féminines/Futsal, un mot du président anonyme, des données figées à mai 2025 (donc périmées au 8 juin 2026), et des textes de consignes de conception laissés visibles en prod (« Un vrai site officiel doit… »).
3. **Promesses de clic non tenues** — bouton « Ajouter au panier » totalement inerte, « Lire l'article » sans page article, « Billetterie » qui mène au calendrier, loupe « Recherche » qui mène au plan du site, filtres décoratifs partout, réseaux sociaux non cliquables.
4. **Accessibilité & performance** — contraste WCAG en échec systémique (jaune sur blanc à 1,6:1, ~81 occurrences), menus inaccessibles au clavier, aucune image via `next/image` (LCP non optimisé, hero CSS de 690 Ko non préchargé).

**Conclusion** : la mise en ligne en l'état exposerait des données de mineurs et afficherait du contenu factuellement faux sur un site « officiel ». Une phase de correction P0 (sécurité + authenticité + actions inertes) est un prérequis absolu avant toute communication publique.

### Notes moyennes par axe (audits experts)

| Axe | Note /10 |
|---|---|
| Architecture & dette technique | 6,5 |
| QA / Tests fonctionnels | 6,5 |
| UX (parcours & conversion) | 6,5 |
| UI (design visuel) | 6,5 |
| Football Experience & identité | 4,5 |
| Accessibilité (a11y) | 5,5 |
| Performance & Core Web Vitals | 4,5 |
| SEO & référencement local | 4,5 |
| Sécurité | 5,5 |
| **Moyenne** | **5,5** |

---

## 2. Tableau de notation par page

| Page | Route | UX | UI | Perf | A11y | Football | Conversion | **Moyenne** |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Accueil | `/` | 6 | 8 | 6 | 5 | 6 | 6 | **6,2** |
| Le Club (hub) | `/le-club` | 7 | 7 | 5 | 6 | 6 | 7 | **6,3** |
| Histoire | `/le-club/histoire` | 7 | 7 | 6 | 7 | 5 | 7 | **6,5** |
| Mot du Président | `/le-club/mot-du-president` | 6 | 7 | 6 | 7 | 4 | 6 | **6,0** |
| Organigramme | `/le-club/organigramme` | 6 | 7 | 6 | 7 | 4 | 6 | **6,0** |
| Stade Henri Longuet | `/le-club/stade-henri-longuet` | 5 | 6 | 6 | 6 | 5 | 5 | **5,5** |
| Liste des équipes | `/equipes` | 6 | 7 | 6 | 4 | 5 | 6 | **5,7** |
| Détail équipe | `/equipes/[slug]` | 5 | 6 | 6 | 6 | 3 | 5 | **5,2** |
| Actualités | `/actualites` | 4 | 7 | 5 | 4 | 5 | 3 | **4,7** |
| Calendrier | `/calendrier` | 5 | 7 | 5 | 4 | 6 | 6 | **5,5** |
| Inscriptions | `/inscriptions` | 6 | 7 | 9 | 5 | 7 | 5 | **6,5** |
| Détections / Recrutement | `/detections-recrutement` | 6 | 7 | 9 | 5 | 8 | 5 | **6,7** |
| Partenaires | `/partenaires` | 6 | 6 | 7 | 6 | 5 | 4 | **5,7** |
| Médias / Galerie | `/medias` | 5 | 6 | 5 | 4 | 5 | 4 | **4,8** |
| Boutique | `/boutique` | 3 | 6 | 7 | 4 | 5 | 2 | **4,5** |
| CGV | `/boutique/conditions-generales` | 3 | 5 | 8 | 6 | 3 | 2 | **4,5** |
| Livraison & retour | `/boutique/livraison-retour` | 3 | 5 | 8 | 6 | 3 | 2 | **4,5** |
| Contact | `/contact` | 7 | 8 | 9 | 6 | 6 | 6 | **7,0** |
| Header (global) | `Header.tsx` | 7 | 8 | 7 | 5 | 8 | 7 | **7,0** |
| Footer (global) | `Footer.tsx` | 7 | 7 | 8 | 6 | 7 | 6 | **6,8** |
| Dashboard CRM | `/admin` | 5 | 7 | 6 | 7 | 6 | 4 | **5,8** |
| Connexion / Contrôle d'accès | `/admin` (composants) | 4 | 6 | 7 | 7 | 5 | 4 | **5,5** |
| Explorateur Fiches 360 | `/admin/familles\|joueurs\|inscriptions` | 6 | 7 | 7 | 7 | 6 | 5 | **6,3** |
| Fiche 360 Détail | `/admin/.../[id]` | 5 | 7 | 7 | 6 | 6 | 5 | **6,0** |
| Sidebar CRM | `/admin` (nav) | 6 | 7 | 8 | 7 | 6 | 5 | **6,5** |

**Pages les plus faibles** : Boutique (4,5), CGV/Livraison (4,5), Médias (4,8), Actualités (4,7), Détail équipe (5,2).
**Pages les plus solides** : Contact (7,0), Header (7,0), Footer (6,8), Détections (6,7).

---

## 3. Bugs par gravité

### 🔴 Critiques (bloquants pour une mise en ligne)

| # | Bug | Localisation |
|---|---|---|
| C1 | **`/admin` totalement non protégé** : aucun `src/middleware.ts`, GET `/admin` → 200 anonyme (vérifié en live). Tout le shell CRM (modules, dashboards, agenda) est public. | absence `src/middleware.ts` ; `src/app/admin/**` |
| C2 | **Token Supabase (JWT) stocké en `sessionStorage`** : exfiltrable par tout XSS, aggravé par l'absence de CSP. Le refresh token transite aussi par le client. | `AdminAccessControl.tsx:115` ; `AdminDashboardLive.tsx:341` ; `api/auth/login/route.ts:47-53` |
| C3 | **Données personnelles de mineurs en clair, world-readable** : `captureLead` écrit nom/email/tél/date de naissance + IP/UA en clair dans `var/leads/*.jsonl` (`-rw-r--r--`), sans chiffrement ni rétention. Enjeu RGPD majeur. | `src/lib/leads.ts:51-56` |
| C4 | **Classement sportif inventé et identique partout** : `[ES Viry, FC Massy, US Torcy, Evry FC, Sénart Moissy]` avec points `51 - index*4`, même pour Féminines/Futsal/jeunes. Faux contenu sur un site « officiel ». | `src/app/equipes/[slug]/page.tsx:73-82` |
| C5 | **Boutique 100 % décorative** : bouton « Ajouter au panier » sans `onClick`, aucun panier, aucune page commande. `/api/orders` existe mais jamais appelé et renvoie 503. | `src/app/boutique/page.tsx:36-38` ; `api/orders/route.ts` |
| C6 | **Aucune actualité cliquable** : « Lire l'article » est un `<p>` mort, aucune route `/actualites/[slug]`. Fonction principale de la page cassée. | `src/app/actualites/page.tsx:36` |
| C7 | **Grille calendrier calendairement fausse** : jours 1→31 sans offset du 1er du mois (décalage de 3 colonnes), `31` codé en dur (dates inexistantes pour les mois courts). | `src/app/calendrier/page.tsx:17` |
| C8 | **Placeholder visible en prod** : « Carte interactive à connecter » sur la page Stade, élément le plus attendu (s'y rendre). | `src/app/le-club/stade-henri-longuet/page.tsx:34-37` |

### 🟠 Élevés

| # | Bug | Localisation |
|---|---|---|
| E1 | **Rate-limiting contournable** : IP dérivée de `X-Forwarded-For` falsifiable, sans proxy de confiance. 7 POST avec IP variable → tous 201 (prouvé live). Neutralise anti-spam et anti-brute-force `/api/auth/login`. | `src/lib/api/rate-limit.ts:17-20` |
| E2 | **Aucun en-tête de sécurité HTTP** : pas de CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ; `X-Powered-By: Next.js` exposé (vérifié live). | `next.config.ts:3-13` |
| E3 | **Aucune donnée structurée JSON-LD** : pas de `SportsClub`/`LocalBusiness`/`SportsTeam`/`SportsEvent` → pas de Knowledge Panel ni rich results. | `src/app/layout.tsx` |
| E4 | **Aucune image OG/Twitter + `metadataBase` absent** : partages sans visuel, `og:url` = `localhost:3000`. | `src/app/layout.tsx:24-31` ; `.env.example:1` |
| E5 | **Aucune image via `next/image`** : 10+ visuels en `<img>` natif ou background CSS, JPEG Unsplash bruts (246–321 Ko chacun), pas d'AVIF/WebP ni srcset. `remotePatterns` configuré mais inutilisé. | `next.config.ts:5-12` ; `src/lib/images.ts` |
| E6 | **Hero (LCP) = background CSS 690 Ko non préchargé** ; à l'inverse 4 images sous-le-pli sont préchargées → priorités inversées (vérifié dans le HTML). | `src/app/page.tsx:27-30` ; `src/lib/images.ts:2-3` |
| E7 | **Menus déroulants header inaccessibles au clavier** (`group-hover` only, pas de `aria-expanded`/`focus-within`). | `src/components/Header.tsx:218-241` |
| E8 | **Aucun lien d'évitement (skip link)** ; `<main>` sans `id` cible. | `src/app/layout.tsx:34-43` |
| E9 | **Incohérence form/API recrutement** : « Poste » et « Club actuel » marqués obligatoires côté form mais optionnels côté serveur (POST sans eux → 201). Règle métier non appliquée. | `Forms.tsx:213-214` vs `validation.ts:730-794` |
| E10 | **Messages d'erreur internes (Supabase) renvoyés au client** (106 occurrences) : fingerprinting, énumération de comptes possible sur login. | `api/auth/login/route.ts:37` ; `auth/session.ts:44,57` |
| E11 | **Réseaux sociaux non fonctionnels** : 5 icônes header en `<span role=img>` sans `href`, footer en texte brut `f/ig/yt/tk`. | `Header.tsx:160-179` ; `Footer.tsx:80-86` |
| E12 | **`/admin` indexable** : `robots.ts` sans `Disallow:/admin`, aucune page admin en `noindex`. | `src/app/robots.ts` |
| E13 | **Chrome public injecté sur `/admin`** : `Header`/`Footer` rendus sur toutes les pages ; classe `crm-shell-page` censée neutraliser = **classe morte sans CSS**. Layout cassé (double header). | `src/app/layout.tsx:38-40` |

### 🟡 Moyens (sélection)

- Self-fetch HTTP inutile : `/calendrier` est `force-dynamic` et fait un round-trip vers sa propre API (→ 503) à chaque requête avant fallback. (`calendar-view.ts:204`)
- Store de rate-limit en mémoire sans purge ni plafond (DoS mémoire + inefficace en multi-instance Docker). (`rate-limit.ts:15-44`)
- Catégorie « Souhaitée » en input texte libre au lieu d'un `<select>` (données back-office incohérentes). (`Forms.tsx:182`)
- Galerie médias : `[...news, ...news].slice(0,8)` → 4 photos dupliquées. (`medias/page.tsx:27`)
- `formatDate` admin sans garde `Number.isNaN` → « Invalid Date » affichable. (`Admin360Detail.tsx:68-78`)
- Actions admin Valider/Refuser/Annuler sans confirmation (décisions irréversibles sur dossiers d'enfants). (`Admin360Detail.tsx:380-396`)
- Injection de formule CSV : `escapeCsvValue` ne neutralise pas `= + - @` en tête de cellule. (`csv.ts:3-15`)
- Validation MIME upload basée sur `file.type` (déclaratif, falsifiable). (`documents/upload/route.ts:62-64`)

---

## 4. Incohérences

### Données & contenu
- **Double source de vérité** : pages publiques lisent les mocks (`data.ts`, camelCase) ; toutes les routes de lecture publique (`/api/news|teams|products|matches|partners|media|calendar`) renvoient 503 et utilisent un modèle DB (snake_case). Deux représentations concurrentes des mêmes entités, non réconciliées.
- **Deux types `Team` divergents** : `data.ts:17` (mock) vs `db/types.ts:143` (DB), même nom pour deux structures incompatibles ; aggravé par `export *` dans `db/index.ts`.
- **Dates figées mai 2025** sur un site daté juin 2026 : matchs, actualités, fallback calendrier « Mai 2025 », `nextMatch` annonçant des matchs déjà joués.
- **Catégorie « Packs »** proposée en filtre boutique mais aucun produit ne la porte (`data.ts:202-209`).
- **Partenaires douteux** : Nike/Adidas/Engie affichés sans preuve de contractualisation (risque d'image / allégation non fondée).

### Navigation & libellés
- **Sous-menu Médias** : Photos/Vidéos/Interviews → tous `/medias` (libellés trompeurs).
- **« Billetterie »** → `/calendrier` (pas de billetterie).
- **Loupe « Recherche »** → `/plan-du-site` (pas de recherche).
- **U18 R1 et U15 R1** absents du sous-menu Équipes/footer alors que les pages existent (200).
- **5 libellés différents** pour la même action « s'inscrire » (Rejoindre / Rejoindre le club / Je m'inscris en ligne / Rejoindre une équipe / S'inscrire).
- **État actif de nav incohérent** : desktop `startsWith`, mobile `===` (parent non surligné sur pages profondes).
- **Réseaux header (5) ≠ footer (4)** : WhatsApp présent dans le header, absent du footer.

### Conventions techniques
- **Fallback « lead » incohérent** : appliqué à contact/inscription/recrutement, **pas** à `/api/partners/requests` (→ 503 direct) alors que `LeadType` inclut `'partnership'`. (`leads.ts:20` ; `partners/requests/route.ts:19-21`)
- **`/api/me`** : GET renvoie 200 avec `profile: null` quand Supabase absent, PATCH renvoie 503 → asymétrie.
- **`slugify` dupliqué 3×** (`content.ts:28`, `recruitment-shop.ts:60`, `teams.ts:37`).
- **Extraction IP/UA dupliquée** inline dans 3 routes, redondante avec `rate-limit.ts:17-20`.
- **Gestion d'erreur par reniflage de chaîne** : `message.includes("Forbidden")` (`registrations/route.ts:73-74`).

### Design system
- **Deux verts primaires** : token `--viry-green` (#00351f) quasi inutilisé (5×) vs `#002f1d` codé en dur (106×).
- **Deux classes de cartes** : `official-card` (sans hover, 15 fichiers) vs `premium-card` (avec hover, 6 fichiers) pour des usages identiques.
- **9 fichiers recodent des boutons à la main** au lieu de `ButtonLink` (utilisé dans 4 fichiers seulement).
- **Rayons d'arrondi anarchiques** : `rounded-lg`×71, `rounded-md`×42, `rounded-full`×27, `rounded-2xl`×9, `rounded-xl`×3.
- **Module « Valeurs » dupliqué** avec habillages différents entre accueil et `/le-club`.
- **Calligraphie Kaushan** : utilisée 2× seulement (hero accueil), absente des autres heros → accueil et reste du site semblent issus de deux chartes.

---

## 5. Améliorations UX (parcours & conversion)

1. **Supprimer les fausses promesses de clic** : réétiqueter/désactiver panier boutique, « Billetterie », « Lire l'article », filtres équipes/boutique/médias, sous-menu Médias — en réutilisant le pattern honnête « Bientôt disponible » déjà présent sur les espaces membre/éducateur.
2. **Rendre les cartes cliquables** : équipes (home → `/equipes/[slug]`), actualités (→ page article), produits.
3. **Ajouter un fil d'Ariane** (avec `aria-current` + JSON-LD `BreadcrumbList`) sur toutes les pages de niveau 2/3 (fiches équipe, sous-pages club, pages légales boutique).
4. **Corriger l'accès « Mon espace »** : actuellement visible seulement au-delà de 1800px, absent du menu mobile et du footer → abaisser le seuil (`lg`) et l'ajouter au mobile/footer.
5. **Fiabiliser les tunnels de conversion** :
   - « Catégorie souhaitée » et « Poste » en `<select>` normalisés (ou datalist via âge calculé).
   - `autocomplete` (given-name, family-name, email, tel, bday) + `inputmode` sur tous les champs (impact direct mobile).
   - Erreurs inline par champ (exploiter `details[]` déjà renvoyés par l'API) + focus sur le 1er champ en erreur.
   - Message de succès en `role="status"` + focus/scroll + désactivation du bouton (anti double-envoi).
   - `max={today}` sur les dates de naissance, `maxLength` côté client.
   - Honeypot anti-bot sur inscription/recrutement/contact.
6. **Contact actionnable** : `tel:` et `mailto:` cliquables, fallback `<noscript>`, champ « Sujet » en `<select>` aligné sur les 4 interlocuteurs, lien « Itinéraire ».
7. **Page Stade** : vraie carte Maps + bouton itinéraire + transports/parking/PMR ; ne jamais laisser un placeholder en prod.
8. **Partenaires** : grille d'offres chiffrée (paliers, contreparties, audience via `clubStats`), dossier sponsoring téléchargeable, logos cliquables, formulaire dédié branché sur `/api/partners/requests`.
9. **Synchroniser les contenus temporels** (matchs/actus cohérents et futurs) et piloter la bannière d'inscription par une plage de dates conditionnelle.
10. **Harmoniser le langage des CTA** autour d'un libellé canonique d'inscription.

---

## 6. Améliorations UI (design visuel)

1. **PRIORITÉ accessibilité** : éliminer le jaune `#f7c600` sur fond clair (1,6:1). Le réserver aux surfaces vert foncé. Sur fond clair, passer les eyebrows en vert `#002f1d` (~9:1) ou jaune assombri `#8a6d00` (~4,6:1). Créer une classe `.eyebrow` contextuelle pour traiter les ~81 occurrences en une fois.
2. **Reconstruire un design system de tokens** : une seule valeur de vert et de jaune, exposées en variables CSS (`@theme` Tailwind v4), remplaçant ~250 couleurs codées en dur (#002f1d ×106, #f7c600 ×141).
3. **Refonder la typographie** : police de titres sportive + police de texte lisible (Inter/Archivo) via `next/font`, appliquées au body et h1–h3 (remplacer Arial/Helvetica). Décider d'un usage systématique de la calligraphie Kaushan.
4. **Unifier les composants** : une seule carte (variante interactive/statique explicite, hover identique) ; un seul `Button`/`ButtonLink` (tailles sm/md/lg) migré sur les 9 fichiers ; 2-3 tokens d'élévation au lieu des 13 ombres arbitraires recensées.
5. **Standardiser les rayons d'arrondi** par type d'élément (carte / badge / input) via tokens.
6. **Rendre les filtres réellement interactifs** (état actif jaune + hover) ou les redessiner pour qu'ils n'imitent plus des boutons inertes.
7. **Variante `outline`** : la rendre auto-adaptative ou la renommer `outline-on-dark` (texte blanc invisible sur fond clair = piège latent).
8. **Remonter `text-white/55`** à ≥70 % pour le texte porteur d'information (dates/lieux de match).
9. **Visuels produits réels** (maillot, survêtement…) au lieu des icônes Lucide incohérentes (Shield partagé, sac = Flag, casquette = Trophy).
10. **Espace admin** : corriger les accents (Viry-Châtillon, centralisé, équipes), aligner sur les tokens du site public.

---

## 7. Optimisations techniques

### Performance & Core Web Vitals
- **Migrer 100 % des visuels vers `next/image`** (`remotePatterns` Unsplash déjà configuré) → AVIF/WebP, srcset responsive, lazy automatique : **-60 à -75 % de poids image**.
- **Traiter le hero comme le LCP** : `next/image priority` (ou `<link rel=preload as=image fetchpriority=high>`) au lieu du background CSS de 690 Ko ; réduire à 1920px / q70-75 / AVIF.
- **Corriger l'inversion de preload** : rendre lazy les images sous-le-pli, réserver le préchargement au seul hero.
- **Retirer framer-motion du chemin critique** (~40 Ko gzip) : ne pas animer le H1 above-the-fold, remplacer Reveal/Stagger par du CSS ou charger en `dynamic import` sous-le-pli.
- **Garantir l'absence de CLS** : `aspect-ratio`/width-height + `loading=lazy` + `decoding=async` (gratuit avec `next/image`), en particulier galerie médias.
- **`<link rel=preconnect>` vers `images.unsplash.com`** tant que les images restent distantes ; planifier l'hébergement local des vraies photos.
- **Supprimer le self-fetch HTTP** de `/calendrier` (appeler la couche données/fallback directement) ; ne pas forcer `dynamic` pour du contenu statique.

### SEO & référencement local
- **JSON-LD `SportsClub`/`LocalBusiness`** (PostalAddress, geo, tel, email) + `SportsTeam` + `SportsEvent` + `BreadcrumbList` + `Article`/`NewsArticle`.
- **`metadataBase` + URL prod https** par défaut (alimente og:url, sitemap, robots, canoniques).
- **Descriptions meta + OpenGraph uniques par page** (dynamiques sur `/equipes/[slug]`, `/actualites/[slug]`).
- **Image OG 1200×630** + `twitter:card summary_large_image` via `opengraph-image.tsx`.
- **`Disallow:/admin`** dans `robots.ts` + `noindex` sur le layout admin.
- **`<time datetime>`** sémantique pour toutes les dates ; H1 portant le mot-clé métier (football/club/Viry-Châtillon).

### Accessibilité (WCAG 2.1 AA)
- Contraste jaune sur clair (1.4.3) — *cf. UI #1*.
- Menus déroulants accessibles au clavier (2.1.1 / 1.4.13) : pattern disclosure `aria-expanded`/`aria-controls`/Échap.
- Skip link « Aller au contenu » visible au focus + `id`/`tabIndex={-1}` sur `<main>` (2.4.1).
- `aria-current="page"` sur la nav active desktop et mobile (4.1.2).
- Feedback formulaires : `role=status`/`role=alert` sur les messages visibles, `aria-invalid` sur champs en erreur, légende « * obligatoire » non dépendante de la couleur (4.1.3 / 1.4.1).
- `alt` descriptifs sur les images porteuses de sens (actus, équipes, galerie) au lieu de `alt=""`.
- Étendre `prefers-reduced-motion` : MotionDiv mobile, `.light-sweep` en boucle infinie, règle globale neutralisant animations/transitions (2.3.3 / 2.2.2).
- Calendrier accessible : `<table>`/role=grid, `<caption>` = mois, `<th scope=col>`, `aria-current`.

### Sécurité
- **Rate-limiting** : dériver l'IP de XFF uniquement derrière Traefik (hops de confiance), purge des buckets expirés + plafond LRU, viser un store partagé (Redis) en multi-instance.
- **En-têtes de sécurité** via `headers()` dans `next.config.ts` : CSP stricte, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy ; `poweredByHeader: false`.
- **Capture de leads** : `chmod 600/700`, chiffrement au repos, rétention + purge, anonymisation IP/UA (RGPD mineurs).
- **Messages d'erreur génériques** côté client + log serveur ; réponses uniformes login/password-reset (anti-énumération).
- **Session admin** : cookies HttpOnly + Secure + SameSite=Strict (au minimum le refresh token) au lieu de sessionStorage.
- **Exports CSV** : neutraliser `= + - @` en tête de cellule ; **upload** : vérifier les magic bytes en complément du MIME.
- **Webhook leads** : valider https + exclure plages privées/métadonnées cloud + timeout.

### Architecture & dette
- **Trancher le périmètre du backend dormant** : ~71 routes sur 84 sans consommateur UI → archiver/contractualiser+tester, et documenter la frontière « vitrine active » vs « CRM dormant » (ADR + README).
- **Couche d'accès domaine unique** (mock OU Supabase selon config) consommée par pages ET routes API ; type de domaine partagé + mappers DB→domaine (supprime la double source de vérité).
- **Unifier** : un seul type `Team`, supprimer `export *` de `db/index.ts`, factoriser `slugify` (×3) et l'extraction IP/meta.
- **Erreurs métier typées** (`ForbiddenError`) + mapping erreur→statut centralisé dans `http.ts`.
- **Layout admin dédié** (`src/app/admin/layout.tsx`) sans Header/Footer public ; supprimer la classe morte `crm-shell-page` ; factoriser l'auth admin dans un provider unique (au lieu de la dupliquer dans Dashboard/Explorer/Detail).
- **Synchroniser README + docs** avec l'état réel (mode vitrine, leads, déploiement Docker/Traefik) ; marquer `docs/*` comme spécifications cibles.

---

## 8. Plan de correction priorisé

> Effort : **S** = < 0,5 j · **M** = 0,5–2 j · **L** = 2–5 j · **XL** = > 5 j (ou dépendance externe : photos, données réelles).

### P0 — Critique (prérequis avant toute mise en ligne publique)

| # | Action | Axe | Effort |
|---|---|---|---|
| P0-1 | **Protéger `/admin`** : `src/middleware.ts` (session/role) + layout admin dédié sans chrome public + `noindex` + `Disallow:/admin`. | Sécurité/Archi | M |
| P0-2 | **En-têtes de sécurité HTTP** (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) + `poweredByHeader:false`. | Sécurité | S |
| P0-3 | **Protéger les données de mineurs** : `chmod 600/700`, chiffrement/volume chiffré, rétention + purge, anonymisation IP/UA. | Sécurité/RGPD | M |
| P0-4 | **Corriger le rate-limiting** : XFF de confiance (Traefik) + purge buckets + plafond. | Sécurité | M |
| P0-5 | **Token session en cookie HttpOnly** (au moins le refresh) au lieu de sessionStorage ; messages d'erreur génériques + login anti-énumération. | Sécurité | M |
| P0-6 | **Retirer le classement inventé** (`51-index*4`) — afficher « Classement à venir » tant qu'aucune donnée réelle. | Football | S |
| P0-7 | **Neutraliser les actions inertes visibles** : panier « Ajouter », « Lire l'article », filtres, « Billetterie », loupe « Recherche » → états honnêtes « Bientôt disponible » / liens corrects. | UX/QA | M |
| P0-8 | **Corriger la grille calendrier** (offset du 1er, nombre réel de jours) + accessibilité grid. | QA/A11y | M |
| P0-9 | **Retirer le placeholder « Carte à connecter »** (carte Maps réelle ou masquer la section). | UX | S |
| P0-10 | **Supprimer les textes de consignes** (« Un vrai site officiel doit… ») et synchroniser les dates 2025→2026. | Football/Contenu | S |
| P0-11 | **Aligner validation serveur recrutement** (Poste/Club obligatoires) ou cohérence côté form. | QA/Sécurité | S |

### P1 — Important (qualité, conversion, crédibilité)

| # | Action | Axe | Effort |
|---|---|---|---|
| P1-1 | **Authenticité visuelle** : remplacer les photos Unsplash par de vraies photos du club (hero, stade, équipe fanion, école de foot). | Football | XL* |
| P1-2 | **Migrer vers `next/image`** + hero en LCP `priority` + corriger l'inversion de preload + preconnect. | Perf | L |
| P1-3 | **JSON-LD + `metadataBase` + OG/Twitter + descriptions uniques par page + image OG**. | SEO | M |
| P1-4 | **Contraste jaune** : classe `.eyebrow` contextuelle, jaune réservé au fond foncé (~81 occurrences). | A11y/UI | M |
| P1-5 | **Pages article** `/actualites/[slug]` + cartes cliquables + `<time>` + alt descriptifs. | UX/SEO | M |
| P1-6 | **Menus clavier-accessibles** (disclosure pattern) + skip link + `aria-current`. | A11y | M |
| P1-7 | **Réseaux sociaux cliquables** (header + footer harmonisés) + og:image. | Football/QA | S |
| P1-8 | **Fiabiliser les formulaires** : `<select>` catégorie/poste, `autocomplete`/`inputmode`, erreurs inline, `role=status`, honeypot, `max=today`. | UX/A11y | M |
| P1-9 | **Confirmations admin** sur Valider/Refuser/Annuler + validation UUID + `formatDate` sûr. | QA | M |
| P1-10 | **Incarner les humains** : mot du président nommé+photo, vrais coachs/effectifs, organigramme réel avec contacts. | Football | L* |
| P1-11 | **Tokens couleur unifiés** (1 vert, 1 jaune via `@theme`) + composants Button/Card unifiés. | UI/Archi | L |
| P1-12 | **Couche d'accès domaine unique** (mock/Supabase) + types unifiés + suppression `export *`. | Archi | L |

\* Effort dépendant de la fourniture de contenus réels par le club (photos, palmarès, effectifs).

### P2 — Confort (finition premium)

| # | Action | Axe | Effort |
|---|---|---|---|
| P2-1 | Fil d'Ariane global (composant + JSON-LD). | UX/SEO | S |
| P2-2 | Lightbox accessible + galerie médias réelle (sans doublons). | UX | M |
| P2-3 | Grille d'offres sponsoring + dossier PDF + logos partenaires cliquables. | Conversion | M |
| P2-4 | Standardiser rayons d'arrondi + tokens d'élévation. | UI | S |
| P2-5 | Page « Mon espace » accessible (seuil, mobile, footer) + harmonisation libellés CTA. | UX | S |
| P2-6 | CGV / Livraison-retour rédigées (ou noindex tant que vides). | Légal/SEO | M |
| P2-7 | Calendrier : `.ics` « Ajouter à l'agenda », lien fiche équipe, distinction match/événement. | UX | M |
| P2-8 | Factoriser slugify/IP-meta, erreurs typées, refactor auth admin en provider. | Archi | M |
| P2-9 | Compléter nav (U18/U15) + générer le menu depuis `teams[]`. | QA | S |
| P2-10 | Réduire framer-motion (CSS / dynamic import) + `prefers-reduced-motion` global. | Perf/A11y | M |
| P2-11 | Durcir CSV (préfixe `= + - @`), upload (magic bytes), webhook (allowlist). | Sécurité | M |
| P2-12 | Refonder la typographie (police titres + texte via `next/font`). | UI | M |

---

## 9. Roadmap

### Court terme — Sprint 1-2 (≈ 2-3 semaines) : « Sécuriser & rendre honnête »
**Objectif** : rendre le site mettable en ligne sans risque légal ni contenu mensonger.
- Tout le **P0** (sécurité admin/leads/rate-limit/cookies, classement retiré, actions inertes neutralisées, calendrier corrigé, placeholders retirés, dates synchronisées).
- P1-7 (réseaux sociaux), P1-4 (contraste), P1-3 (SEO de base : metadataBase + OG + JSON-LD club).
- **Jalon** : un site vitrine sûr, sans fausse promesse de clic ni donnée factuellement fausse.

### Moyen terme — Sprint 3-5 (≈ 4-6 semaines) : « Premium & conversion »
**Objectif** : atteindre le standard d'une agence digitale premium.
- P1-1 (photos réelles — déclencher le shooting club dès le sprint 1), P1-2 (performance/next-image), P1-5 (articles), P1-6 (a11y clavier), P1-8 (formulaires), P1-10 (humains du club), P1-11 (design system), P1-12 (couche domaine).
- P2 prioritaires : fil d'Ariane, galerie réelle, offres sponsoring.
- **Jalon** : Core Web Vitals verts, WCAG AA atteint sur les parcours clés, identité football authentique, conversion fiabilisée.

### Long terme — au-delà (selon décision CRM) : « Activer le back-office »
**Objectif** : transformer le backend dormant en produit vivant, ou l'assumer comme contrat documenté.
- Décision de périmètre sur les ~71 routes sans consommateur (archiver vs câbler).
- Branchement Supabase réel : auth cookie, CRM (familles/joueurs/inscriptions), boutique e-commerce (panier + `/api/orders` + paiement), classement/résultats via données FFF/district, calendrier dynamique.
- Refactor architecture (erreurs typées, provider auth, suppression du code mort), externalisation rate-limit (Redis), CGV/livraison réelles.
- **Jalon** : une seule application cohérente (vitrine + CRM) au lieu de deux applications superposées.

---

*Rapport consolidé à partir de 9 audits d'experts et 10 audits de pages. Audit en lecture seule — aucun fichier de code modifié.*
