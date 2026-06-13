# Cahier des charges — Abonnement & notifications de l'espace Parent / Famille

**Projet** : ES Viry-Châtillon Football — site officiel (Next.js 16 + Supabase)
**Document** : spécifications fonctionnelles & techniques + plan de développement
**Date** : 2026-06-13
**Statut** : validé pour cadrage (canaux & priorités arbitrés)

---

## 1. Contexte & objectif

Les familles disposent d'un **espace membre** (`/espace-membre`) mais reçoivent aujourd'hui **aucune notification automatique**. L'objectif est de mettre en place un **canal de communication club → familles** permettant à un parent d'être prévenu, selon ses préférences, des :

- **Convocations de match** de son enfant ;
- **Séances d'entraînement** (création, modification, annulation) ;
- **Nouvelles photos / médias** de l'équipe ;
- **Actualités & informations** du club ;
- Événements (tournois, réunions, échéances).

**Contrainte structurante : plan économique (~0 €/mois)** — on s'appuie au maximum sur l'infrastructure existante et sur des canaux gratuits / *free tier*.

### Ce qui existe déjà (à réutiliser — pas de recodage)

| Brique | Détail |
|---|---|
| File de notifications | Table `notification_logs` (`recipient_profile_id`, `recipient_email`, `channel`, `template`, `subject`, `payload` jsonb, `status` QUEUED/SENT/FAILED/CANCELLED, `provider_reference`, `sent_at`) |
| Dispatch | `src/lib/db/notifications.ts` : `queueNotification()`, `dispatchQueuedNotifications()`, `listQueuedNotifications()` + endpoint `/api/admin/notifications/process` |
| Relais | `NOTIFICATION_WEBHOOK_URL` (Make/Zapier/Discord) |
| Ciblage | Chaîne **famille → parent → joueur → équipe** : `families`, `family_members`, `players`, `player_guardians` → on sait exactement quels parents prévenir pour une convocation / séance |
| Sources de données | `match_callups` (convocations), `training_sessions` (séances), `news`, médias |

### Ce qui manque (objet de ce CDC)

1. Un système d'**abonnement / préférences** (opt-in par catégorie × canal, RGPD).
2. Les **canaux de diffusion réels** : feed in-app, **email** (envoi direct), **web push** (PWA).
3. Les **déclencheurs métier** (convocation/séance → mise en file ciblée).
4. La **galerie privée** familles + notification « nouvelles photos ».

---

## 2. Décisions de cadrage (arbitrées)

| Sujet | Décision |
|---|---|
| **Canaux V1** | **In-app + Email + Web Push (PWA)** — tout gratuit / free tier |
| **Priorité V1** | **Convocations & séances d'entraînement** (besoin n°1 des parents) |
| **Médias** | **Galerie privée + notification** « nouvelles photos » (pas d'images en pièce jointe) |
| WhatsApp / SMS | Hors V1 — évolution future optionnelle (§9) |

---

## 3. Principes directeurs

1. **Économique d'abord** : aucun coût récurrent tant qu'on reste dans les *free tiers* (email ≤ 300/jour, web push illimité, stockage ≤ 1 Go).
2. **Opt-in & RGPD** : rien n'est envoyé sans consentement explicite, par canal et par catégorie ; désabonnement 1-clic.
3. **Droit à l'image** : les photos d'enfants restent dans une **galerie à accès restreint** (familles concernées), jamais diffusées publiquement ni en pièce jointe.
4. **Réutilisation** : on **étend** `notification_logs` + le dispatcher existant ; on ne crée pas un second système.
5. **Idempotence & fiabilité** : pas de doublon de notification, file avec retry.

---

## 4. Périmètre fonctionnel

### 4.1 Côté Parent (espace membre)

- **Écran « Notifications »** : préférences par catégorie (Convocations, Séances, Photos, Actus, Événements) × canal (Email, Push) — l'in-app est toujours actif.
- **Feed in-app** : liste chronologique des notifications, badge « non lus », marquer comme lu, lien profond vers la page concernée (match, séance, galerie).
- **Activation des notifications push** : bouton « Activer les alertes » (permission navigateur), gestion multi-appareils.
- **Galerie privée** : photos des équipes de ses enfants, accès restreint.
- **Désabonnement** : lien dans chaque email + écran de préférences.

### 4.2 Côté Club (CRM admin)

- **Composer une annonce** ciblée (toute une équipe / catégorie / tout le club) → met en file pour les familles concernées.
- **Téléverser des photos** dans une galerie d'équipe → déclenche la notif « nouvelles photos ».
- **Journal d'envoi** : statut des notifications (envoyées / échecs / taux d'ouverture si dispo).
- Déclenchement **automatique** sur convocation et séance (sans action manuelle).

### 4.3 Déclencheurs automatiques (V1)

| Événement | Destinataires | Catégorie |
|---|---|---|
| Convocation créée / modifiée (`match_callups`) | Tuteurs du joueur convoqué (`player_guardians`) | `convocation` |
| Séance créée / modifiée / annulée (`training_sessions`) | Tuteurs des joueurs de l'équipe | `session` |
| Album/photos publié (V2) | Familles ayant un joueur dans l'équipe | `media` |
| Actualité publiée (V2) | Familles abonnées aux actus | `news` |

---

## 5. Architecture technique (économique)

```
 Événement métier (convocation, séance, photo, actu)
        │
        ▼
 [Fan-out] résolution des destinataires via player_guardians / family
        │  (filtré par notification_preferences : canal × catégorie)
        ▼
 notification_logs  (1 ligne par destinataire × canal, status=QUEUED)
        │
        ▼
 Dispatcher (cron toutes les ~5 min, ou immédiat)
   ├── channel=in_app  → marqué SENT, apparaît dans le feed
   ├── channel=email   → provider (Brevo / Resend, free tier) → SENT/FAILED
   └── channel=push    → web-push (VAPID) vers push_subscriptions → SENT/FAILED
```

- **Aucun nouveau service** : le dispatcher est l'endpoint existant `/api/admin/notifications/process`, étendu pour gérer les 3 canaux.
- **Planification** : `pg_cron` (inclus dans Supabase) **ou** une tâche cron sur le VPS existant (le VPS héberge déjà le site) appelant le dispatcher. Coût : 0 €.
- **Email** : provider transactionnel en *free tier* — **Brevo** (300 emails/jour gratuits, suffisant pour ~400 familles) ou **Resend** (100/jour, meilleurs templates React). Recommandation : **Brevo** pour le volume gratuit.
- **Web Push** : standard W3C, **gratuit** — clés **VAPID** générées une fois, lib `web-push`, **service worker** + **manifest PWA** (site installable). iOS 16.4+ supporté pour les PWA installées.

---

## 6. Modèle de données (nouvelles tables / extensions)

### 6.1 `notification_preferences` (opt-in par catégorie × canal)

```sql
create type notification_category as enum ('convocation', 'session', 'media', 'news', 'event');

create table notification_preferences (
  profile_id uuid not null references profiles(id) on delete cascade,
  category   notification_category not null,
  email      boolean not null default true,   -- opt-in email
  push       boolean not null default true,    -- opt-in push
  -- in-app toujours actif (pas de colonne : non désactivable)
  updated_at timestamptz not null default now(),
  primary key (profile_id, category)
);
```

### 6.2 `push_subscriptions` (abonnements Web Push, multi-appareils)

```sql
create table push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);
```

### 6.3 Extension de `notification_logs`

```sql
alter table notification_logs
  add column category notification_category,
  add column link     text,         -- deep-link vers la page concernée
  add column read_at  timestamptz;   -- statut "lu" pour le feed in-app
```

> Le registre des **consentements** (qui a opt-in, quand) est tracé via `notification_preferences.updated_at` + le journal d'activité existant (`recordActivity`).

---

## 7. RGPD & droit à l'image

- **Consentement explicite** par canal et catégorie ; valeurs par défaut à définir avec le club (recommandé : in-app ON, email ON pour convocations/séances, push OFF par défaut).
- **Mineurs** : le parent/tuteur gère ses préférences (et celles relatives à son enfant) — pas de compte enfant notifiable directement.
- **Droit à l'image** : galerie **à accès restreint** aux familles concernées ; pas d'image d'enfant en pièce jointe ni en diffusion publique ; possibilité d'un consentement « droit à l'image » par joueur (réutilisable depuis la fiche inscription).
- **Désabonnement** : lien 1-clic dans chaque email + écran de préférences.
- **Minimisation & conservation** : purge automatique des `notification_logs` > 12 mois.
- **Transparence** : mention dans la politique de confidentialité existante (`/politique-confidentialite`).

---

## 8. Coûts (objectif ~0 €/mois)

| Poste | Solution | Coût |
|---|---|---|
| Feed in-app | DB Supabase | 0 € |
| Email | Brevo *free tier* 300/j (ou Resend 100/j) | 0 € |
| Web Push | VAPID + `web-push` | 0 € |
| Planification (cron) | `pg_cron` Supabase **ou** cron VPS existant | 0 € |
| Stockage photos | Supabase Storage *free tier* 1 Go | 0 € (≈ 25 €/mo si dépassement → plan Pro) |
| **Total V1** | | **0 €/mois** dans les *free tiers* |

> Seuils à surveiller : > 300 emails/jour (passer à un volume payant Brevo ~ qq €) ou > 1 Go de photos (plan Supabase Pro). Les deux sont loin pour un club de cette taille.

---

## 9. Plan de développement (lots livrables)

> Chaque lot est **indépendamment livrable et testable** (typecheck + lint + test runtime, comme le reste du repo). Estimations en jours-homme indicatifs.

### V1 — Convocations & séances (canaux in-app + email + push)

| Lot | Contenu | Livrables | Est. |
|---|---|---|---|
| **L0 — Fondations** | Migrations (`notification_preferences`, `push_subscriptions`, extension `notification_logs`) ; API GET/PATCH préférences ; écran « Notifications » dans l'espace parent | Schéma + écran préférences opt-in | 2-3 j |
| **L1 — Feed in-app** | `channel=in_app` ; helper **fan-out** (résolution destinataires via `player_guardians`) ; UI feed (badge non-lus, marquer lu, lien profond) | Feed fonctionnel | 2-3 j |
| **L2 — Email** | Intégration provider (Brevo/Resend) + clé en env ; templates (convocation, séance, annulation) ; envoi via le dispatcher + suivi statut ; lien de désabonnement | Emails réels envoyés | 2-3 j |
| **L3 — Web Push (PWA)** | Manifest + service worker (site installable) ; VAPID + `web-push` ; `push_subscriptions` + API subscribe/unsubscribe ; UI permission ; envoi push depuis le dispatcher | Alertes push opt-in | 3-4 j |
| **L4 — Déclencheurs métier** | Hooks sur `match_callups` (convocation) et `training_sessions` (séance créée/modifiée/annulée) → mise en file ciblée, filtrée par préférences, dédupliquée | Notifs automatiques | 2-3 j |
| **L5 — Planification & fiabilité** | Cron (pg_cron ou VPS) ; retry/backoff ; idempotence ; gestion FAILED + relance ; journal d'envoi CRM | Service fiable | 1-2 j |

**Total V1 : ~12-18 jours.**

### V2 — Vie du club (photos & actus)

| Lot | Contenu |
|---|---|
| **L6 — Galerie privée + médias** | Galerie d'équipe à accès restreint ; upload admin → notif « nouvelles photos » |
| **L7 — Actualités** | Notif sur publication d'actu, ciblée par catégorie/équipe |

### V3 — Évolutions optionnelles (si budget)

- **WhatsApp Business** (Meta Cloud API) : canal n°1 des parents en France. Templates à faire valider par Meta. ~0 € jusqu'à ~1000 conversations/mois puis payant. Nouveau `channel=whatsapp` dans le dispatcher.
- **SMS critique** (annulation de dernière minute) : provider type OVH/Twilio, ~0,05 €/SMS — réservé à l'urgent.
- **App mobile native** : non recommandé (coût élevé) — la PWA installable couvre 90 % du besoin gratuitement.

---

## 10. Risques & dépendances

| Risque | Mitigation |
|---|---|
| Adoption du push faible (permission refusée) | L'email reste le canal de repli ; push = bonus |
| iOS : push uniquement si PWA **installée** | Inciter à « Ajouter à l'écran d'accueil » ; email couvre iOS non installé |
| Délivrabilité email (spam) | Domaine vérifié (SPF/DKIM via Brevo/Resend), lien désabonnement, contenu propre |
| Données joueurs/tuteurs incomplètes | Pré-requis : `player_guardians` renseigné côté CRM (rattachement parent↔enfant) |
| Dépassement free tier | Alertes de volume ; bascule vers plan payant minime documentée |

---

## 11. Critères d'acceptation V1

- Un parent peut **choisir** ses canaux/catégories et **se désabonner**.
- Une **convocation** créée dans le CRM déclenche, en < 5 min, une notif in-app + email (+ push si activé) **aux seuls tuteurs du joueur**.
- Une **séance annulée** prévient les familles de l'équipe concernée.
- Aucune notification envoyée à un parent qui n'a pas consenti pour ce canal/catégorie.
- `typecheck` + `lint` verts ; flux testés de bout en bout en local (Supabase).
- **0 €/mois** vérifié (free tiers).

---

## 12. Prochaine étape

Démarrage recommandé par le **Lot L0 (Fondations)** : migrations + écran de préférences. C'est le socle dont dépendent tous les autres lots, et il est livrable en 2-3 jours sans impact sur l'existant.
