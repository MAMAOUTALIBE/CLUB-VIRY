# Checkpoint de pause - ES Viry-Chatillon Football

Date : 2026-06-06

## Etat general

Le projet contient maintenant une base frontend premium et un backend Next.js/Supabase structure autour des modules club principaux.

Le dossier local n'est pas un depot Git initialise. Toutes les modifications sont enregistrees directement dans les fichiers du workspace.

## Frontend realise

- Header premium avec logo, navigation, reseaux sociaux colores et CTA.
- Hero accueil avec image de stade, statistiques visibles sans scroll, typographie ajustee.
- Page calendrier connectee a `/api/calendar` avec fallback propre si Supabase n'est pas configure.
- Verification visuelle desktop et mobile de `/calendrier`.

## Backend realise

- Cahier des charges backend dans `docs/backend-cahier-des-charges.md`.
- Documentation API dans `docs/backend-api.md`.
- Migrations Supabase :
  - fondations, roles, profils, saisons, categories, logs
  - familles, enfants, responsables
  - inscriptions, documents
  - equipes, staff, joueurs, matchs
  - actualites, medias, partenaires
  - detections, boutique, commandes, paiements
  - contact, notifications, dashboard, exports
  - calendrier evenements club
- Authentification :
  - inscription publique limitee aux roles non privilegies
  - login
  - refresh
  - reset password
  - profil connecte
- Espaces :
  - famille
  - educateur
  - admin
- Modules API :
  - inscriptions
  - documents upload + liens signes temporaires
  - equipes
  - matchs
  - calendrier
  - actualites
  - medias
  - partenaires
  - detections/recrutement
  - boutique
  - commandes
  - paiements
  - contact
  - notifications
  - dashboard admin
  - exports CSV
  - logs activite

## Derniers blocs valides

### Documents

- Route `GET /api/documents/[id]/signed-url`.
- Acces limite a la famille du dossier ou aux roles avec `documents:review`.
- Lien signe valable 10 minutes.
- `file_path` masque dans la reponse API.

### Inscriptions

- Notifications :
  - `registration_submitted`
  - `registration_received`
  - `registration_document_uploaded`
  - `registration_status_updated`
  - `registration_document_reviewed`
  - `registration_payment_received`
- Logs :
  - `registration.created`
  - `registration_document.uploaded`
  - `registration_document.signed_url_created`

### Boutique / Commandes

- Route membre `GET /api/orders/[id]`.
- Route admin `GET /api/admin/shop/orders/[id]`.
- Detail commande avec `order`, `items`, `payments`.
- Notification client `shop_order_status_updated`.

### Paiements

- Route admin `GET /api/admin/payments/[id]`.
- Checkout journalise avec `payment.checkout_created`.
- Notification admin `payment_checkout_created`.
- Synchronisation paiement vers commande :
  - `SUCCEEDED` -> `PAID`
  - `REFUNDED` -> `REFUNDED`
  - `CANCELLED` -> `CANCELLED`
- Notification client `payment_status_updated`.
- Log `shop.order.payment_status_synced`.

### Notifications

- Service central `src/lib/db/notifications.ts`.
- File `notification_logs`.
- Dispatcher admin `POST /api/admin/notifications/process`.
- Webhook configurable :
  - `NOTIFICATION_WEBHOOK_URL`
  - `NOTIFICATION_WEBHOOK_SECRET`

## Validation recente

Les validations ont ete executees apres les derniers blocs :

- `npm run typecheck` : OK
- `npm run test` : OK, 55 tests
- `npm run lint` : OK
- `npm run build` : OK

Smoke tests effectues :

- routes admin protegees sans token : `401 AUTH_REQUIRED`
- routes documents/commandes/paiements protegees sans token : `401 AUTH_REQUIRED`

## Etat environnement local

Supabase n'est pas configure localement :

- `NEXT_PUBLIC_SUPABASE_URL` vide
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` vide
- `SUPABASE_SERVICE_ROLE_KEY` vide

Les routes qui necessitent Supabase retournent donc normalement :

- `503 CONFIGURATION_ERROR`

## Prochaine reprise conseillee

1. Initialiser un depot Git si souhaite, pour faire un vrai commit de sauvegarde.
2. Configurer Supabase local/projet distant et appliquer les migrations.
3. Tester les flux reels avec donnees :
   - inscription famille
   - upload document
   - validation admin
   - commande boutique
   - paiement manuel
   - notification webhook
4. Continuer ensuite sur une des deux directions :
   - frontend admin/espace membre pour exploiter les nouvelles API
   - backend production : provider email reel, Stripe reel, seeds, fixtures, tests API plus profonds

