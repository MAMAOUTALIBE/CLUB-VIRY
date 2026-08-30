export type FamilyAudienceMember = {
  familyId: string;
  profileId: string;
};

/** Déduplique les familles qui disposent d'au moins un profil réellement actif. */
export function countDistinctActiveAudienceFamilies(
  members: FamilyAudienceMember[],
  activeProfileIds: Iterable<string>
): number {
  const activeProfiles = new Set(activeProfileIds);
  return new Set(
    members
      .filter((member) => activeProfiles.has(member.profileId))
      .map((member) => member.familyId)
  ).size;
}
