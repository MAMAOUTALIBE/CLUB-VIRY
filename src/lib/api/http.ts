import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_FAILED"
  | "CONFIGURATION_ERROR"
  | "FORBIDDEN"
  | "INVALID_JSON"
  | "NOT_FOUND"
  | "PAYMENT_UNAVAILABLE"
  | "RATE_LIMITED"
  | "SUPABASE_ERROR"
  | "VALIDATION_ERROR";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(status: number, code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details })
      }
    },
    { status }
  );
}

/**
 * Convertit une erreur interne (souvent Supabase/Postgres) en réponse 500 GÉNÉRIQUE.
 * Le détail est journalisé côté serveur et JAMAIS renvoyé au client — évite la fuite
 * de schéma/contraintes (noms de tables/colonnes), notamment sur les routes publiques.
 */
export function handleDbError(context: string, error: unknown) {
  console.error(`[api] ${context}`, error);
  return jsonError(500, "SUPABASE_ERROR", "Une erreur interne est survenue. Réessayez plus tard.");
}

/** Borne un paramètre de limite à un entier dans [1, max] ; retombe sur `def` si invalide (négatif, flottant, NaN). */
export function parseLimit(raw: string | null, def: number, max: number): number {
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n) || n < 1) {
    return def;
  }
  return Math.min(n, max);
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}
