import "server-only";

import { cache } from "react";
import { isUuid } from "@/lib/api/validation";
import { getPublicMatchById } from "@/lib/db/calendar";
import { mapMatchIdentity } from "@/lib/mobile-match-feed";
import { readPublicDb } from "@/lib/public-db";

export const getPublicMatchDetail = cache(async (id: string) => {
  if (!isUuid(id)) return null;
  const row = await readPublicDb(() => getPublicMatchById(id));
  if (!row) return null;
  const identity = mapMatchIdentity(row);
  return identity ? { row, identity } : null;
});
