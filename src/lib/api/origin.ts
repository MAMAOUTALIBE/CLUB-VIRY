type OriginCheckedRequest = {
  headers: {
    get(name: string): string | null;
  };
  nextUrl: {
    origin: string;
  };
};

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function getAllowedOrigins(request: OriginCheckedRequest): Set<string> {
  const allowedOrigins = new Set([request.nextUrl.origin]);
  const host = firstHeaderValue(request.headers.get("x-forwarded-host")) ?? firstHeaderValue(request.headers.get("host"));

  if (host) {
    const protocol = firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? request.nextUrl.origin.split(":")[0] ?? "https";
    allowedOrigins.add(`${protocol}://${host}`);
  }

  return allowedOrigins;
}

function isAllowedOrigin(value: string, allowedOrigins: Set<string>): boolean {
  try {
    return allowedOrigins.has(new URL(value).origin);
  } catch {
    return false;
  }
}

export function isSameOriginRequest(request: OriginCheckedRequest): boolean {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = request.headers.get("origin");

  if (origin) {
    return isAllowedOrigin(origin, allowedOrigins);
  }

  const referer = request.headers.get("referer");

  if (referer) {
    return isAllowedOrigin(referer, allowedOrigins);
  }

  // Les clients serveur/mobile n'envoient pas toujours Origin/Referer. On bloque
  // seulement les requêtes navigateur dont l'origine contradictoire est observable.
  return true;
}
