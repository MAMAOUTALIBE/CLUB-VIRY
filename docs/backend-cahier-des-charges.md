# Cahier des charges backend - ES Viry-Chatillon Football

## 1. Analyse du besoin

Le frontend actuel est un site officiel Next.js App Router avec pages publiques, espaces admin/membre/educateur, boutique, inscriptions, detections, medias, equipes, actualites, calendrier, partenaires et contact. Les donnees sont actuellement statiques dans `src/lib/data.ts`. Le projet contient deja une preparation Supabase via variables d'environnement et `src/lib/supabase.ts`, mais aucun backend metier complet n'est encore implemente.

Le besoin backend est de transformer ce site vitrine en plateforme administrable pour un club de football :
- publier et maintenir les contenus officiels ;
- gerer les inscriptions, familles, joueurs, educateurs et equipes ;
- gerer les matchs, calendriers, actualites, medias et partenaires ;
- gerer boutique, commandes, paiements, recus et factures ;
- proteger les donnees personnelles et documents sensibles ;
- fournir des workflows administratifs clairs avec roles, logs et exports.

## 2. Modules necessaires

1. Authentification et autorisation
2. Utilisateurs, profils, familles et responsables legaux
3. Inscriptions et dossiers joueurs
4. Documents et stockage securise
5. Equipes, categories, joueurs, staff et affectations
6. Matchs, calendriers, scores et competitions
7. Actualites et CMS editorial
8. Medias, albums, photos et videos
9. Detections et recrutement
10. Partenaires et sponsoring
11. Boutique, produits, stocks, paniers et commandes
12. Paiements, cotisations, recus, factures et historique
13. Notifications email
14. Administration, logs, statistiques et exports
15. API publique et API admin

## 3. Roles utilisateurs

- `SUPER_ADMIN` : acces total, gestion des roles, parametres systeme, logs, exports, suppression critique.
- `ADMIN_CLUB` : gestion club complete hors operations systeme sensibles.
- `DIRIGEANT` : lecture avancee, validation dossiers, suivi equipes, stats, partenaires.
- `EDUCATEUR` : gestion de ses equipes, joueurs affectes, convocations, matchs, documents autorises.
- `FAMILLE` : gestion foyer, enfants, inscriptions, documents, paiements, suivi dossier.
- `JOUEUR` : profil personnel, calendrier, equipe, documents visibles, informations sportives.
- `MEMBRE` : compte simple, acces espace membre, commandes, informations personnelles.
- `PARTENAIRE` : profil partenaire, logo, contrat, visibilite, demande de partenariat.
- `VISITEUR` : acces public uniquement.

## 4. Parcours utilisateurs

- Visiteur consulte accueil, equipes, actualites, calendrier, medias, boutique, contact.
- Famille cree un compte, ajoute un enfant, demarre une inscription, depose documents, paie, suit le statut.
- Admin valide un dossier, affecte une categorie, demande correction, exporte les listes.
- Educateur consulte son effectif, met a jour informations sportives, cree convocations/matchs.
- Dirigeant suit les statistiques club, inscriptions, paiements, partenaires et activite.
- Partenaire fait une demande ou met a jour ses informations et logo.
- Boutique : utilisateur ajoute produit, choisit taille, paie, suit commande.

## 5. Architecture technique proposee

### Choix recommande

Conserver Next.js comme application principale et utiliser Supabase comme backend-as-a-service structure :
- PostgreSQL pour les donnees ;
- Supabase Auth pour authentification ;
- Row Level Security pour securite par role ;
- Supabase Storage pour documents et medias ;
- Edge Functions ou Next.js Route Handlers pour operations sensibles ;
- Stripe pour paiements ;
- Resend ou Brevo pour emails transactionnels.

Ce choix est coherent avec le repo actuel : dependance `@supabase/supabase-js`, `.env.example` deja prepare, frontend Next.js statique pret a connecter.

### Structure de dossiers cible

```txt
src/
  app/
    api/
      auth/
      registrations/
      documents/
      teams/
      matches/
      news/
      media/
      recruitment/
      shop/
      payments/
      partners/
      admin/
  lib/
    auth/
    db/
    validations/
    services/
    emails/
    payments/
    storage/
    security/
supabase/
  migrations/
  seed.sql
docs/
  backend-cahier-des-charges.md
  api.md
```

## 6. Modele de base de donnees

Tables principales :

- `profiles` : user_id, role, first_name, last_name, phone, birth_date, avatar_url, status.
- `families` : id, main_contact_id, address, emergency_contact, notes.
- `family_members` : family_id, profile_id, relationship.
- `players` : profile_id, family_id, license_number, category_id, medical_status.
- `legal_guardians` : family_id, first_name, last_name, phone, email, relationship.
- `seasons` : name, start_date, end_date, active.
- `categories` : name, age_range, gender, order_index.
- `teams` : category_id, season_id, name, level, description, image_url.
- `team_staff` : team_id, profile_id, role.
- `team_players` : team_id, player_id, season_id, status.
- `registrations` : player_id, season_id, category_id, status, submitted_at, validated_at.
- `registration_steps` : registration_id, step_key, status, notes.
- `documents` : owner_id, registration_id, type, file_path, status, uploaded_at, reviewed_by.
- `matches` : team_id, season_id, opponent, date, time, venue, home_away, score_for, score_against, status.
- `events` : title, type, starts_at, ends_at, venue, team_id, visibility.
- `news_posts` : title, slug, excerpt, content, category, cover_url, status, published_at, seo_title.
- `media_albums` : title, slug, category, visibility.
- `media_assets` : album_id, type, url, thumbnail_url, caption, order_index.
- `recruitment_applications` : player_name, birth_date, position, current_club, category_id, status, notes.
- `partners` : name, logo_url, website, pack, status, display_order.
- `sponsorship_requests` : company, contact_name, email, phone, message, status.
- `products` : name, slug, description, price_cents, category, active.
- `product_variants` : product_id, size, color, sku, stock.
- `carts` : user_id, status.
- `cart_items` : cart_id, product_variant_id, quantity.
- `orders` : user_id, status, total_cents, payment_status, stripe_session_id.
- `order_items` : order_id, product_variant_id, quantity, unit_price_cents.
- `payments` : user_id, order_id, registration_id, amount_cents, provider, status, receipt_url.
- `notifications` : user_id, type, title, payload, read_at.
- `activity_logs` : actor_id, action, entity_type, entity_id, metadata, created_at.

## 7. API necessaires

API publique :
- `GET /api/news`
- `GET /api/news/[slug]`
- `GET /api/teams`
- `GET /api/teams/[slug]`
- `GET /api/matches`
- `GET /api/calendar`
- `GET /api/media`
- `GET /api/partners`
- `GET /api/products`

API utilisateur :
- `GET /api/me`
- `PATCH /api/me`
- `GET /api/family`
- `POST /api/family/children`
- `POST /api/registrations`
- `GET /api/registrations/[id]`
- `POST /api/documents/upload`
- `GET /api/orders`
- `POST /api/payments/checkout`

API educateur :
- `GET /api/educator/teams`
- `GET /api/educator/teams/[id]/players`
- `POST /api/educator/matches`
- `PATCH /api/educator/matches/[id]`

API admin :
- CRUD actualites, equipes, joueurs, inscriptions, documents, matchs, medias, partenaires, produits.
- `GET /api/admin/dashboard`
- `GET /api/admin/logs`
- `GET /api/admin/exports/*`

## 8. Securite

- RLS obligatoire sur toutes les tables sensibles.
- Verification de role cote serveur avant mutation.
- Donnees personnelles jamais exposees via API publique.
- Documents stockes en buckets prives avec URL signee temporaire.
- Validation Zod de tous les payloads.
- Rate limiting sur auth, contact, detections, uploads et paiements.
- Protection CSRF pour actions sensibles si cookies de session.
- Logs d'activite sur actions admin.
- Soft delete pour entites critiques.
- Audit RGPD : consentement, droit export/suppression, duree conservation documents.

## 9. Gestion des fichiers

Buckets recommandes :
- `documents-private` : certificats, pieces identite, autorisations parentales.
- `media-public` : photos, videos publiques, logos partenaires.
- `shop-public` : images produits.

Regles :
- fichiers documents : prives, scans antivirus si possible, taille limite, types MIME stricts.
- medias publics : optimisation image, thumbnails, ordre d'affichage.
- suppression logique avec trace admin.

## 10. Paiements

Provider recommande : Stripe.

Paiements couverts :
- cotisation inscription ;
- boutique ;
- dons optionnels ;
- packs partenaires si besoin.

Backend :
- creation Checkout Session cote serveur ;
- webhook Stripe signe ;
- mise a jour `payments`, `orders`, `registrations` ;
- generation recu/facture ;
- historique visible famille/admin.

## 11. Emails et notifications

Provider recommande : Resend ou Brevo.

Emails :
- verification email ;
- dossier inscription recu ;
- document refuse / a corriger ;
- inscription validee ;
- paiement recu ;
- commande confirmee ;
- demande partenaire recue ;
- notification admin.

Templates versionnes dans `src/lib/emails/templates`.

## 12. Performance

- Pagination obligatoire sur listes admin.
- Index PostgreSQL sur `status`, `season_id`, `team_id`, `published_at`, `created_at`.
- Cache public court pour news/equipes/matchs.
- Images optimisees et thumbnails.
- API admin sans N+1 queries.
- Exports CSV asynchrones si volume important.

## 13. Scalabilite

- Architecture modulaire par domaine.
- Separation API publique / API admin.
- Tables relationnelles normalisees.
- Webhooks idempotents.
- Logs et monitoring.
- Possibilite future d'ajouter convocations, messagerie equipe, licences FFF, comptabilite.

## 14. Tests

Tests unitaires :
- validations ;
- services metier ;
- permissions ;
- calculs paiement.

Tests integration :
- auth ;
- inscriptions ;
- documents ;
- paiements webhooks ;
- CRUD admin.

Tests E2E :
- parcours famille inscription + paiement ;
- parcours admin validation dossier ;
- parcours educateur gestion equipe ;
- boutique commande.

## 15. Deploiement

Environnements :
- local ;
- staging ;
- production.

Deploiement recommande :
- Vercel pour Next.js ;
- Supabase projet staging/prod ;
- Stripe test/live ;
- monitoring Vercel + Supabase logs ;
- sauvegardes database planifiees.

Checklist production :
- RLS active ;
- variables env configurees ;
- webhooks Stripe signes ;
- buckets prives verifies ;
- emails domaine valide ;
- tests critiques OK ;
- backup policy OK.

## 16. Planning d'execution module par module

Phase 1 - Fondations
1. Installer structure backend, validations, types, helpers auth.
2. Creer migrations Supabase : roles, profils, saisons, categories.
3. Mettre en place RLS et permissions.

Phase 2 - Auth et espaces
4. Auth inscription/connexion/session.
5. Espace membre/famille.
6. Espace educateur.
7. Espace admin.

Phase 3 - Inscriptions
8. Familles, enfants, responsables legaux.
9. Dossiers inscription, statuts, validation admin.
10. Upload documents securises.

Phase 4 - Sport
11. Equipes, categories, staff, joueurs.
12. Matchs, calendrier, scores.

Phase 5 - Contenus
13. Actualites CMS.
14. Medias et albums.
15. Partenaires.
16. Detections.

Phase 6 - Commerce
17. Produits, variants, stocks.
18. Commandes.
19. Paiements Stripe et webhooks.

Phase 7 - Administration avancee
20. Dashboard admin.
21. Logs activite.
22. Exports CSV.
23. Documentation API.

## 17. Regles de developpement module par module

Pour chaque module :
1. modele de donnees ;
2. migration ;
3. RLS ;
4. schemas validation ;
5. services metier ;
6. routes API ;
7. integration frontend minimale ;
8. tests ;
9. verification build/lint/typecheck.

## 18. Premiere implementation recommandee

Commencer par les fondations :
- types de roles ;
- table `profiles` ;
- table `seasons` ;
- table `categories` ;
- table `activity_logs` ;
- helpers d'autorisation ;
- middleware de protection des espaces.

Ensuite connecter :
- `/espace-membre` ;
- `/espace-educateur` ;
- `/admin`.
