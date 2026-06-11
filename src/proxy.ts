import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protège l'espace d'administration / CRM (convention Next.js 16 "proxy").
 *
 * Tant que l'authentification réelle (Supabase) n'est pas activée, l'espace
 * admin n'est pas exploitable : on évite donc d'exposer publiquement son shell.
 * Sans cookie de session admin, toute requête vers /admin est redirigée vers
 * l'accueil et marquée non-indexable. Quand le CRM sera activé, la connexion
 * posera le cookie `admin_session` (HttpOnly) et le proxy laissera passer.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("admin_session");

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
