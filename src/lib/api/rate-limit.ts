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

function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function checkRateLimit(request: NextRequest, key: string, options: RateLimitOptions) {
  const now = Date.now();
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
