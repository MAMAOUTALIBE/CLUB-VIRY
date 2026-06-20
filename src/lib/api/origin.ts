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

function addOriginFromUrl(origins: Set<string>, value: string | null | undefined): void {
  if (!value) {
    return;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol === "http:" || url.protocol === "https:") {
      origins.add(url.origin);
    }
  } catch {
    // Ignore invalid config values; request-time validation still rejects unknown origins.
  }
}

function addOriginsFromCsv(origins: Set<string>, value: string | null | undefined): void {
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => addOriginFromUrl(origins, origin));
}

function getConfiguredOrigins(): Set<string> {
  const origins = new Set<string>();

  addOriginsFromCsv(origins, process.env.CSRF_ALLOWED_ORIGINS);
  addOriginFromUrl(origins, process.env.NEXT_PUBLIC_SITE_URL);

  const siteDomain = process.env.SITE_DOMAIN?.trim();

  if (siteDomain) {
    addOriginFromUrl(origins, `https://${siteDomain}`);
    addOriginFromUrl(origins, `https://www.${siteDomain}`);
  }

  return origins;
}

function getAllowedOrigins(request: OriginCheckedRequest): Set<string> {
  const configuredOrigins = getConfiguredOrigins();

  if (configuredOrigins.size > 0) {
    return configuredOrigins;
  }

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
