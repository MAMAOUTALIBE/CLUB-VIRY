# 📘 Dossier complet — ES Viry-Châtillon Football

> Document unique regroupant **toute la stratégie et l'exploitation** du site
> **https://esvirychatillonfootball.org** : modèle économique, contenu à piloter
> dans l'admin/CRM, et procédure de déploiement.

## Sommaire
- **Partie 1 — Modèle économique** (comment le site génère de l'argent)
- **Partie 2 — Contenu éditable & modules CRM** (ce que l'admin gère/monétise)
- **Partie 3 — Déploiement & exploitation** (mettre le site à jour)

---

# PARTIE 1 — MODÈLE ÉCONOMIQUE


> Objectif : transformer le site en **moteur de revenus et d'économies**, à coût d'exploitation
> quasi nul (l'infra est déjà construite et hébergée sur un VPS partagé, et les paiements en
> ligne sont **gratuits** via HelloAsso). Hypothèses chiffrées pour un club **~600 licenciés**
> (association loi 1901, Essonne) — **à ajuster avec vos chiffres réels**.

---

## 1. L'idée force

Un site de club ne « vend » pas grand-chose tout seul. Ce qui le rend **rentable**, c'est qu'il
**centralise et automatise 6 flux d'argent** que le club gère déjà à la main (souvent mal :
impayés, temps bénévole, opportunités ratées). En digitalisant :

- on **récupère** ce qui fuit (impayés de cotisations, sponsors mal suivis) ;
- on **encaisse plus vite** et **sans frais** (HelloAsso : 0 % de commission) ;
- on **vend de la visibilité** aux entreprises locales (le sponsoring est le vrai gisement) ;
- on **ouvre de nouveaux revenus** à forte marge (stages, boutique, dons défiscalisés).

**Le coût marginal est proche de zéro** (site déjà fait, hébergement déjà payé, paiement gratuit)
→ presque tout ce qui rentre est de la **marge**. C'est ça, « très rentable ».

---

## 2. Les 6 leviers de revenus

### 🅰️ Inscriptions & cotisations en ligne (le socle)
- **Aujourd'hui** : ~600 licenciés × ~200 € ≈ **120 000 €/an** encaissés à la main.
- **Le site apporte** : paiement en ligne (HelloAsso **0 %**), **paiement en 3-4 fois**, relances
  automatiques, dossier + pièces dématérialisés.
- **Gain** : moins d'**impayés** (récupérer ne serait-ce que 5 % = **+6 000 €/an**), trésorerie
  encaissée plus tôt, et **dizaines d'heures de bénévolat** économisées. Option : **frais de
  dossier** 5 € → +3 000 €/an.

### 🅱️ Sponsoring & partenariats (le plus gros gisement)
Le site = vitrine pro qui rend le sponsoring **vendable** (visibilité, audience, image). Grille type :

| Pack | Contreparties | Prix/saison |
|---|---|---|
| **Bronze** | logo sur le site + 1 post réseaux | 250 € |
| **Argent** | logo site + panneau stade + réseaux | 800 € |
| **Or** | maillot/survêt + bannière site + temps forts + événements | 2 000–3 000 € |

- **Réaliste** : 20 sponsors × 800 € = **16 000 €/an**. **Ambitieux** : 35 × 1 100 € ≈ **38 000 €/an**.
- C'est le levier **le plus rentable** (marge ~100 %) et **scalable** : chaque nouveau sponsor
  est quasi pur profit. Le dossier de sponsoring + la page partenaires se gèrent depuis le site.

### 🅲️ Boutique en ligne (merchandising)
- Maillots, survêtements, écharpes, accessoires aux couleurs du club. Marge **30-50 %**.
- 600 licenciés + familles + supporters : si **30 % achètent ~50 €/an** → 9 000 € de CA,
  **~3 600 € de marge**. Boutique HelloAsso = **0 % de frais** → marge préservée.
- Bonus : éditions « collector » (montée, anniversaire du club) = pics de marge.

### 🅳️ Stages & école de foot (la cash-cow à forte marge)
- **Stages vacances** (Toussaint, hiver, printemps, été) : ~**130 €/semaine/enfant**.
  4 stages × 30 enfants × 130 € = **15 600 €** de CA, marge ~**9 000 €**.
- **Académie technique**, **stages gardiens**, **détections payantes** : forte demande, forte marge.
- Tout se **réserve et se paie en ligne** sur le site (zéro paperasse).

### 🅴️ Dons & financement participatif (asso = défiscalisation 66 %)
- En association loi 1901, un don ouvre **66 % de réduction d'impôt** : donner 100 € ne coûte
  **34 €** au donateur → **levier très puissant**.
- **Don récurrent** : 50 donateurs × 50 € = 2 500 €/an. **Crowdfunding** (minibus, équipement,
  rénovation) via HelloAsso : une campagne lève couramment **3 000–15 000 €**.

### 🅵️ Billetterie & événements
- Loto, tournois, gala, soirée du club, repas, buvette : **billetterie HelloAsso gratuite**.
- Une soirée/loto net **2 000–5 000 €** ; un tournoi (équipes + buvette) **1 000–3 000 €**.

---

## 3. Projection annuelle (revenus **additionnels** apportés par le digital)

> Hors cotisations (qui financent le fonctionnement). Marge nette estimée, à valider.

| Levier | An 1 (prudent) | An 2 (réaliste) | An 3 (ambitieux) |
|---|--:|--:|--:|
| Sponsoring | 6 000 € | 16 000 € | 38 000 € |
| Stages / académie | 5 000 € | 9 000 € | 18 000 € |
| Boutique (marge) | 2 000 € | 4 000 € | 8 000 € |
| Dons / crowdfunding | 2 000 € | 5 000 € | 10 000 € |
| Billetterie / événements | 1 000 € | 4 000 € | 8 000 € |
| **Sous-total digital** | **16 000 €** | **38 000 €** | **82 000 €** |
| + Économies cotisations (impayés/temps) | 6 000 € | 9 000 € | 12 000 € |
| **= Impact total/an** | **~22 000 €** | **~47 000 €** | **~94 000 €** |

---

## 4. Pourquoi c'est rentable : la structure de coûts

| Poste | Coût | Commentaire |
|---|---|---|
| Hébergement | ~**0 €** marginal | déjà sur le VPS partagé existant |
| Paiement en ligne | **0 %** | HelloAsso (vs ~1,4 % + 0,25 € chez Stripe) |
| Site / dév | déjà fait | maintenance légère |
| Boutique | coût des produits | déduit de la marge (30-50 %) |
| Stages | éducateurs | souvent défrayés / bénévoles |

➡️ **Charges fixes quasi nulles** + **paiements gratuits** = presque tout le chiffre rentre en
**marge**. Le **retour sur investissement est immédiat** (le 1er sponsor ou le 1er stage paie déjà
plus que l'année d'hébergement).

---

## 5. Plan d'action (du quick-win au récurrent)

**Phase 1 — 0 à 3 mois (gratuit, gains immédiats)**
1. Ouvrir un compte **HelloAsso** (gratuit) → brancher **cotisations, dons, boutique, billetterie**.
2. Activer le bouton **« Soutenir le projet »** (don défiscalisé) sur le site.
3. Créer la **grille de sponsoring** (Bronze/Argent/Or) + page partenaires « Devenez partenaire ».
4. Vendre les **3-5 premiers sponsors** locaux (commerçants du quartier).

**Phase 2 — 3 à 9 mois (montée en puissance)**
5. **Boutique en ligne** réelle (maillots/survêt) avec paiement.
6. **Stages vacances** réservables en ligne.
7. **1ʳᵉ campagne de crowdfunding** sur un projet concret.
8. **Activer le CRM (Supabase)** pour piloter inscriptions, sponsors, boutique, stages depuis l'admin.

**Phase 3 — 9 à 18 mois (récurrence & échelle)**
9. **Académie / stages réguliers**, détections payantes.
10. **Événements billettés** (loto, gala, tournois).
11. **Contenus premium / médias** (photos-vidéos de match à la vente, live sponsorisé).

---

## 6. Indicateurs à suivre (KPIs)

- Nb de **sponsors** actifs × valeur moyenne du pack.
- **% de cotisations payées en ligne** (et taux d'impayés résiduel).
- **Panier moyen** boutique × nb d'acheteurs.
- **Taux de remplissage** des stages.
- Montant **dons** + résultat des campagnes crowdfunding.
- **Conversion** visiteurs du site → inscrits / acheteurs / donateurs.

---

## 7. Le rôle du site (et du CRM) dans tout ça

Le site est **la boutique, la caisse et la vitrine** réunies : il **encaisse** (HelloAsso),
**montre** (sponsors, équipes, actus → audience), et **automatise** (inscriptions, stages,
dons). Le **CRM/admin** (à activer via Supabase) est le **tableau de bord** qui pilote ces flux :
qui a payé, quels sponsors, quel stock boutique, quelles inscriptions. ➡️ **D'abord les quick-wins
HelloAsso (Phase 1, sans rien coder), puis le CRM pour industrialiser.**

---

### Sources (marché français, 2025-2026)
- HelloAsso — modèle 0 % de commission : https://info.helloasso.com/modele-economique
- Prix des licences / cotisations foot amateur : https://www.sport-et-loisir.com/quel-est-le-prix-dune-licence-de-football-en-2025-2026/
- Construire une grille de sponsoring amateur : https://www.sporteasy.net/fr/blog/gerer-mon-club/financer/sponsoring-amateur-3-etapes-pour-construire-sa-grille-tarifaire/

> ⚠️ Les montants sont des **estimations de cadrage** pour ~600 licenciés. À affiner avec vos
> chiffres réels (cotisation moyenne, nb d'équipes jeunes pour les stages, tissu de commerçants
> locaux pour le sponsoring).

---

# PARTIE 2 — CONTENU ÉDITABLE & MODULES CRM


Liste de **tout ce qui peut être modifié** sur le site ES Viry-Châtillon, organisé par
module, avec la **fréquence** de mise à jour et l'**état actuel** (données figées « en dur »
ou table déjà prévue côté base). Objectif : savoir quoi mettre dans l'espace admin (CRM).

> Légende fréquence : 🔴 souvent (hebdo/mensuel) · 🟠 ponctuel/saisonnier · 🟢 rare (annuel)
> État : **MOCK** = aujourd'hui figé dans le code (`src/lib/data.ts` ou la page) · **TABLE** = entité déjà prévue en base (Supabase), reste à brancher l'écran d'édition.

---

## A. CONTENU DU SITE (CMS) — ce que l'admin publie pour le site public

### 1. 🔴 Actualités — `news`
- **Pages** : Accueil (« à la une » + dernières actus), `/actualites`, `/actualites/[slug]`.
- **Éditable** : titre, date, catégorie, extrait, **contenu de l'article**, image, mise « à la une », publié/brouillon.
- **Fréquence** : 🔴 plusieurs par mois. · **État** : MOCK (5 actus) + TABLE `news`.

### 2. 🔴 Calendrier & Matchs — `matches`, `club_events`
- **Pages** : `/calendrier`, Accueil (« prochain match »), agenda.
- **Éditable** : équipe, adversaire, domicile/extérieur, date/heure, lieu, compétition, statut, **score/résultat**, événements du club (tournois, réunions, stages).
- **Fréquence** : 🔴 chaque semaine. · **État** : MOCK (3 matchs) + TABLE `matches` / `club_events`.

### 3. 🔴 Match en direct — module « LiveMatch »
- **Pages** : `/actualites` (suivi live + lecteur vidéo).
- **Éditable** : équipes, score en direct, chrono, faits de match, lien vidéo, activer/désactiver le live.
- **Fréquence** : 🔴 les jours de match. · **État** : MOCK (composant `LiveMatch`).

### 4. 🟠 Médias / Galerie — `media_albums`, `media_assets`
- **Pages** : `/medias`.
- **Éditable** : albums, photos, vidéos, légendes, catégories (photos/vidéos/interviews).
- **Fréquence** : 🟠 après chaque événement. · **État** : MOCK (réutilise les actus) + TABLE.

### 5. 🟠 Équipes — `teams`, `team_staff`, `team_players`, `seasons`
- **Pages** : `/equipes`, `/equipes/[slug]`.
- **Éditable** : nom, catégorie, saison, description, photo, **coach + adjoint**, **effectif (joueurs)**, prochain match, (classement quand dispo).
- **Fréquence** : 🟠 en début de saison + ajustements. · **État** : MOCK (6 équipes) + TABLE.

### 6. 🟠 Partenaires — `partners`, `partnership_requests`
- **Pages** : `/partenaires`, bandeau partenaires Accueil.
- **Éditable** : nom, **logo**, lien, niveau de partenariat, ordre d'affichage ; **offres de sponsoring** (paliers, contreparties) ; demandes reçues.
- **Fréquence** : 🟠 ponctuel. · **État** : MOCK (liste de noms) + TABLE.

### 7. 🟠 Boutique — `products`, `product_categories`, `product_variants`
- **Pages** : `/boutique`, fiches produits.
- **Éditable** : produits, **prix**, catégories, variantes (tailles), visuels, disponibilité ; pages **CGV** et **Livraison & retour** (textes à rédiger).
- **Fréquence** : 🟠 ponctuel. · **État** : MOCK (6 produits) + TABLE.

### 8. 🟠 Pages « Le Club » (CMS éditorial)
- **Pages** : `/le-club`, `/le-club/histoire`, `/le-club/mot-du-president`, `/le-club/organigramme`, `/le-club/stade-henri-longuet`.
- **Éditable** :
  - **Histoire** : frise chronologique (dates + textes).
  - **Mot du président** : texte + **nom et photo du président** (actuellement anonyme → *Saglam Ferhat*).
  - **Organigramme** : membres du bureau, direction sportive, éducateurs, administration (noms + fonctions + contacts).
  - **Stade Henri Longuet** : infrastructures, **adresse**, plan/carte, horaires d'accès, galerie.
- **Fréquence** : 🟢 rare. · **État** : MOCK (texte en dur dans les pages).

### 9. 🟠 Bannière d'inscription & périodes
- **Pages** : bandeau du Header (« Inscriptions des licenciés : du … »), page `/inscriptions`.
- **Éditable** : texte de l'annonce, **dates d'ouverture/fermeture** des inscriptions, activer/masquer le bandeau.
- **Fréquence** : 🟠 saisonnier. · **État** : MOCK (texte en dur dans `Header.tsx`).

---

## B. IDENTITÉ & PARAMÈTRES DU CLUB — `seasons`, paramètres

### 10. 🟢 Chiffres du club (`clubStats`)
- **Page** : Accueil + `/le-club`. · **Éditable** : licenciés, éducateurs, nb d'équipes, places au stade, année de création. · 🟢 annuel. · MOCK.

### 11. 🟢 Valeurs du club (`values`)
- **Pages** : Accueil, `/le-club`. · **Éditable** : titres + descriptions des valeurs (Respect, Travail…). · 🟢 rare. · MOCK.

### 12. 🟠 Coordonnées & réseaux sociaux (`src/lib/socials.ts`)
- **Partout** (Header, Footer, Contact). · **Éditable** : **téléphones, email, adresse**, et surtout les **URLs Facebook / Instagram / YouTube / TikTok / WhatsApp** (aujourd'hui vides → liens inactifs). · 🟢 rare. · MOCK.

### 13. 🟢 Pages légales
- `/mentions-legales`, `/politique-confidentialite`, `/boutique/conditions-generales`, `/boutique/livraison-retour`. · Textes à rédiger/éditer. · 🟢 rare. · MOCK.

### 14. 🟢 Menu & navigation (`navItems`)
- Header/Footer. · Ordre et libellés des entrées de menu. · 🟢 très rare. · MOCK.

---

## C. GESTION OPÉRATIONNELLE (CRM au fil de l'eau — déjà prévu en base)

> Ces modules ne sont pas du « contenu site » mais de la **gestion** : ils existent déjà côté
> backend (tables + API), il reste à exposer les écrans dans l'admin.

| Module | Tables | Rôle | Fréquence |
|---|---|---|---|
| **Inscriptions & documents** | `registrations`, `registration_documents` | Recevoir / valider les dossiers, pièces justificatives | 🔴 continu |
| **Familles** | `families`, `family_members`, `player_guardians` | Fiches familles, responsables | 🔴 continu |
| **Joueurs** | `players`, `team_players` | Fiches joueurs, licences, affectation équipe | 🔴 continu |
| **Messages contact** | `contact_messages` | Demandes reçues via le formulaire | 🔴 continu |
| **Détections / Recrutement** | `recruitment_applications` | Candidatures détections | 🟠 par campagne |
| **Commandes & paiements** | `orders`, `order_items`, `payments` | Suivi boutique + encaissements | 🟠 ponctuel |
| **Finances** | `payments` + vues | Cotisations, suivi trésorerie, exports | 🔴 mensuel |
| **Entraînements & présences** | (à créer) | Planning + feuilles de présence | 🔴 hebdo |
| **Convocations match** | `matches` + (à créer) | Convoquer les joueurs, feuille de match | 🔴 hebdo |
| **Utilisateurs / rôles** | `profiles` | Comptes admin/éducateurs, permissions | 🟢 rare |
| **Notifications** | `notification_logs` | Webhook temps réel, email admin | 🟢 réglage |
| **Journal d'activité** | `activity_logs` | Traçabilité des actions admin | (auto) |

---

## D. Récapitulatif — quoi mettre dans l'admin, par priorité

**Priorité 1 (contenu qui vit chaque semaine/mois)** : Actualités · Calendrier/Matchs · Match en direct · Médias.
**Priorité 2 (saisonnier)** : Équipes/effectifs · Partenaires · Boutique · Bannière inscriptions.
**Priorité 3 (rare mais utile)** : Pages « Le Club » (histoire, président, organigramme, stade) · Chiffres & valeurs · Coordonnées/réseaux · Pages légales.
**En parallèle (gestion)** : Inscriptions · Familles · Joueurs · Messages · Finances.

> 🔧 **Note technique** : aujourd'hui le site tourne en **mode vitrine** avec un contenu **figé dans le code** (`src/lib/data.ts` + textes des pages). Rendre tout ceci éditable = **brancher Supabase** (les tables existent déjà) puis créer les écrans d'édition de l'admin. Le détail fonctionnel de chaque module est dans `docs/cahier-des-charges-crm.md` (sections 5.1 à 5.20).

---

# PARTIE 3 — DÉPLOIEMENT & EXPLOITATION DU SITE


Site **en production** sur **https://esvirychatillonfootball.org** (mode vitrine, sans Supabase).
Hébergé en **Docker + Traefik** sur le VPS, à côté d'autres sites (e-formationgn, etc.).

> **À lire en premier** si tu veux juste mettre à jour le site après une modification :
> saute directement à la section **[2. Mettre à jour le site](#2-mettre-à-jour-le-site-à-chaque-modification)**.

---

## 0. Fiche d'infos (à garder sous la main)

| Élément | Valeur |
|---|---|
| **Domaine** | `esvirychatillonfootball.org` (+ `www`) |
| **Site en ligne** | https://esvirychatillonfootball.org |
| **VPS (SSH)** | `deploy@votre-vps` — port `22` |
| **Dossier sur le VPS** | `/opt/esviry` |
| **Branche de production** | `main` |
| **Conteneur Docker** | `es-viry-football` |
| **Réseau Docker** | `esviry-net` (créé tout seul par compose) |
| **Reverse-proxy** | Traefik partagé (HTTPS auto via Let's Encrypt) |
| **Demandes (contact/inscription/recrutement)** | `/opt/esviry/var/leads/*.jsonl` |
| **Repo GitHub** | https://github.com/MAMAOUTALIBE/CLUB-VIRY |

**Se connecter au VPS** :
```bash
ssh -p 22 deploy@votre-vps
```

---

## 1. Le principe

```
Tu modifies le code (en local)
        │
        ▼
Tu vérifies en local        →   npm run typecheck / lint / test / build
        │
        ▼
Tu envoies sur GitHub       →   git add / commit / push  (branche main)
        │
        ▼
Tu déploies sur le VPS      →   ./deploy.sh   (ou les 3 commandes manuelles)
        │
        ▼
Traefik sert la nouvelle version en HTTPS, automatiquement.
```

> Le build (`docker compose --env-file .env.local build`) tourne **sur le VPS** : c'est lui qui exécute
> `npm ci` + `next build`. Tu n'as donc rien à builder en local pour déployer.

---

## 2. Mettre à jour le site (à CHAQUE modification)

### A. En local — vérifier puis envoyer le code

```bash
cd ~/CLUB-VIRY

# 1) (recommandé) vérifier que tout est sain AVANT d'envoyer
npm run typecheck && npm run lint && npm run test && npm run build

# 2) envoyer sur GitHub (branche main = production)
git add -A
git commit -m "Décris ta modification ici"
git push origin main
```

### B. Déployer sur le VPS — au choix

**Option rapide (recommandée) — une seule commande depuis ton Mac :**
```bash
cd ~/CLUB-VIRY
./deploy.sh
```
Le script se connecte au VPS, récupère la dernière version, rebuild, redémarre,
attend que le conteneur soit `healthy` et fait un smoke test. (Voir le script `deploy.sh`.)

**Option manuelle — sur le VPS :**
```bash
ssh -p 22 deploy@votre-vps
cd /opt/esviry
git pull --ff-only
docker compose --env-file .env.local build
docker compose --env-file .env.local up -d
docker compose ps        # le conteneur doit passer à "healthy" (~30 s)
```

> ✅ `git pull` ne touche **jamais** à `.env.local` ni à `var/leads` (ils sont ignorés par Git) :
> ta config et tes demandes reçues sont préservées à chaque mise à jour.

---

## 3. Vérifier que la mise à jour est OK (smoke test)

Depuis ton Mac (ou un navigateur) :
```bash
D=esvirychatillonfootball.org
curl -sI https://$D/ | head -1                       # doit répondre 200
curl -s -o /dev/null -w "%{http_code}\n" https://$D/equipes
curl -s -o /dev/null -w "redirect: %{http_code}\n" http://$D/      # 301 -> https
curl -s -o /dev/null -w "admin: %{http_code}\n" https://$D/admin   # 307 -> /connexion
```
Et à l'œil : ouvre **https://esvirychatillonfootball.org** et vérifie ta modification + le cadenas HTTPS.

---

## 4. En cas de problème — revenir en arrière (rollback)

Sur le VPS :
```bash
cd /opt/esviry
git log --oneline -5                 # repère le commit qui marchait
git checkout <hash_du_commit_ok>     # ex: 557ba0c
docker compose --env-file .env.local build && docker compose --env-file .env.local up -d
```
Pour revenir ensuite à la dernière version : `git checkout main && git pull && docker compose --env-file .env.local build && docker compose --env-file .env.local up -d`.

---

## 5. Surveiller / consulter

```bash
# État du conteneur
cd /opt/esviry && docker compose ps

# Logs en direct (Ctrl-C pour quitter)
docker compose logs -f

# Demandes reçues (contact / inscription / recrutement), en mode vitrine
ls -l var/leads
cat var/leads/contact.jsonl
cat var/leads/registration.jsonl
cat var/leads/recruitment.jsonl
```

> 💡 Pour être **prévenu en temps réel** de chaque demande (en plus du fichier),
> renseigne `NOTIFICATION_WEBHOOK_URL` dans `/opt/esviry/.env.local` (Make / Zapier /
> Discord / relais email), puis `docker compose --env-file .env.local up -d`.

---

## 6. Dépannage

| Symptôme | Cause probable / solution |
|---|---|
| **Conteneur `unhealthy`** | `docker compose logs --tail=50` pour voir l'erreur. Souvent un build cassé : corrige le code, re-`git push`, redéploie. |
| **HTTPS / cadenas KO** | Le DNS de `esvirychatillonfootball.org` doit pointer vers l'IPv4 du VPS Hostinger. Vérifie : `dig +short esvirychatillonfootball.org`. Traefik régénère le certificat automatiquement une fois le DNS bon. |
| **Build qui échoue sur la RAM** | Le VPS est partagé. Réessaie quand il est moins chargé, ou libère de la mémoire. |
| **`git pull` refusé (divergence)** | Tu as dû committer sur le VPS par erreur. Fais `git fetch origin && git reset --hard origin/main` (⚠️ écrase les modifs locales du VPS, mais pas `.env.local`/`var/leads`). |
| **Demandes non enregistrées dans `var/leads`** | Vérifie le propriétaire : `chown -R 1001:1001 /opt/esviry/var/leads` (le conteneur tourne en uid 1001). |

---

## 7. Première installation (déjà faite — pour mémoire / nouveau serveur)

```bash
ssh -p 22 deploy@votre-vps
cd /opt
git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git esviry
cd esviry
cp .env.production.example .env.local          # déjà rempli pour esvirychatillonfootball.org
mkdir -p var/leads && chown -R 1001:1001 var/leads
docker compose --env-file .env.local build
docker compose --env-file .env.local up -d
```
Prérequis : Docker + un Traefik en service (entrypoints `web`/`websecure`, certresolver
`letsencrypt`) et le DNS du domaine pointant vers le VPS. Le réseau `esviry-net` est créé
automatiquement ; Traefik le détecte via le label `traefik.docker.network`.

---

## 8. (Plus tard) Activer le CRM complet (Supabase)

Pour l'admin, l'authentification et les données dynamiques :
1. Créer un projet **Supabase** (URL, `anon key`, `service_role key`).
2. Appliquer **dans l'ordre** les migrations `supabase/migrations/202606060001_*.sql` → `...0009_*.sql`, puis `supabase/seed.sql`.
3. Créer un compte **admin** (`ADMIN_CLUB` ou `SUPER_ADMIN`).
4. Renseigner dans `/opt/esviry/.env.local` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. `docker compose --env-file .env.local up -d --build`. Connexion via `https://esvirychatillonfootball.org/connexion`.

---

## Notes

- **Sécurité** : en-têtes HSTS/CSP/X-Frame-Options actifs ; `/admin` redirige vers `/connexion` (non exploité en vitrine).
- **HTTPS** : certificat Let's Encrypt **auto-renouvelé** par Traefik — rien à faire.
- **Persistance** : `./var/leads` est monté en volume → les demandes survivent aux mises à jour et reboots.
- **Reboot du VPS** : le conteneur redémarre tout seul (`restart: unless-stopped`).
- ⚠️ **Domaine** : seul `esvirychatillonfootball.org` (avec « es ») est actif. `virychatillonfootball.org` (sans « es ») n'existe pas en DNS — si tu le possèdes, on peut le rediriger vers le bon.
