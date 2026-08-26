import Link from "next/link";
import type { ReactNode } from "react";

// CTA d'accès à la plateforme Academy (service EXTERNE). Aucune URL en dur :
// l'URL vient de ACADEMY_PLATFORM_URL, lue côté serveur et passée en prop.
// Tant qu'elle n'est pas configurée, le bouton reste un VRAI lien, mais vers le
// repli fourni par la page (contact du club) et avec un libellé qui dit ce qui
// va réellement se passer — jamais un bouton sans action.
// Composant sans hook : utilisable côté serveur comme dans un composant client.

type AcademyCtaProps = {
  url?: string;
  className: string;
  children: ReactNode;
  /** Destination et libellé utilisés tant que la plateforme n'est pas configurée. */
  fallback: { href: string; label: ReactNode };
};

export function AcademyCta({ url, className, children, fallback }: AcademyCtaProps) {
  if (url) {
    return (
      <a className={className} href={url} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={fallback.href}>
      {fallback.label}
    </Link>
  );
}
