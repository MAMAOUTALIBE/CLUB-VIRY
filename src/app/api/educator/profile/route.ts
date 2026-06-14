import type { NextRequest } from "next/server";

import { handleDbError, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import { getEducatorContext } from "@/lib/api/educator-auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { validateEducatorPublicProfilePayload } from "@/lib/api/validation";
import { updateOwnProfile } from "@/lib/db/profiles";
import { educatorSlug } from "@/lib/public-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recompose le nom public comme la fonction SQL public_educators (display_name
// hors email, sinon prénom+nom, sinon « Éducateur »), pour un slug cohérent.
function publicName(p: { display_name: string | null; first_name: string | null; last_name: string | null } | null): string {
  const display = p?.display_name && !p.display_name.includes("@") ? p.display_name.trim() : "";
  const full = [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim();
  return display || full || "Éducateur";
}

// GET : renvoie la fiche publique de l'éducateur connecté (pour pré-remplir le formulaire).
export async function GET(request: NextRequest) {
  const ctx = await getEducatorContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const p = ctx.context.profile;
  return jsonOk({
    profile: {
      displayName: p?.display_name && !p.display_name.includes("@") ? p.display_name : "",
      avatarUrl: p?.avatar_url ?? null,
      publicProfile: p?.public_profile ?? false,
      publicTitle: p?.public_title ?? "",
      publicDiploma: p?.public_diploma ?? "",
      publicJoinedYear: p?.public_joined_year ?? null,
      publicDiplomas: p?.public_diplomas ?? [],
      publicSpecialties: p?.public_specialties ?? [],
      publicQuote: p?.public_quote ?? "",
      publicBio: p?.public_bio ?? "",
      // Slug canonique (source de vérité unique pour le lien « voir ma fiche »).
      publicSlug: educatorSlug(publicName(p), ctx.context.user.id)
    }
  });
}

// PATCH : l'éducateur met à jour SA fiche publique. validateEducatorPublicProfilePayload
// n'autorise QUE les champs publics (ni role/status, ni PII, ni avatarUrl) -> pas
// d'escalade ni d'injection via avatar.
export async function PATCH(request: NextRequest) {
  const ctx = await getEducatorContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const rateLimit = checkRateLimit(request, "educator:profile", { max: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Trop de modifications. Reessayez dans un instant.");
  }

  const body = await readJsonBody(request);
  if (body === undefined) {
    return jsonError(400, "INVALID_JSON", "Le corps de la requete doit etre un JSON valide.");
  }

  const payload = validateEducatorPublicProfilePayload(body);
  if (!payload.ok) {
    return jsonError(400, "VALIDATION_ERROR", "Fiche invalide.", payload.issues);
  }

  try {
    const profile = await updateOwnProfile(ctx.context.user.id, payload.data);
    return jsonOk({ profile });
  } catch (error) {
    return handleDbError("educator/profile", error);
  }
}
