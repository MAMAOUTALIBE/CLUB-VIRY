import "server-only";

import type { NextRequest } from "next/server";

type RateLimitOptions = {
  max: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

// Plafond mémoire pour éviter une croissance illimitée (DoS mémoire).
const MAX_BUCKETS = 10_000;

// Nombre de proxies de confiance devant l'application (Traefik = 1).
// L'IP réellement fiable est celle AJOUTÉE par notre proxy, soit la dernière
// entrée du X-Forwarded-For : un client ne peut pas la falsifier puisque Traefik
// l'écrit lui-même. Prendre la première entrée (ancien comportement) était
// contournable. Ajustable si plusieurs proxies sont chaînés.
const TRUSTED_HOPS = Math.max(1, Number.parseInt(process.env.RATE_LIMIT_TRUSTED_HOPS ?? "1", 10) || 1);

function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length > 0) {
      const index = Math.max(0, parts.length - TRUSTED_HOPS);
      return parts[index];
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "local";
}

function purgeExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(request: NextRequest, key: string, options: RateLimitOptions) {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    purgeExpired(now);
    // Si le plafond est toujours dépassé après purge, on repart à zéro (garde-fou mémoire).
    if (buckets.size > MAX_BUCKETS) {
      buckets.clear();
    }
  }

  const bucketKey = `${key}:${getRequestIp(request)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(bucketKey, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt
    };
  }

  current.count += 1;

  return {
    allowed: current.count <= options.max,
    remaining: Math.max(options.max - current.count, 0),
    resetAt: current.resetAt
  };
}
