import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonError, jsonOk } from "@/lib/api/http";
import { listRegistrationsForAdmin } from "@/lib/db/registrations";
import type { RegistrationStatus } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRATION_STATUSES: readonly RegistrationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "MISSING_DOCUMENTS",
  "VALIDATED",
  "REJECTED",
  "CANCELLED"
];

function parseStatus(value: string | null): RegistrationStatus | undefined {
  return REGISTRATION_STATUSES.includes(value as RegistrationStatus) ? (value as RegistrationStatus) : undefined;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "registrations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100, 500);
  const status = parseStatus(request.nextUrl.searchParams.get("status"));

  try {
    const registrations = await listRegistrationsForAdmin(limit, status);
    return jsonOk({ registrations });
  } catch (error) {
    return handleDbError("admin/registrations", error);
  }
}
