# Rapport d'audit global & corrections — ES Viry-Châtillon Football

**Date** : 2026-06-13
**Méthode** : task-force de 13 agents spécialisés en parallèle (architecture, routes, API, BDD/RLS,
sécurité, CRM, formulaires, UX, UI/responsive, performance, SEO, accessibilité, notifications), audit
read-only du code réel, puis correction autonome et vérification.

---

## 1. État avant / après

| | Avant | Après |
|---|---|---|
| Build de production | ✅ vert | ✅ vert |
| Typecheck / Lint / Tests | ✅ / ✅ / 61 ✅ | ✅ / ✅ / 61 ✅ |
| **Faille d'escalade de privilèges** | ❌ exploitable (SUPER_ADMIN via signup public) | ✅ **corrigée et vérifiée** |
| Espace famille | ❌ placeholder « Bientôt disponible » | ✅ **fonctionnel** (login, licenciés, notifications, préférences, déconnexion) |
| Notifications familles | ❌ inexistant côté UI | ✅ **feed + préférences + déclencheurs** (séances/convocations), validé E2E |
| Déconnexion CRM | ❌ aucune | ✅ route + bouton |
| Liens actus accueil | ❌ pointaient tous vers la liste | ✅ liens profonds article |
| Sitemap | ❌ 6 pages manquantes + pages privées indexées | ✅ complet, privées exclues, articles/équipes inclus |

## 2. Findings de l'audit (70 au total)

| Sévérité | Nombre |
|---|---|
| CRITIQUE | 1 |
| MAJEUR | 21 |
| MOYEN | 29 |
| MINEUR | 19 |

## 3. Corrections effectuées (vérifiées)

1. **[CRITIQUE] Escalade de privilèges à l'inscription** — le trigger `handle_new_auth_user()` recopiait
   `raw_user_meta_data->>'role'` (contrôlé par le client) dans `profiles.role` avec `status='ACTIVE'`.
   → Migration `20260613150000_fix_auth_role_escalation.sql` : l'auto-attribution est limitée aux rôles
   publics (FAMILLE/JOUEUR/MEMBRE) ; tout autre rôle → MEMBRE. **Vérifié** : un signup public
   `role=SUPER_ADMIN` reçoit désormais MEMBRE.
2. **[Sécurité — MAJEUR#19] Route publique fuyante** — `/api/teams/[slug]` (sans auth, orpheline)
   exposait `profile_id`, `notes`, `season_id` via `select *`. → **Supprimée** (la page équipe utilise
   déjà `getPublicTeamBySlug`, PII-safe).
3. **[MAJEUR#1 & #13] Espace famille fonctionnel** — `/espace-membre` placeholder → composant
   `MemberSpace` : connexion (+ « mot de passe oublié »), liste des licenciés, **feed de notifications**
   (badge non-lus, marquer comme lu), **préférences** (email/push par catégorie), déconnexion.
4. **[MAJEUR#5] Déconnexion** — route `POST /api/auth/logout` (purge des cookies `admin_session`/
   `admin_refresh`) + bouton dans la sidebar admin et dans l'espace famille.
5. **[MAJEUR#11] Double `<h1>`** — titre de marque de la sidebar admin rétrogradé en `<p>` (un seul h1/page).
6. **[Données démo] Badges chiffrés factices** (Inscriptions 42 / Finances 8 / Partenaires 3) retirés de la sidebar.
7. **[MAJEUR#16] Sur-notification des convocations** — `setMatchCallupsForEducator` ne notifie plus que
   les joueurs **nouvellement** convoqués (diff avec l'état en base), au lieu de tous à chaque enregistrement.
8. **[MAJEUR#3] Liens des actualités de l'accueil** — « Lire l'article » et les cartes pointent désormais
   vers `/actualites/<slug>` (article réel) au lieu de la liste générique.
9. **[MAJEUR#10] Sitemap** — réécrit : +6 pages statiques manquantes, pages privées (`/admin`,
   `/espace-membre`, `/espace-educateur`) **exclues**, et génération dynamique des articles + équipes.
10. **Feature notifications familles (L0/L1/L4)** livrée de bout en bout : migration
    `20260613140000_family_notifications` (préférences + push_subscriptions + extension de la file),
    fan-out via `player_guardians`, APIs `/api/family/notifications(+/preferences)`, déclencheurs sur
    séances (création/annulation) et convocations. **Validé E2E** (séance créée → notification reçue).

## 4. Reste à traiter (priorisé, avec estimations)

> Aucun n'est bloquant pour un déploiement ; ce sont des améliorations fonctionnelles/qualité.

| # | Sujet | Sévérité | Effort |
|---|---|---|---|
| MAJEUR#7 | CRM Messages/Détections/Partenariats en lecture seule → ajouter les actions de statut (les API PATCH existent) | MAJEUR | ~0,5 j |
| MAJEUR#8 | Formulaire de demande de partenariat (l'API existe) | MAJEUR | ~0,5 j |
| MAJEUR#6 | Accueil non branché au CRM (matchs/équipes/partenaires en dur → getters dynamiques) | MAJEUR | ~0,5 j |
| MAJEUR#2 | 15 descriptions SEO < 120 caractères à allonger | MAJEUR | ~0,5 j |
| MAJEUR#15 | Page article : sur-fetch (×2, 50 lignes) → `getPublishedNewsBySlug` + `cache()` | MAJEUR | ~0,25 j |
| MAJEUR#18 | Flux de refresh de session mort (route lit le body au lieu du cookie ; pas de déclencheur client) | MAJEUR | ~0,5 j |
| MAJEUR#4/#17 | Boutique sans tunnel d'achat — **décision produit** : vitrine assumée OU e-commerce (~3-5 j) | MAJEUR | décision |
| MAJEUR#21 | `force-dynamic` sur 12 pages vitrine → `revalidate` + `revalidatePath` dans les mutations admin | MAJEUR | ~1 j |
| MAJEUR#9/#12 | Tokens de couleur CSS morts / double source de navigation (plan-du-site périmé) | MAJEUR | ~0,5 j |
| MOYEN (29) | SEO (SportsEvent JSON-LD, sameAs, GPS stade), perf (over-fetch), a11y (boutons icônes CRM), UI (chips boutique non fonctionnelles), liens sociaux vides sur /calendrier | MOYEN | ~2-3 j |
| MINEUR (19) | Polish UI/copies/contrastes | MINEUR | ~1-2 j |

### Non-bugs (décisions assumées)
- **MAJEUR#20 « Espace éducateur non lié dans la navigation »** : c'est **volontaire** (demande explicite :
  l'espace éducateur ne doit pas apparaître sur le frontend public, accès CRM uniquement). **À ne pas « corriger ».**

## 5. Migrations à appliquer en production

À appliquer via `supabase migration up` au déploiement (dans l'ordre) :
1. `20260612120000`/`20260612160000`/`20260612180000`/`20260612190000` — encadrement/équipes V2 (déjà prévues)
2. `20260613120000_public_educators` — annuaire éducateurs
3. `20260613130000_club_officials` — bureau & dirigeants
4. `20260613140000_family_notifications` — notifications familles
5. **`20260613150000_fix_auth_role_escalation` — correctif de sécurité (PRIORITAIRE)**

## 6. Niveau de préparation au déploiement

- **Bloquant prod résolu** : la seule faille critique (escalade de privilèges) est corrigée et vérifiée.
- **Socle technique** : build/typecheck/lint/tests verts ; infra Docker + Traefik déjà prête (cf. mémoire projet).
- **Parcours clés** : espace famille + notifications désormais fonctionnels ; CRM, espace éducateur et
  parcours publics (contact/inscription/détection) opérationnels.
- **Recommandation** : déployable après application des migrations. Traiter ensuite le backlog MAJEUR
  (CRM actionnable, accueil dynamique, décision boutique, caching) pour atteindre le niveau « premium »
  complet.
