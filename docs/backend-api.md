# Documentation API Backend

Base URL locale : `http://localhost:3000`.

Toutes les reponses suivent le format :

```json
{ "ok": true, "data": {} }
```

ou :

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

## Sante backend

### `GET /api/backend/health`

Retourne l'etat de configuration Supabase et les roles connus.

## Authentification

### `POST /api/auth/register`

Inscription publique.

Roles autorises cote public :

- `MEMBRE`
- `FAMILLE`
- `JOUEUR`

Les roles privilegies comme `SUPER_ADMIN`, `ADMIN_CLUB`, `DIRIGEANT` et `EDUCATEUR` ne peuvent pas etre demandes via cette route.

Payload :

```json
{
  "email": "parent@example.com",
  "password": "Password123",
  "firstName": "Mamadou",
  "lastName": "Bah",
  "role": "FAMILLE"
}
```

### `POST /api/auth/login`

Connexion email / mot de passe via Supabase Auth.

Payload :

```json
{
  "email": "parent@example.com",
  "password": "Password123"
}
```

### `POST /api/auth/refresh`

Rafraichissement de session.

Payload :

```json
{
  "refreshToken": "..."
}
```

### `POST /api/auth/password-reset`

Demande de reinitialisation du mot de passe.

Payload :

```json
{
  "email": "parent@example.com"
}
```

## Utilisateur connecte

### `GET /api/me`

Necessite un header :

```txt
Authorization: Bearer <access_token>
```

Retourne l'utilisateur Supabase et le profil club si la cle service Supabase est configuree.

### `PATCH /api/me`

Met a jour le profil public du compte connecte.

Necessite :

```txt
Authorization: Bearer <access_token>
```

Payload :

```json
{
  "firstName": "Mamadou",
  "lastName": "Bah",
  "displayName": "Mamadou B.",
  "phone": "01 69 24 39 50",
  "avatarUrl": "https://example.com/avatar.jpg",
  "birthDate": "1989-03-12"
}
```

## Famille

### `GET /api/family`

Necessite un header :

```txt
Authorization: Bearer <access_token>
```

Retourne les familles rattachees au compte, les membres et les joueurs/enfants.

### `POST /api/family/children`

Ajoute un enfant/joueur au foyer connecte. Si `familyId` est absent, une famille est creee automatiquement pour le compte.

Payload :

```json
{
  "firstName": "Ibrahima",
  "lastName": "Diallo",
  "birthDate": "2013-04-21",
  "gender": "MASCULIN",
  "categoryId": "00000000-0000-4000-8000-000000000000"
}
```

## Inscriptions

### `GET /api/registrations`

Necessite un header :

```txt
Authorization: Bearer <access_token>
```

Retourne les dossiers d'inscription accessibles au foyer connecte.

### `POST /api/registrations`

Cree un dossier d'inscription pour un joueur rattache au foyer connecte.

Effets automatiques :

- notification admin `registration_submitted`
- notification famille `registration_received`
- log `activity_logs` `registration.created`

Payload minimal :

```json
{
  "playerId": "00000000-0000-4000-8000-000000000000"
}
```

Payload complet :

```json
{
  "playerId": "00000000-0000-4000-8000-000000000000",
  "seasonId": "00000000-0000-4000-8000-000000000001",
  "categoryId": "00000000-0000-4000-8000-000000000002",
  "notes": "Premiere inscription au club."
}
```

### `GET /api/registrations/[id]`

Retourne le dossier et ses documents attendus si le foyer connecte y a acces.

## Documents

### `POST /api/documents/upload`

Upload securise d'un document attendu pour un dossier d'inscription.

Effets automatiques :

- notification admin `registration_document_uploaded`
- log `activity_logs` `registration_document.uploaded`

Necessite un header :

```txt
Authorization: Bearer <access_token>
```

Format : `multipart/form-data`

Champs :

- `registrationId`
- `documentType`
- `file`

Contraintes :

- bucket prive : `club-documents`
- taille maximale : 8 Mo
- types autorises : PDF, JPEG, PNG, WEBP

### `GET /api/documents/[id]/signed-url`

Genere un lien temporaire pour consulter un document stocke dans le bucket prive `club-documents`.

Necessite :

```txt
Authorization: Bearer <access_token>
```

Acces autorise si :

- le compte appartient a la famille du dossier d'inscription
- ou le compte possede la permission `documents:review`

La reponse masque `document.file_path` et retourne un `signedUrl` valable 10 minutes.
Chaque generation est journalisee dans `activity_logs` avec l'action `registration_document.signed_url_created`.

## Equipes et matchs

### `GET /api/teams`

Retourne les equipes actives.

### `GET /api/teams/[slug]`

Retourne une equipe, son staff et ses matchs.

### `GET /api/matches?limit=20`

Retourne le calendrier des matchs. `limit` est borne a 50.

### `GET /api/calendar?from=2026-09-01T00:00:00.000Z&to=2026-09-30T23:59:59.999Z&limit=50`

Retourne les matchs et les evenements publics du club. `limit` est borne a 100.

## Espace educateur

Toutes les routes educateur necessitent :

```txt
Authorization: Bearer <access_token>
```

Les roles `EDUCATEUR` accedent uniquement aux equipes ou ils sont rattaches dans `team_staff`. Les roles `SUPER_ADMIN`, `ADMIN_CLUB` et `DIRIGEANT` peuvent gerer toutes les equipes via leur permission club.

### `GET /api/educator/teams`

Retourne les equipes accessibles au compte connecte, avec staff et matchs.

### `GET /api/educator/teams/[id]/players`

Retourne l'equipe, le staff, les matchs et les joueurs affectes a l'equipe.

### `POST /api/educator/matches`

Cree un match pour une equipe autorisee et journalise l'action.

Payload :

```json
{
  "teamId": "00000000-0000-4000-8000-000000000000",
  "opponentName": "Evry FC",
  "location": "HOME",
  "startsAt": "2026-09-01T15:00:00.000Z",
  "venue": "Stade Henri Longuet",
  "competition": "Championnat",
  "status": "SCHEDULED"
}
```

### `PATCH /api/educator/matches/[id]`

Met a jour un match autorise, score compris, et journalise l'action.

Payload :

```json
{
  "status": "FINISHED",
  "homeScore": 2,
  "awayScore": 1
}
```

## Contenu public

### `GET /api/news?limit=12`

Retourne les actualites publiees.

### `GET /api/news/[slug]`

Retourne une actualite publiee.

### `GET /api/media`

Retourne les albums et medias publics.

### `GET /api/partners`

Retourne les partenaires actifs.

### `POST /api/partners/requests`

Demande publique de partenariat.

Une notification admin `partnership_request_received` est creee en statut `QUEUED`.
Une entree `activity_logs` `partnership.request_created` est aussi journalisee.

Payload :

```json
{
  "companyName": "Sponsor Local",
  "contactName": "Mamadou Bah",
  "email": "contact@example.com",
  "phone": "01 69 24 39 50",
  "message": "Nous souhaitons devenir partenaire."
}
```

## Detections / recrutement

### `POST /api/recruitment/applications`

Demande publique de detection.

Une notification admin `recruitment_application_received` est creee en statut `QUEUED`.
Une entree `activity_logs` `recruitment.application_created` est aussi journalisee.

Payload :

```json
{
  "firstName": "Ibrahima",
  "lastName": "Diallo",
  "birthDate": "2010-03-14",
  "email": "joueur@example.com",
  "phone": "01 69 24 39 50",
  "currentClub": "Club actuel",
  "position": "Milieu",
  "message": "Je souhaite participer aux detections."
}
```

## Boutique

### `GET /api/products`

Retourne les categories, produits actifs et variantes actives.

### `GET /api/orders`

Retourne les commandes du compte connecte.

Necessite :

```txt
Authorization: Bearer <access_token>
```

### `GET /api/orders/[id]`

Retourne le detail d'une commande rattachee au compte connecte :

- commande
- lignes de commande
- paiements associes

Necessite :

```txt
Authorization: Bearer <access_token>
```

### `POST /api/orders`

Cree une commande boutique. Le token est optionnel : s'il est present et valide, la commande est rattachee au profil.

Deux notifications sont creees en statut `QUEUED` :

- `shop_order_received` pour l'administration
- `shop_order_confirmation` pour le client

Une entree `activity_logs` `shop.order_created` est aussi journalisee.

Payload :

```json
{
  "email": "client@example.com",
  "customerName": "Mamadou Bah",
  "phone": "01 69 24 39 50",
  "items": [
    {
      "productId": "00000000-0000-4000-8000-000000000000",
      "variantId": "00000000-0000-4000-8000-000000000001",
      "quantity": 2
    }
  ]
}
```

## Paiements

### `POST /api/payments/checkout`

Cree une intention de paiement interne en statut `PENDING`.

Stripe n'est pas branche a cette etape : la route renvoie `STRIPE_NOT_CONNECTED_YET` si `provider` vaut `stripe`, ou `MANUAL_PAYMENT_PENDING` en paiement manuel.

Effets automatiques :

- notification admin `payment_checkout_created`
- log `activity_logs` `payment.checkout_created`

Payload commande :

```json
{
  "orderId": "00000000-0000-4000-8000-000000000000",
  "provider": "manual"
}
```

Payload inscription :

```json
{
  "registrationId": "00000000-0000-4000-8000-000000000000",
  "amountCents": 18000,
  "provider": "manual"
}
```

## Contact

### `POST /api/contact-requests`

Message public envoye depuis la page contact.

Une notification admin `contact_message_received` est creee en statut `QUEUED`.
Une entree `activity_logs` `contact.message_created` est aussi journalisee.

Payload :

```json
{
  "fullName": "Mamadou Bah",
  "email": "contact@example.com",
  "phone": "01 69 24 39 50",
  "subject": "Inscription",
  "message": "Bonjour, je souhaite avoir des informations sur les inscriptions."
}
```

## Administration

Toutes les routes admin necessitent :

```txt
Authorization: Bearer <access_token>
```

Le compte doit avoir une permission compatible avec son role club.

### `GET /api/admin/dashboard`

Retourne les metriques principales, les derniers logs d'activite et le nombre de notifications en attente.

### `GET /api/admin/logs?limit=30`

Retourne les logs d'activite et les logs de notification. `limit` est borne a 100.

### `POST /api/admin/notifications/process?limit=20`

Traite les notifications en statut `QUEUED`. Permission : `admin:view_logs`.

Le traitement utilise un webhook configurable :

- `NOTIFICATION_WEBHOOK_URL` : URL appelee en `POST`
- `NOTIFICATION_WEBHOOK_SECRET` : secret optionnel envoye via `X-Notification-Secret`

Si aucun webhook n'est configure, les notifications restent en file et la route retourne `providerConfigured: false`.
Chaque traitement manuel est journalise dans `activity_logs` avec l'action `notifications.dispatch_processed`.

Payload envoye au webhook :

```json
{
  "id": "00000000-0000-4000-8000-000000000000",
  "recipientEmail": "contact@example.com",
  "recipientProfileId": null,
  "channel": "email",
  "template": "contact_message_received",
  "subject": "Nouveau message contact",
  "payload": {}
}
```

Le webhook peut retourner un JSON contenant `id`, `reference`, `messageId` ou `providerReference`; cette valeur sera stockee dans `notification_logs.provider_reference`.

### `PATCH /api/admin/notifications/[id]`

Met a jour le statut d'un log de notification. Permission : `admin:view_logs`.

Payload :

```json
{
  "status": "SENT",
  "providerReference": "email-provider-id",
  "sentAt": "2026-06-06T10:00:00.000Z"
}
```

### `GET /api/admin/users?role=FAMILLE&status=ACTIVE&limit=100`

Retourne les profils utilisateurs pour l'administration. Permission : `admin:manage_users`.

Filtres disponibles :

- `role` : `SUPER_ADMIN`, `ADMIN_CLUB`, `DIRIGEANT`, `EDUCATEUR`, `FAMILLE`, `JOUEUR`, `MEMBRE`, `PARTENAIRE`, `VISITEUR`
- `status` : `ACTIVE`, `PENDING`, `SUSPENDED`, `ARCHIVED`
- `limit` : borne a 500

### `PATCH /api/admin/users/[id]`

Met a jour un profil utilisateur et journalise l'action. Permission : `admin:manage_users`.

Payload :

```json
{
  "email": "dirigeant@example.com",
  "role": "DIRIGEANT",
  "status": "ACTIVE",
  "displayName": "Dirigeant Club",
  "phone": "01 69 24 39 50"
}
```

### `GET /api/admin/teams?limit=100`

Retourne toutes les equipes, actives ou archivees. Permission : `teams:manage`.

### `POST /api/admin/teams`

Cree une equipe et journalise l'action. Permission : `teams:manage`.

Payload :

```json
{
  "name": "Seniors R1",
  "slug": "seniors-r1",
  "gender": "MASCULIN",
  "level": "R1",
  "ageRange": "Seniors",
  "orderIndex": 1,
  "isActive": true
}
```

### `PATCH /api/admin/teams/[id]`

Met a jour une equipe et journalise l'action. Permission : `teams:manage`.

### `GET /api/admin/calendar/events?limit=100`

Retourne les evenements club pour l'administration. Permission : `matches:manage`.

Filtres disponibles :

- `from` : date ISO de debut
- `to` : date ISO de fin
- `limit` : borne a 500

### `POST /api/admin/calendar/events`

Cree un evenement club et journalise l'action. Permission : `matches:manage`.

Payload :

```json
{
  "teamId": "00000000-0000-4000-8000-000000000000",
  "title": "Forum des associations",
  "type": "CLUB_EVENT",
  "startsAt": "2026-09-05T10:00:00.000Z",
  "endsAt": "2026-09-05T16:00:00.000Z",
  "venue": "Stade Henri Longuet",
  "description": "Evenement officiel du club.",
  "visibility": "PUBLIC",
  "isFeatured": true
}
```

### `PATCH /api/admin/calendar/events/[id]`

Met a jour un evenement club et journalise l'action. Permission : `matches:manage`.

### `GET /api/admin/teams/[id]/staff`

Retourne le staff rattache a une equipe. Permission : `teams:manage`.

### `POST /api/admin/teams/[id]/staff`

Ajoute un membre du staff a une equipe et journalise l'action. Permission : `teams:manage`.

Payload :

```json
{
  "profileId": "00000000-0000-4000-8000-000000000000",
  "displayName": "Coach Principal",
  "roleTitle": "Entraineur principal",
  "isHeadCoach": true
}
```

### `GET /api/admin/teams/[id]/players`

Retourne les joueurs affectes a une equipe. Permission : `teams:manage`.

### `POST /api/admin/teams/[id]/players`

Affecte un joueur a une equipe ou met a jour son affectation. Permission : `teams:manage`.

Payload :

```json
{
  "playerId": "00000000-0000-4000-8000-000000000000",
  "position": "Milieu",
  "shirtNumber": 10
}
```

### `GET /api/admin/shop?limit=100`

Retourne categories, produits et variantes, y compris brouillons et archives. Permission : `shop:manage`.

### `POST /api/admin/shop/categories`

Cree une categorie boutique et journalise l'action. Permission : `shop:manage`.

Payload :

```json
{
  "name": "Textile",
  "slug": "textile",
  "orderIndex": 1,
  "isActive": true
}
```

### `PATCH /api/admin/shop/categories/[id]`

Met a jour une categorie boutique et journalise l'action. Permission : `shop:manage`.

### `POST /api/admin/shop/products`

Cree un produit boutique et journalise l'action. Permission : `shop:manage`.

Payload :

```json
{
  "categoryId": "00000000-0000-4000-8000-000000000000",
  "name": "Maillot domicile",
  "slug": "maillot-domicile",
  "description": "Maillot officiel du club.",
  "imageUrl": "https://example.com/maillot.jpg",
  "status": "ACTIVE",
  "priceCents": 4500,
  "currency": "EUR",
  "orderIndex": 1
}
```

### `PATCH /api/admin/shop/products/[id]`

Met a jour un produit boutique et journalise l'action. Permission : `shop:manage`.

### `POST /api/admin/shop/products/[id]/variants`

Cree une variante produit et journalise l'action. Permission : `shop:manage`.

Payload :

```json
{
  "label": "Taille M",
  "sku": "MAILLOT-DOM-M",
  "stockQuantity": 12,
  "priceDeltaCents": 0,
  "isActive": true
}
```

### `PATCH /api/admin/shop/variants/[id]`

Met a jour une variante produit et journalise l'action. Permission : `shop:manage`.

### `GET /api/admin/shop/orders?limit=100`

Retourne les commandes boutique pour l'administration. Permission : `shop:manage`.

### `GET /api/admin/shop/orders/[id]`

Retourne le detail complet d'une commande boutique pour l'administration :

- commande
- lignes de commande
- paiements associes

Permission : `shop:manage`.

### `PATCH /api/admin/shop/orders/[id]`

Met a jour le statut d'une commande et journalise l'action. Permission : `shop:manage`.
Une notification client `shop_order_status_updated` est creee en statut `QUEUED`.

Payload :

```json
{
  "status": "PREPARING"
}
```

### `GET /api/admin/payments?limit=100`

Retourne les paiements pour l'administration. Permission : `payments:manage`.

### `GET /api/admin/payments/[id]`

Retourne un paiement precis pour l'administration. Permission : `payments:manage`.

### `PATCH /api/admin/payments/[id]`

Met a jour un paiement interne et journalise l'action. Permission : `payments:manage`.

Synchronisations automatiques :

- si le paiement d'une commande passe `SUCCEEDED`, la commande passe `PAID`
- si le paiement d'une commande passe `REFUNDED`, la commande passe `REFUNDED`
- si le paiement d'une commande passe `CANCELLED`, la commande passe `CANCELLED`
- une notification client `payment_status_updated` est creee pour les commandes synchronisees
- une notification famille `registration_payment_received` est creee quand un paiement d'inscription passe `SUCCEEDED`

Payload :

```json
{
  "status": "SUCCEEDED",
  "providerReference": "manual-2026-0001",
  "metadata": {
    "source": "admin"
  }
}
```

### `GET /api/admin/recruitment/applications?limit=100`

Retourne les candidatures de detection pour l'administration. Permission : `players:manage`.

### `PATCH /api/admin/recruitment/applications/[id]`

Met a jour le statut d'une candidature de detection et journalise l'action. Permission : `players:manage`.

Payload :

```json
{
  "status": "TRIAL_SCHEDULED"
}
```

### `GET /api/admin/contact-requests?limit=100`

Retourne les messages envoyes depuis la page contact. Permission : `admin:access`.

### `PATCH /api/admin/contact-requests/[id]`

Met a jour le statut, le responsable ou la date de reponse d'un message contact, puis journalise l'action. Permission : `admin:access`.

Payload :

```json
{
  "status": "CONTACTED",
  "assignedTo": "00000000-0000-4000-8000-000000000000",
  "respondedAt": "2026-06-06T10:00:00.000Z"
}
```

### `GET /api/admin/exports/registrations?limit=1000`

Retourne un export CSV des dossiers d'inscription. `limit` est borne a 5000.

### `GET /api/admin/exports/orders?limit=1000`

Retourne un export CSV des commandes boutique. Permission : `shop:manage`. `limit` est borne a 5000.

### `GET /api/admin/exports/payments?limit=1000`

Retourne un export CSV des paiements. Permission : `payments:manage`. `limit` est borne a 5000.

### `GET /api/admin/exports/contact-requests?limit=1000`

Retourne un export CSV des messages contact. Permission : `admin:access`. `limit` est borne a 5000.

### `GET /api/admin/exports/recruitment?limit=1000`

Retourne un export CSV des candidatures de detection. Permission : `players:manage`. `limit` est borne a 5000.

### `GET /api/admin/registrations?status=SUBMITTED&limit=100`

Retourne les dossiers d'inscription pour l'administration. Permission : `registrations:manage`.

### `GET /api/admin/registrations/[id]`

Retourne un dossier et ses documents attendus. Permission : `registrations:manage`.

### `PATCH /api/admin/registrations/[id]`

Met a jour le statut, la categorie ou les notes admin d'un dossier, puis journalise l'action. Permission : `registrations:manage`.

Si le statut change, une notification famille `registration_status_updated` est creee en statut `QUEUED`.

Payload :

```json
{
  "status": "VALIDATED",
  "adminNotes": "Dossier complet.",
  "categoryId": "00000000-0000-4000-8000-000000000000"
}
```

### `PATCH /api/admin/registration-documents/[id]`

Valide ou refuse un document d'inscription, puis journalise l'action. Permission : `documents:review`.

Si le statut change, une notification famille `registration_document_reviewed` est creee en statut `QUEUED`.

Payload validation :

```json
{
  "status": "VALIDATED"
}
```

Payload refus :

```json
{
  "status": "REJECTED",
  "rejectionReason": "Document illisible."
}
```

### `GET /api/admin/news?limit=50`

Retourne les actualites, y compris brouillons et archives. Permission : `content:manage`.

### `POST /api/admin/news`

Cree une actualite et journalise l'action dans `activity_logs`. Permission : `content:manage`.

Payload :

```json
{
  "title": "Victoire des Seniors R1",
  "slug": "victoire-seniors-r1",
  "excerpt": "Un match maitrise de bout en bout.",
  "content": "Contenu complet de l'actualite officielle du club.",
  "status": "PUBLISHED",
  "publishedAt": "2026-06-06T10:00:00.000Z"
}
```

### `PATCH /api/admin/news/[id]`

Met a jour une actualite et journalise l'action. Permission : `content:manage`.

### `GET /api/admin/media?limit=100`

Retourne les albums et medias, y compris brouillons et archives. Permission : `content:manage`.

### `POST /api/admin/media/albums`

Cree un album media et journalise l'action. Permission : `content:manage`.

Payload :

```json
{
  "title": "Photos Seniors",
  "slug": "photos-seniors",
  "description": "Album officiel du match.",
  "status": "PUBLISHED",
  "publishedAt": "2026-06-06T10:00:00.000Z"
}
```

### `PATCH /api/admin/media/albums/[id]`

Met a jour un album media et journalise l'action. Permission : `content:manage`.

### `POST /api/admin/media/assets`

Ajoute une photo ou video a la mediatheque et journalise l'action. Permission : `content:manage`.

Payload :

```json
{
  "albumId": "00000000-0000-4000-8000-000000000000",
  "type": "PHOTO",
  "title": "Photo equipe",
  "url": "https://example.com/photo.jpg",
  "thumbnailUrl": "https://example.com/photo-thumb.jpg",
  "altText": "Equipe Seniors R1",
  "isFeatured": true,
  "publishedAt": "2026-06-06T10:00:00.000Z"
}
```

### `PATCH /api/admin/media/assets/[id]`

Met a jour une photo ou video et journalise l'action. Permission : `content:manage`.

### `GET /api/admin/partners?limit=100`

Retourne les partenaires, actifs ou archives. Permission : `partners:manage`.

### `POST /api/admin/partners`

Cree un partenaire et journalise l'action. Permission : `partners:manage`.

Payload :

```json
{
  "name": "Partenaire Local",
  "slug": "partenaire-local",
  "logoUrl": "https://example.com/logo.png",
  "websiteUrl": "https://example.com",
  "tier": "Or",
  "description": "Partenaire officiel du club.",
  "orderIndex": 1,
  "isActive": true
}
```

### `PATCH /api/admin/partners/[id]`

Met a jour un partenaire et journalise l'action. Permission : `partners:manage`.

### `GET /api/admin/partners/requests?limit=100`

Retourne les demandes de partenariat. Permission : `partners:manage`.

### `PATCH /api/admin/partners/requests/[id]`

Change le statut d'une demande de partenariat et journalise l'action. Permission : `partners:manage`.

Payload :

```json
{
  "status": "CONTACTED"
}
```

### `GET /api/admin/matches?limit=50`

Retourne les matchs pour l'administration. Permission : `matches:manage`.

### `POST /api/admin/matches`

Cree un match et journalise l'action. Permission : `matches:manage`.

Payload :

```json
{
  "teamId": "00000000-0000-4000-8000-000000000000",
  "opponentName": "Evry FC",
  "location": "HOME",
  "startsAt": "2026-09-01T15:00:00.000Z",
  "venue": "Stade Henri Longuet",
  "competition": "Championnat",
  "status": "SCHEDULED"
}
```

### `PATCH /api/admin/matches/[id]`

Met a jour un match, score compris, et journalise l'action. Permission : `matches:manage`.
