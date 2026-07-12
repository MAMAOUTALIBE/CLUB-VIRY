# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Official website + internal CRM for **ES Viry-Châtillon Football** (a French amateur football club). Codebase, UI, content and most docs are in **French** — match that language in user-facing strings, commit messages, and code comments.

## Commands

```bash
npm run dev          # Next dev server on http://localhost:3000
npm run build        # next build, then scripts/prepare-standalone.mjs (copies public/ + .next/static into the standalone bundle)
npm run start        # runs the standalone server (scripts/start-standalone.mjs), loading .env files itself
npm run lint         # eslint src --ext .ts,.tsx
npm run typecheck    # tsc --noEmit (TypeScript is strict)
npm run test         # node --test over tests/**/*.test.mjs (runs .ts directly via --experimental-strip-types)
npm run seed:test-users   # seed local Supabase auth + profiles for manual CRM testing
```

Run a single test file: `node --test --experimental-strip-types tests/auth-validation.test.mjs`

Three suites exist: `auth-validation.test.mjs` (the `validate*Payload()` functions — add coverage here for new validators), `runtime-env.test.mjs`, and `seed-local-test-users.test.mjs`.

Node **>=22 <23** is required (see `.nvmrc` / `engines`). Always run `typecheck`, `lint`, `test`, and `build` before deploying.

CI (`.github/workflows/ci.yml`, on PRs + push to `main`) runs the same gate end-to-end: it copies `.env.production.example` → `.env.local`, then `npm audit --audit-level=moderate`, `typecheck`, `lint`, `test`, `build` (with `NEXT_PUBLIC_SITE_URL` set), and finally `docker compose config` to validate the compose stack. Keep these green locally before pushing — a moderate-or-higher `npm audit` finding fails the build.

## Two runtime modes (the central architectural idea)

The same build runs in one of two modes depending **only on which env vars are set** (`src/lib/supabase.ts`, `src/lib/db/supabase-admin.ts`):

- **Vitrine mode (no Supabase)** — the public site renders entirely from mock data in `src/lib/data.ts` and friends. Public form submissions (contact / inscription / recrutement / partenariat) are captured by `src/lib/leads.ts`: appended to a local JSONL file under `LEADS_DIR` and optionally POSTed to `NOTIFICATION_WEBHOOK_URL`. This is what production currently runs.
- **CRM mode (full backend)** — requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Unlocks auth, `/admin` CRM, member/educator spaces, and dynamic content from Supabase.

`isSupabaseConfigured` (anon, client-usable) and `isSupabaseAdminConfigured` (service role, server-only) are the flags gating mode everywhere. **Never assume Supabase exists** — public pages must always render. Code that touches the DB on public paths must degrade gracefully.

### Public read layer with fallback
Public pages read content through `src/lib/public-content.ts`, which wraps every DB read in `readPublicDb()` (`src/lib/public-db.ts`). That helper: skips the DB entirely in vitrine mode, races each query against a **1.2s timeout**, and on timeout/error trips a **60s circuit breaker** (`markPublicDbUnavailable`) so a slow DB never degrades the public site. When the DB returns nothing/null, callers fall back to mock data. So public content has three layers: live published DB rows → mock fallback (`src/lib/data.ts`, `src/lib/public-fallbacks.ts`) → always-renderable.

## Auth, roles & access control

- **Roles** (`src/lib/auth/roles.ts`): `SUPER_ADMIN, ADMIN_CLUB, DIRIGEANT, EDUCATEUR, FAMILLE, JOUEUR, MEMBRE, PARTENAIRE, VISITEUR`. `roleRank()` (lower = more privileged) drives the anti-privilege-escalation guard `canAdminUpdateProfile()` — an admin can't change their own role/status, manage an equal-or-higher account, or grant an equal-or-higher role.
- **Permissions** (`src/lib/auth/permissions.ts`): `ROLE_PERMISSIONS` maps each role to a permission set; routes check `hasPermission`. Note `EDUCATEUR` deliberately lacks `matches:manage` — educators manage their own teams only via `/api/educator/*` (permission `educator:manage_own_teams` + per-team `canManageTeam` checks), never the unscoped `/api/admin/*` routes.
- **Login** (`src/app/api/auth/login/route.ts`): Supabase `signInWithPassword`, then tokens are stored in **HttpOnly cookies** `admin_session` (access) and `admin_refresh` (refresh) — not in client storage.
- **Page gate** = `src/proxy.ts` (Next.js 16 "proxy" convention, the replacement for `middleware.ts`; `matcher` covers `/admin`, `/admin/:path*`, `/api/:path*`). It does two things: (1) blocks cross-origin mutating API requests (CSRF defense via `isSameOriginRequest`; the allow-list comes from `CSRF_ALLOWED_ORIGINS` / `NEXT_PUBLIC_SITE_URL` / `SITE_DOMAIN` when set, else falls back to the request's own forwarded host), and (2) for `/admin/*`, **validates the session against Supabase for real** (signature + expiry + `status === ACTIVE`) and authorizes per-path via `canAccessCrmPath` — it does not merely check cookie presence. Unauthorized → redirect to `/connexion` with `X-Robots-Tag: noindex`.
- **API gate** = `getAdminContext(request, permission)` (`src/lib/api/admin-auth.ts`) wraps `getAuthContext` (`src/lib/auth/session.ts`) + `requirePermission`. This is the per-route check; the proxy gate and the per-route permission check are layered (defense in depth) — keep both.

## Request/route conventions

Every `/api/**/route.ts` follows the same shape — match it for new routes:

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "players:manage");  // or getAuthContext for member/educator
  if (!admin.ok) return admin.response;
  try {
    return jsonOk(await someDbCall());
  } catch (error) {
    return handleDbError("admin/players", error);  // logs detail server-side, returns generic 500
  }
}
```

- Responses use `jsonOk(data)` / `jsonError(status, code, message, details?)` from `src/lib/api/http.ts` — envelope is `{ ok, data }` or `{ ok, error: { code, message } }`. `ApiErrorCode` is a fixed union; reuse existing codes.
- **Never leak internal errors.** `handleDbError` logs the real error and returns a generic message — important on public routes to avoid exposing the Supabase schema.
- **Validation**: request bodies are validated by hand-rolled `validate*Payload()` functions in `src/lib/api/validation.ts` (the largest single file, ~2500 lines) returning `{ ok, data } | { ok: false, issues }`. There is no schema library — add new validators there and cover them in `tests/auth-validation.test.mjs`.
- Other API helpers: `checkRateLimit` (`src/lib/api/rate-limit.ts`), `getSafeWebhookUrl`/SSRF guards (`src/lib/api/webhook-security.ts`), `isSameOriginRequest` (`src/lib/api/origin.ts`), CSV export (`src/lib/api/csv.ts`).

## Data layer

- `src/lib/db/*` — server-only (`import "server-only"`) modules, one per domain (teams, family, registrations, recruitment-shop, content, sessions, notifications, …), re-exported from `src/lib/db/index.ts`. All DB access goes through the **service-role admin client** (`getSupabaseAdminClient()`); RLS is enforced in SQL but the app trusts its own permission checks. Shared row types live in `src/lib/db/types.ts`.
- `src/lib/data.ts`, `src/lib/academy-data.ts`, `src/lib/club-pages-data.ts` — mock/static content used as vitrine fallback and for editorial pages.
- **Partners** (`/partenaires`, `getPublicPartners()` in `src/lib/public-content.ts`) follow the same three-layer fallback: published `public.partners` rows → mock names from `src/lib/data.ts` mapped to bundled SVGs via `src/lib/partner-logos.ts` (name→`/images/partners/*.svg`). Partner logos are the **only feature using Supabase Storage** — the public `partner-logos` bucket (migration `20260709193000_partner_logo_storage.sql`; 2 MB, jpeg/png/webp), whose public URL is persisted to `partners.logo_url`.
- Schema lives in `supabase/migrations/*.sql` (timestamped, append-only) + `supabase/seed.sql`. Add a new timestamped migration rather than editing an existing one.

## Frontend structure

- `src/app/` — Next.js App Router. Public site is the French slugs at the root (`le-club`, `equipes`, `formation`, `calendrier`, `boutique`, `inscriptions`, `detections-recrutement`, …). `src/app/admin/*` is the CRM (~25 pages). `src/app/api/*` is ~106 route handlers. `/api/backend/health` is the unauthenticated health/smoke-test endpoint the deploy scripts poll.
- `src/components/{admin,member,educator,club,academy}/` — admin CRM widgets (`AdminCrud`, `AdminModuleBoard`, `Admin360Explorer`, etc.) are client components that call the API with `credentials: "include"` so the HttpOnly cookie rides along.
- Styling is **TailwindCSS v4** (config-less, via `@tailwindcss/postcss`). Club brand colors recur as literals: green `#002f1d`, yellow `#f7c600`.
- SEO/security helpers: `src/lib/seo.ts`, `src/lib/jsonld.ts` (escaped JSON-LD, anti-XSS). Strict CSP and security headers are set in `next.config.ts` (`output: "standalone"`).
- Import alias: `@/*` → `./src/*`.

## Deployment

Production is **vitrine mode**, Docker + Traefik on a VPS, domain `esvirychatillonfootball.org`, branch `main`. See `DEPLOYMENT.md` (French, step-by-step) and `./deploy.sh` (SSH + rebuild on the VPS + healthcheck + smoke test against `https://<domain>/api/backend/health`). `docker-compose.yml` is the base stack; `docker-compose.crm.yml` is an overlay adding the self-hosted Supabase network when running CRM mode. Env on the VPS lives in `/opt/esviry/.env` (out of git); `NEXT_PUBLIC_*` vars are inlined at **build** time (passed as Docker build args), so switching modes requires a rebuild. Captured leads persist in the `./var/leads` volume.

The base `docker-compose.yml` only attaches Traefik labels — it assumes an **external Traefik already running**. The reverse-proxy itself lives in `infra/traefik/docker-compose.traefik.yml` (Traefik v3, ports 80/443, Let's Encrypt TLS-ALPN via `letsencrypt` resolver, joins the `esviry-net` network). For a **from-scratch VPS** (e.g. fresh Hostinger): `scripts/provision-vps.sh` bootstraps Docker + UFW, then follow `docs/deploiement-hostinger.md` end-to-end (DNS → Supabase Cloud → first manual `up` → start Traefik → smoke test). CRM env template: `.env.production.crm.example`. First bring-up is manual (the site must create `esviry-net` before Traefik starts, and `deploy.sh`'s HTTPS smoke test needs Traefik live); `deploy.sh` is for updates thereafter.

**Actual live production (VPS `srv1768778`, `213.130.144.215`)** does NOT use Traefik. That VPS already runs a native **nginx** (ports 80/443 + certbot) serving another site (`lodene.org`), so the club site is co-hosted **behind that nginx**: the container is published to `127.0.0.1:8090` (override `docker-compose.nginx.yml`), nginx reverse-proxies a dedicated vhost (`infra/nginx/esvirychatillonfootball.org.conf`) to it, and HTTPS is certbot (auto-renew). Currently **vitrine mode**. Update the live site with `scripts/deploy-nginx-vps.sh` (NOT `deploy.sh`) — see `docs/maj-site-en-ligne.md`. Never run `provision-vps.sh` there (it would enable UFW on port 22 and disrupt nginx/lodene).
