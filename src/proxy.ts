import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Protège l'espace d'administration / CRM (convention Next.js 16 "proxy").
 *
 * Le cookie `admin_session` (HttpOnly) contient l'access token Supabase posé à la
 * connexion. On ne se contente PAS de vérifier sa présence : on valide réellement
 * la session auprès de Supabase (signature + expiration). Un cookie forgé ou expiré
 * est donc rejeté et la requête est redirigée vers /connexion, non indexable.
 *
 * Ce gate assure l'AUTHENTIFICATION au niveau page. L'AUTORISATION par rôle reste
 * appliquée par les routes `/api/admin/*` (Bearer token + permissions), qui portent
 * la donnée réelle : un utilisateur authentifié non-admin verra le shell mais aucune
 * donnée sensible.
 */
async function hasValidAdminSession(token: string | undefined): Promise<boolean> {
  if (!token || !isSupabaseConfigured) {
    return false;
  }

  try {
    const { data, error } = await getSupabaseClient().auth.getUser(token);
    return Boolean(!error && data.user);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const isAuthenticated = await hasValidAdminSession(token);

  if (!isAuthenticated) {
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
