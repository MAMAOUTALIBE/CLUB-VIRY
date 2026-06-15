import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/api/origin";
import { canAccessCrmPath } from "@/lib/auth/permissions";
import { isAppRole } from "@/lib/auth/roles";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Protège l'espace d'administration / CRM (convention Next.js 16 "proxy").
 *
 * Le cookie `admin_session` (HttpOnly) contient l'access token Supabase posé à la
 * connexion. On ne se contente PAS de vérifier sa présence : on valide réellement
 * la session auprès de Supabase (signature + expiration). Un cookie forgé ou expiré
 * est donc rejeté et la requête est redirigée vers /connexion, non indexable.
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
    url.pathname = "/connexion";
    url.search = "";
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    if (sessionStatus === "forbidden") {
      url.searchParams.set("error", "forbidden");
    }
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"]
};
