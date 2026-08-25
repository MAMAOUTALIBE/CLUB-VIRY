const ALLOWED_SETTING_KEYS = new Set([
  "socials", "contact", "president", "inscriptions_banner", "club_stats", "values", "histoire", "organigramme", "stade", "installations",
  "codes_conduite", "formation_educateurs", "formation_creneaux", "formation_projet", "formation_stages", "galerie_archives", "mentions_legales",
  "politique_confidentialite", "boutique_cgv", "boutique_livraison", "inscriptions_page", "detections_page", "home_hero", "announcements", "home_sports"
]);

export function isAllowedSettingKey(key: string): boolean {
  return ALLOWED_SETTING_KEYS.has(key);
}
