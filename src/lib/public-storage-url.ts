export function resolvePublicStorageUrl(storageUrl: string, supabaseUrl: string, siteUrl?: string): string {
  try {
    if (new URL(supabaseUrl).hostname !== "kong" || !siteUrl) return storageUrl;
    return new URL(new URL(storageUrl).pathname, siteUrl).toString();
  } catch {
    return storageUrl;
  }
}
