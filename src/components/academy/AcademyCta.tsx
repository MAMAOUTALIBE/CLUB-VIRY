import type { ReactNode } from "react";

// CTA d'accès à la plateforme Academy (service EXTERNE). Aucune URL en dur :
// l'URL vient de ACADEMY_PLATFORM_URL, lue côté serveur et passée en prop.
// Sans URL, le bouton est désactivé (pas de lien mort). Composant sans hook :
// utilisable aussi bien côté serveur que dans un composant client.

type AcademyCtaProps = {
  url?: string;
  className: string;
  children: ReactNode;
};

export function AcademyCta({ url, className, children }: AcademyCtaProps) {
  if (url) {
    return (
      <a className={className} href={url} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <span className={`${className} cursor-not-allowed opacity-60`} aria-disabled="true" title="Plateforme bientôt disponible">
      {children}
    </span>
  );
}
