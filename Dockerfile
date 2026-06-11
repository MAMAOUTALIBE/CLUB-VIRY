# syntax=docker/dockerfile:1

# ---- Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Builder ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* est inline AU BUILD par Next.js : l'URL publique doit etre presente
# ici, sinon le SEO / sitemap / liens canoniques tomberaient sur http://localhost:3000.
ARG NEXT_PUBLIC_SITE_URL=https://virychatillonfootball.org
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

# ---- Runner (image finale, legere) ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Dossier de capture des demandes (contact / inscription / recrutement) en mode vitrine
ENV LEADS_DIR=/app/var/leads

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Sortie "standalone" de Next.js : serveur minimal + assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/var/leads && chown -R nextjs:nodejs /app/var

USER nextjs
EXPOSE 3000

# Liveness : l'accueil doit repondre 200 (valable aussi en mode vitrine, sans Supabase).
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
