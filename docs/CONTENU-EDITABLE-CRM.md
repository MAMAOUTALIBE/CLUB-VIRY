# 🗂️ Contenu éditable du site → Espace admin / CRM

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
