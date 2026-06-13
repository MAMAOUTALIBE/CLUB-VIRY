import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Déconnexion : supprime les cookies HttpOnly de session (admin_session + admin_refresh). */
export async function POST() {
  const response = NextResponse.json({ ok: true, data: { loggedOut: true } });
  response.cookies.delete("admin_session");
  response.cookies.delete("admin_refresh");
  return response;
}
