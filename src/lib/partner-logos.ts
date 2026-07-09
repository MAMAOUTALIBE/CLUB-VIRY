export const partnerLogosByName: Record<string, string> = {
  "Essonne Département": "/images/partners/essonne.svg",
  "Ville de Viry-Châtillon": "/images/partners/viry-chatillon.svg",
  Intersport: "/images/partners/intersport.svg",
  "E.Leclerc": "/images/partners/leclerc.svg",
  Engie: "/images/partners/engie.svg",
  "Crédit Mutuel": "/images/partners/credit-mutuel.svg",
  Nike: "/images/partners/nike.svg",
  Adidas: "/images/partners/adidas.svg",
  "Pro Emba": "/images/partners/pro-emba.svg",
  "MS SOL": "/images/partners/ms-sol.svg"
};

export function getPartnerLogo(name: string): string | null {
  return partnerLogosByName[name] ?? null;
}
