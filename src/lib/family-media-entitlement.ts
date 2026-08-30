import type { FamilyMediaPassStatus, MediaAsset, ProfileStatus } from "@/lib/db/types";

export type FamilyMediaRight = "PHOTOS" | "TRAINING_VIDEOS" | "LIVE_MATCHES";
export type FamilyMediaAccessDenial = "PROFILE_INACTIVE" | "NO_FAMILY" | "NO_ACTIVE_PASS" | "RIGHT_DENIED" | "TEAM_DENIED";

export type FamilyMediaPassGrant = {
  id: string;
  familyId: string;
  status: FamilyMediaPassStatus;
  startsOn: string;
  endsOn: string;
  allowPhotos: boolean;
  allowTrainingVideos: boolean;
  allowLiveMatches: boolean;
  teamIds: string[];
};

export type FamilyMediaAccessSnapshot = {
  profileStatus: ProfileStatus | null;
  familyIds: string[];
  passes: FamilyMediaPassGrant[];
};

export type FamilyMediaAccessDecision =
  | { ok: true; passId: string; familyId: string }
  | { ok: false; reason: FamilyMediaAccessDenial };

function grantsRight(pass: FamilyMediaPassGrant, right: FamilyMediaRight): boolean {
  if (right === "PHOTOS") return pass.allowPhotos;
  if (right === "TRAINING_VIDEOS") return pass.allowTrainingVideos;
  return pass.allowLiveMatches;
}

/** Date sportive a Paris, independante du fuseau du serveur. */
export function familyMediaDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

export function isFamilyMediaPassCurrent(
  pass: Pick<FamilyMediaPassGrant, "status" | "startsOn" | "endsOn">,
  dateKey = familyMediaDateKey()
): boolean {
  return pass.status === "ACTIVE" && pass.startsOn <= dateKey && pass.endsOn >= dateKey;
}

/** Ordre volontaire : compte -> famille -> pass/date -> droit -> equipe. */
export function evaluateFamilyMediaAccess(
  snapshot: FamilyMediaAccessSnapshot,
  request: { right: FamilyMediaRight; teamId: string; dateKey?: string }
): FamilyMediaAccessDecision {
  if (snapshot.profileStatus !== "ACTIVE") return { ok: false, reason: "PROFILE_INACTIVE" };
  if (snapshot.familyIds.length === 0) return { ok: false, reason: "NO_FAMILY" };

  const familyIds = new Set(snapshot.familyIds);
  const dateKey = request.dateKey ?? familyMediaDateKey();
  const activePasses = snapshot.passes.filter(
    (pass) => familyIds.has(pass.familyId) && isFamilyMediaPassCurrent(pass, dateKey)
  );

  if (activePasses.length === 0) return { ok: false, reason: "NO_ACTIVE_PASS" };

  const rightPasses = activePasses.filter((pass) => grantsRight(pass, request.right));
  if (rightPasses.length === 0) return { ok: false, reason: "RIGHT_DENIED" };

  const scopedPass = rightPasses.find((pass) => pass.teamIds.includes(request.teamId));
  if (!scopedPass) return { ok: false, reason: "TEAM_DENIED" };

  return { ok: true, passId: scopedPass.id, familyId: scopedPass.familyId };
}

export function requiredRightForMedia(asset: Pick<MediaAsset, "type" | "content_kind">): FamilyMediaRight | null {
  if (asset.type === "PHOTO") return "PHOTOS";
  if (asset.content_kind === "TRAINING") return "TRAINING_VIDEOS";
  if (asset.content_kind === "MATCH") return "LIVE_MATCHES";
  return null;
}
