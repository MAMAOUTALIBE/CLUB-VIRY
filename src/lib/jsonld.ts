/**
 * Constructeurs de donnees structurees schema.org reutilisables.
 * Le site est servi sous NEXT_PUBLIC_SITE_URL (fallback localhost en dev).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const ORG_NAME = "ES Viry-Châtillon Football";

/**
 * Sérialise un objet JSON-LD pour injection dans <script> via dangerouslySetInnerHTML.
 * JSON.stringify n'échappe ni `<` ni `/` : sans cela, un contenu utilisateur
 * (bio, citation, titre…) contenant `</script>` permettrait une XSS stockée.
 * On neutralise `<`, `>`, `&` et les séparateurs de ligne JS (U+2028 / U+2029).
 */
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
const JSONLD_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEP]: "\\u2028",
  [PARA_SEP]: "\\u2029"
};
const JSONLD_ESCAPE_RE = new RegExp("[<>&" + LINE_SEP + PARA_SEP + "]", "g");

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(JSONLD_ESCAPE_RE, (char) => JSONLD_ESCAPES[char] ?? char);
}

type BreadcrumbItem = { name: string; path?: string };

/**
 * BreadcrumbList : le dernier element (page courante) n'a pas d'`item` (recommandation Google).
 * `path` est relatif (ex. "/actualites") ; on le resout en URL absolue via SITE_URL.
 */
export function buildBreadcrumb(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {})
    }))
  };
}

export function buildNewsArticle(article: { title: string; excerpt: string; image: string; isoDate: string; category: string }, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image],
    datePublished: article.isoDate,
    articleSection: article.category,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
    author: { "@type": "Organization", name: ORG_NAME },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/club-logo.svg` }
    }
  };
}

export function buildSportsTeam(team: { name: string; slug: string; coach: string; players: Array<{ name: string }> }) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Football",
    url: `${SITE_URL}/equipes/${team.slug}`,
    memberOf: { "@type": "SportsOrganization", name: ORG_NAME },
    coach: { "@type": "Person", name: team.coach },
    athlete: team.players.map((player) => ({ "@type": "Person", name: player.name }))
  };
}
