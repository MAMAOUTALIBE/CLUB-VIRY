import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/api/origin";
import { canAccessCrmPath } from "@/lib/auth/permissions";
import { isAppRole } from "@/lib/auth/roles";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Anti-hotlink / téléchargement direct des images du club.
 *
 * Couvre l'optimiseur next/image (`/_next/image`, donc TOUTES les `<Image>` du site)
 * et les fichiers originaux servis depuis `/public` (photos historiques, stade).
 * On n'autorise que les sous-ressources chargées par NOTRE propre site
 * (`Sec-Fetch-Site` same-origin/same-site). L'accès direct (URL tapée, ouverture dans
 * un nouvel onglet → `none`) et le hotlink depuis un autre site (`cross-site`) sont refusés.
 * Aucune protection ne bloque une capture d'écran : c'est de la dissuasion.
 */
const protectedImagePrefixes = ["/historique/", "/stade/"];
const imageExtension = /\.(?:jpe?g|png|webp|avif|gif|svg)$/i;

function isProtectedImageRequest(pathname: string): boolean {
  if (pathname === "/_next/image") {
    return true;
  }
  return protectedImagePrefixes.some((prefix) => pathname.startsWith(prefix)) && imageExtension.test(pathname);
}

function isAllowedImageContext(request: NextRequest): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");

  // Requête de navigateur (en-tête présent) : on n'autorise que nos propres sous-ressources.
  // - same-origin / same-site  → image chargée par une de nos pages → OK
  // - none (URL tapée, nouvel onglet) / cross-site (hotlink) → refusé
  if (secFetchSite) {
    return secFetchSite === "same-origin" || secFetchSite === "same-site";
  }

  // Pas d'en-tête Sec-Fetch : requête serveur (l'optimiseur next/image lit l'original
  // en interne) ou client non-navigateur. On laisse passer pour ne pas casser
  // l'optimisation ; tout accès direct depuis un navigateur reste, lui, intercepté ci-dessus.
  return true;
}

/**
 * Protège l'espace d'administration / CRM (convention Next.js 16 "proxy").
 *
 * Le cookie `admin_session` (HttpOnly) contient l'access token Supabase posé à la
 * connexion. On ne se contente PAS de vérifier sa présence : on valide réellement
 * la session auprès de Supabase (signature + expiration). Un cookie forgé ou expiré
 * est donc rejeté et la requête est redirigée vers l'accueil, non indexable.
 *
 * Ce gate assure l'AUTHENTIFICATION et l'AUTORISATION au niveau page :
 * seules les sessions autorisées pour le chemin demandé peuvent charger le CRM.
 * Les éducateurs n'ouvrent que `/admin/convocations`; les autres pages restent
 * réservées aux rôles de gestion du club. Les routes `/api/admin/*` gardent
 * leurs contrôles fins par permission.
 */
type AdminSessionStatus = "missing" | "invalid" | "forbidden" | "authorized";

async function getAdminSessionStatus(token: string | undefined, pathname: string): Promise<AdminSessionStatus> {
  if (!token || !isSupabaseConfigured) {
    return "missing";
  }

  try {
    const supabase = getSupabaseClient(token);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return "invalid";
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.status !== "ACTIVE" || !isAppRole(profile.role)) {
      return "forbidden";
    }

    return canAccessCrmPath(profile.role, pathname) ? "authorized" : "forbidden";
  } catch {
    return "invalid";
  }
}

export async function proxy(request: NextRequest) {
  if (isProtectedImageRequest(request.nextUrl.pathname)) {
    if (isAllowedImageContext(request)) {
      return NextResponse.next();
    }
    return new NextResponse("Image protégée — accès non autorisé.", {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store"
      }
    });
  }

  if (request.nextUrl.pathname.startsWith("/api/") && mutatingMethods.has(request.method) && !isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Origine de requête non autorisée."
        }
      },
      { status: 403 }
    );
  }

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const sessionStatus = await getAdminSessionStatus(token, request.nextUrl.pathname);

  if (sessionStatus !== "authorized") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*", "/_next/image", "/historique/:path*", "/stade/:path*"]
};
