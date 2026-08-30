export type FamilyMediaLibraryCategory = "ALL" | "PHOTOS" | "MATCH_VIDEOS" | "TRAINING";

export type FamilyMediaLibraryItem = {
  id: string;
  team_id: string;
  team_name: string;
  type: "PHOTO" | "VIDEO";
  content_kind: "MATCH" | "TRAINING" | null;
  is_live: boolean;
  published_at: string | null;
};

export type FamilyMediaLibraryCounts = Record<FamilyMediaLibraryCategory, number>;

function belongsToCategory(item: FamilyMediaLibraryItem, category: FamilyMediaLibraryCategory): boolean {
  if (category === "ALL") return true;
  if (category === "PHOTOS") return item.type === "PHOTO";
  if (category === "MATCH_VIDEOS") return item.type === "VIDEO" && item.content_kind === "MATCH";
  return item.type === "VIDEO" && item.content_kind === "TRAINING";
}

export function sortFamilyMediaLibrary<T extends FamilyMediaLibraryItem>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (left.is_live !== right.is_live) return left.is_live ? -1 : 1;
    const publishedDiff = Date.parse(right.published_at ?? "") - Date.parse(left.published_at ?? "");
    if (Number.isFinite(publishedDiff) && publishedDiff !== 0) return publishedDiff;
    return left.id.localeCompare(right.id);
  });
}

export function countFamilyMediaLibrary(items: FamilyMediaLibraryItem[], teamId: string | null): FamilyMediaLibraryCounts {
  const scoped = teamId ? items.filter((item) => item.team_id === teamId) : items;
  return {
    ALL: scoped.length,
    PHOTOS: scoped.filter((item) => belongsToCategory(item, "PHOTOS")).length,
    MATCH_VIDEOS: scoped.filter((item) => belongsToCategory(item, "MATCH_VIDEOS")).length,
    TRAINING: scoped.filter((item) => belongsToCategory(item, "TRAINING")).length
  };
}

export function filterFamilyMediaLibrary<T extends FamilyMediaLibraryItem>(
  items: T[],
  filters: { category: FamilyMediaLibraryCategory; teamId: string | null }
): T[] {
  return sortFamilyMediaLibrary(
    items.filter(
      (item) =>
        (!filters.teamId || item.team_id === filters.teamId) &&
        belongsToCategory(item, filters.category)
    )
  );
}
