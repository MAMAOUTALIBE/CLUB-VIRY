import type { NextRequest } from "next/server";

import { getAdminContext } from "@/lib/api/admin-auth";
import { handleDbError, jsonOk, parseLimit } from "@/lib/api/http";
import { isAutomationKey, type AutomationRunStatus } from "@/lib/automations";
import { listAutomationRules, listAutomationRuns } from "@/lib/db/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUN_STATUSES: readonly AutomationRunStatus[] = ["SUCCESS", "SKIPPED", "FAILED"];

function readStatus(value: string | null): AutomationRunStatus | undefined {
  return RUN_STATUSES.find((status) => status === value);
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext(request, "automations:manage");

  if (!admin.ok) {
    return admin.response;
  }

  const params = request.nextUrl.searchParams;
  const ruleParam = params.get("rule");
  const limit = parseLimit(params.get("limit"), 50, 200);

  try {
    const [rules, runs] = await Promise.all([
      listAutomationRules(),
      listAutomationRuns({
        ruleKey: isAutomationKey(ruleParam) ? ruleParam : undefined,
        status: readStatus(params.get("status")),
        limit
      })
    ]);

    return jsonOk({ rules, runs });
  } catch (error) {
    return handleDbError("admin/automations", error);
  }
}
