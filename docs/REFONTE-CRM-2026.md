# Refonte stratégique du CRM — ES Viry-Châtillon Football

**Date** : 2026-06-13
**Nature** : document d'architecture & plan de mise en œuvre (réflexion AVANT modification)
**Objectif** : transformer le CRM dispersé en **plateforme de pilotage centralisée, moderne et intelligente**.

> Note de cadrage : ce document est une **proposition d'architecture**. Aucune modification de code n'a été
> faite. Le socle d'abonnements/notifications livré récemment (`notification_preferences`, fan-out
> `family-notifications.ts`, déclencheurs séances/convocations) est le **point de départ concret** des
> Phases 4 et 5.

---

## PHASE 1 — Audit du CRM actuel

### 1.1 État des lieux (18 entrées de menu, à plat)

| Module (menu) | Page | Rôle réel | Constat |
|---|---|---|---|
| Pilotage | `/admin` | Dashboard (AdminDashboardLive) | KPIs partiels, données partiellement statiques |
| Actualités | `/admin/actualites` | CRUD news | OK |
| Calendrier | `/admin/calendrier` | Matchs + événements | Mélange matchs / événements |
| Équipes | `/admin/equipes(/[id])` | Équipes + effectif/staff (TeamRosterEditor) | OK, riche |
| Encadrement | `/admin/encadrement` | Éducateurs publics (opt-in) | Récent |
| Direction | `/admin/direction` | Bureau & dirigeants | Récent |
| Inscriptions | `/admin/inscriptions(/[id])` | Demandes d'inscription | OK |
| Familles | `/admin/familles(/[id])` | Familles | Chevauche Joueurs |
| Joueurs | `/admin/joueurs(/[id])` | Joueurs | Sous-ensemble de Familles |
| Détections | `/admin/recrutement` | Candidatures recrutement | Lecture seule (corrigé récemment) |
| Finances | `/admin/finances` | Paiements/finances | À consolider avec Boutique |
| Messages | `/admin/messages` | Demandes de contact | « Communication » réduite au contact |
| Partenaires | `/admin/partenaires` | Sponsors + demandes | OK |
| Boutique | `/admin/boutique` | Produits | Vitrine (pas de tunnel) |
| Médias | `/admin/medias` | Albums | **Embryon** de médiathèque |
| Paramètres | `/admin/parametres` | CMS / identité club | OK |
| **Sportif** | `/admin#modules` | — | **Factice** (ancre placeholder) |
| **Automatisations** | `/admin#modules` | — | **Factice** (ancre placeholder) |

### 1.2 Problèmes identifiés

- **Navigation surchargée** : 18 entrées à plat, sans regroupement → charge cognitive, pas de vision par pôle.
- **2 entrées factices** (`Sportif`, `Automatisations` → `#modules`) : promesses non tenues.
- **3 annuaires de personnes séparés** : Joueurs, Encadrement, Direction (+ Familles) → modèle « personne » éclaté.
- **Chevauchements** : Joueurs ⊂ Familles ; Calendrier mélange matchs et événements ; Finances vs Boutique.
- **« Communication » = contact uniquement** : pas d'emailing, pas de hub notifications, pas de réseaux sociaux.
- **Médias = simples albums** : pas de vraie médiathèque (vidéos, tags, réutilisation, ciblage).
- **Aucune UI Utilisateurs/Permissions** : les rôles existent en base mais se gèrent en SQL/GoTrue.
- **Aucun module Abonnements** alors que le socle technique (préférences + fan-out) existe désormais.
- **Dashboard partiel** : badges/chiffres partiellement statiques, pas une vraie vision 360°.

### 1.3 Synthèse
Le CRM a une **base technique solide** (auth/rôles/RLS, API cohérentes, modules CRUD réutilisables via
`AdminCrud`/`AdminModuleBoard`) mais une **organisation horizontale** qui ne raconte pas le club. Il faut
**regrouper, fusionner, et ajouter 4 briques** (Médiathèque, Communication/Abonnements, Utilisateurs/Permissions,
Automatisations) pour passer d'un back-office à une **plateforme de pilotage**.

---

## PHASE 2 — Nouvelle architecture (proposition)

Organisation en **7 pôles** (sidebar repliable par pôle), avec un Dashboard 360 en entrée. La proposition
reprend ta trame en la **rationalisant** (fusions, suppression des doublons, mapping de l'existant).

```
🏠 PILOTAGE
   └─ Dashboard 360°

🟢 CLUB & CONTENUS
   ├─ Actualités                 (existant: NewsAdmin)
   ├─ Médiathèque                (NOUVEAU — fusion Médias+Galerie+Photos+Vidéos, Phase 3)
   └─ Événements                 (extrait du Calendrier : non-match)

⚽ SPORTIF
   ├─ Équipes & effectifs        (existant: TeamsAdmin + TeamRosterEditor)
   ├─ Joueurs                    (existant — vue licenciés)
   ├─ Encadrement (éducateurs)   (existant: EducatorsPublicAdmin)
   ├─ Direction (bureau)         (existant: OfficialsAdmin)
   ├─ Matchs & Calendrier        (existant: CalendarAdmin — volet matchs)
   ├─ Détections                 (existant: recrutement)
   └─ Planning (séances/présences/convocations)  (existant côté éducateur → vue admin)

👨‍👩‍👧 FAMILLES & LICENCIÉS
   ├─ Familles                   (existant)
   ├─ Inscriptions               (existant)
   ├─ Documents                  (à exposer — table documents existante)
   └─ Abonnements                (NOUVEAU — Phase 4, sur notification_preferences)

🤝 PARTENAIRES
   ├─ Sponsors / Partenaires     (existant: PartnersAdmin)
   ├─ Demandes & démarchage      (existant: requests, désormais actionnable)
   └─ Espace partenaire (visibilité/stats)  (NOUVEAU — Phase 4)

💶 BUSINESS
   ├─ Boutique (produits)        (existant: ProductsAdmin)
   ├─ Commandes & facturation    (à exposer — /api/orders existe)
   ├─ Finances                   (existant)
   └─ Campagnes                  (NOUVEAU — promo/sponsoring)

📣 COMMUNICATION
   ├─ Messages (contact)         (existant — désormais actionnable)
   ├─ Notifications & Abonnés    (NOUVEAU — hub, sur le socle livré)
   ├─ Emailing                   (NOUVEAU — provider Brevo/Resend)
   └─ Réseaux sociaux            (publication assistée depuis la Médiathèque)

⚙️ ADMINISTRATION
   ├─ Utilisateurs & Permissions (NOUVEAU — UI sur le système de rôles existant)
   ├─ Paramètres / CMS           (existant: SettingsAdmin)
   ├─ Automatisations            (NOUVEAU — moteur, Phase 5)
   └─ Journaux (logs/activité)   (existant: recordActivity → à exposer)
```

### Décisions clés
- **Sidebar repliable par pôle** (au lieu de 18 liens à plat) → navigation simplifiée, scalable.
- **Modèle « Personne » unifié** : Joueurs / Éducateurs / Dirigeants / Familles partagent une fiche
  personne (déjà adossée à `profiles` + `players`) avec des **vues filtrées par rôle**, au lieu de 3 annuaires.
- **Séparer Matchs et Événements** (deux objets métier distincts dans le calendrier).
- **Aucune suppression destructrice** : on **regroupe** d'abord (non-destructif), on fusionne ensuite.

---

## PHASE 3 — Médiathèque centralisée (HUB MÉDIAS)

Fusion de Galerie / Photos / Vidéos / Médias en **un module unique**.

### Modèle de données proposé
```sql
-- Asset média unique (photo ou vidéo), réutilisable partout.
media_assets (
  id, type ('PHOTO'|'VIDEO'), url, thumbnail_url, title, taken_at,
  uploaded_by, created_at
)
-- Tags polymorphes : un média lié à équipe / match / événement / joueur / sponsor / album.
media_tags (
  media_id, tag_type ('TEAM'|'MATCH'|'EVENT'|'PLAYER'|'SPONSOR'|'ALBUM'|'CATEGORY'), tag_id
)
media_albums ( id, title, cover_media_id, visibility ('PUBLIC'|'FAMILIES'|'TEAM'), ... )
```
### Fonctions
- Upload photos/vidéos (Supabase Storage), **album**, **tags** (équipe, match, événement, joueur, sponsor).
- **Filtrage** par n'importe quel tag ; **réutilisation** : un média taggé « Seniors D1 » apparaît
  automatiquement sur la page équipe, l'album, et est **ciblable** pour notification (Phase 5).
- **Visibilité** : public / familles concernées (droit à l'image) / équipe.
- Remplace l'actuel `MediaAdmin` (albums simples) en conservant la compatibilité.

---

## PHASE 4 — Automatisation des contenus & abonnements

> **Socle déjà en place** : `notification_preferences` (opt-in par catégorie × canal), fan-out
> `family-notifications.ts` (résolution tuteurs via `player_guardians`), déclencheurs séances/convocations.
> La Phase 4 généralise ce socle en **abonnements** à la souscription.

### Principe : à la souscription → profil + droits + contenus automatiques

| Abonnement | Déclencheur | Actions automatiques |
|---|---|---|
| **Joueur** | Inscription validée (rôle JOUEUR) | profil créé · rattaché à son équipe · accès : photos/vidéos de l'équipe, calendrier, convocations, documents, actus |
| **Famille** | Inscription validée (rôle FAMILLE) | profil créé · enfants liés (`player_guardians`) · accès : photos des équipes des enfants, paiements, documents, planning |
| **Partenaire** | Partenariat accepté (rôle PARTENAIRE) | profil créé · espace partenaire · visibilité sponsor · stats · événements partenaires · com club |

### Mécanique technique (réutilise l'existant)
- Une table **`subscriptions`** (profile_id, type, scope [team_id/family_id/sponsor_id], status, granted_at).
- À la validation d'inscription / acceptation partenariat → **hook** qui : crée/active le profil (rôle déjà
  géré, **avec le garde-fou de sécurité** du correctif d'escalade), crée la `subscription`, et **initialise
  les `notification_preferences`** selon le type.
- Les « accès aux contenus » se résolvent dynamiquement via les tags Médiathèque + la chaîne
  famille→joueur→équipe (déjà utilisée par le fan-out).

---

## PHASE 5 — CRM intelligent (assistant)

Le CRM **propose** et **diffuse** automatiquement aux bonnes personnes. **Réutilise directement** le fan-out
`getTeamGuardianRecipients` / `getPlayersGuardianRecipients` déjà écrit.

| Événement | Le CRM propose / fait |
|---|---|
| Photo/vidéo ajoutée et **taggée « équipe X »** | détecte l'équipe → propose joueurs & familles concernés → publie/notifie (catégorie `media`) aux abonnés opt-in |
| Vidéo ajoutée | propose les abonnés concernés (mêmes tags) |
| Article publié avec **ciblage** (équipe/catégorie/tous) | envoie aux groupes concernés (catégorie `news`) |
| Convocation / séance | **déjà opérationnel** (catégorie `convocation`/`session`) |
| Paiement en retard | rappel automatique à la famille |

Pattern commun : **événement → résolution d'audience (tags + chaîne familiale) → file `notification_logs`
(in-app + email + push) en respectant les préférences** — exactement l'architecture déjà livrée, étendue aux
médias et aux actus.

---

## PHASE 6 — Dashboard 360°

Tableau de bord d'accueil, indicateurs visuels, **toutes données déjà disponibles en base** :

```
┌── PILOTAGE DU CLUB ──────────────────────────────────────────────┐
│  Licenciés 612   Familles 380   Équipes 30   Éducateurs 50        │
│  Paiements (mois) 8 240 €   Boutique (cmd) 24   Partenaires 12     │
├───────────────────────────────────────────────────────────────────┤
│  Abonnements actifs  ▇▇▇▇▇▇ 540        Médias publiés (30j)  86     │
│  Inscriptions à traiter ● 42   Messages non lus ● 7  Détections 5  │
├───────────────────────────────────────────────────────────────────┤
│  [Graphe paiements / mois]        [Répartition licenciés / cat.]   │
│  Derniers événements · Prochains matchs · Activité récente (logs)  │
└───────────────────────────────────────────────────────────────────┘
```
- Sources : `profiles`, `families`, `players`, `teams`, `payments`, `orders`, `partners`,
  `subscriptions`, `media_assets`, `notification_logs`, `recordActivity`.
- Indicateurs « à traiter » **réels** (remplacent les badges figés retirés).

---

## PHASE 7 — Plan de mise en œuvre

### A. Modules à FUSIONNER
- Médias + Galerie + Photos + Vidéos → **Médiathèque**.
- Messages + Emailing + Notifications + Réseaux → **Communication**.
- Joueurs/Encadrement/Direction/Familles → **modèle Personne unifié** (vues filtrées), sans casser les pages.

### B. Modules à CRÉER
Médiathèque · Abonnements · Communication/Emailing · Utilisateurs & Permissions (UI) · Automatisations
(moteur) · Événements · Espace partenaire (stats) · Dashboard 360 enrichi.

### C. Workflows automatiques (priorité)
1. Inscription validée → profil + rôle + abonnement + préférences (P0).
2. Média taggé équipe → notification familles concernées (P1).
3. Article ciblé → diffusion groupes (P1).
4. Partenariat accepté → espace partenaire + accès (P2).
5. Paiement en retard → rappel (P2).

### D. Plan de migration (non destructif d'abord)
1. **Regroupement de la sidebar par pôles** (repliable) — *0 risque, pur affichage*. **P0**.
2. Dashboard 360 (brancher les KPIs réels) — **P0**.
3. Médiathèque (nouvelle table `media_assets`+`media_tags`, migration de `MediaAdmin`) — **P1**.
4. Abonnements (`subscriptions` + hook inscription) — **P1**.
5. Communication/Emailing (provider) + Automatisations (moteur d'événements) — **P1/P2**.
6. Utilisateurs & Permissions (UI) + Événements + Espace partenaire — **P2**.
7. Consolidation modèle Personne — **P3** (refactor de fond).

### E. Plan de développement (estimations)
| Lot | Contenu | Effort |
|---|---|---|
| L1 | Sidebar par pôles + Dashboard 360 réel | 2-3 j |
| L2 | Médiathèque (assets, tags, albums, filtres) | 4-6 j |
| L3 | Abonnements + hooks d'inscription + accès contenus | 3-4 j |
| L4 | Communication : emailing (Brevo) + hub notifications/abonnés | 3-4 j |
| L5 | CRM intelligent : ciblage média/actu → diffusion auto | 3-4 j |
| L6 | Utilisateurs & Permissions (UI) + Journaux | 2-3 j |
| L7 | Événements + Espace partenaire (stats) | 3-4 j |
| L8 | Consolidation modèle Personne (refactor) | 4-6 j |

### F. Priorités recommandées
- **P0 (impact immédiat, faible risque)** : sidebar par pôles, Dashboard 360.
- **P1 (cœur de la plateforme)** : Médiathèque, Abonnements, Communication/Automatisations.
- **P2/P3** : Permissions UI, Événements, Espace partenaire, refactor Personne.

### G. Maquette — sidebar repliable par pôles
```
 ES Viry · CRM
 ─────────────
 🏠 Pilotage
 🟢 Club & contenus      ▸ Actualités · Médiathèque · Événements
 ⚽ Sportif              ▸ Équipes · Joueurs · Encadrement · Direction · Matchs · Détections · Planning
 👨‍👩‍👧 Familles            ▸ Familles · Inscriptions · Documents · Abonnements
 🤝 Partenaires          ▸ Sponsors · Demandes · Espace partenaire
 💶 Business             ▸ Boutique · Commandes · Finances · Campagnes
 📣 Communication        ▸ Messages · Notifications · Emailing · Réseaux
 ⚙️ Administration       ▸ Utilisateurs · Paramètres · Automatisations · Journaux
 ─────────────
 [Se déconnecter]
```

---

## Conclusion
La base technique est saine ; l'enjeu est **organisationnel et fonctionnel**. En commençant par les **P0
non destructifs** (regroupement par pôles + Dashboard 360), on obtient immédiatement une plateforme lisible,
puis on ajoute les briques différenciantes (Médiathèque, Abonnements, Communication, CRM intelligent) qui
**s'appuient sur le socle de notifications/fan-out déjà livré**. Résultat visé : **un CRM unique, centralisé,
moderne et intelligent**, prêt pour la montée en charge.
