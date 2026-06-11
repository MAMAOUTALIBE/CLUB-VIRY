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
