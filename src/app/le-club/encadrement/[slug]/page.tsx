import { notFound } from "next/navigation";

import { EducatorProfilePage } from "@/components/educator/EducatorProfilePage";
import { buildBreadcrumb, jsonLdScript } from "@/lib/jsonld";
import { getPublicEducatorBySlug, getPublicEducators } from "@/lib/public-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;
export const revalidate = 300; // ISR : contenu CMS rafraichi toutes les 5 min

export async function generateStaticParams() {
  const all = await getPublicEducators();
  return all.map((educator) => ({ slug: educator.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const educator = await getPublicEducatorBySlug(slug);

  if (!educator) {
    return { title: "Éducateur" };
  }

  const description = (educator.bio || `${educator.title} à l'ES Viry-Châtillon Football.`).slice(0, 160);

  return {
    title: `${educator.name} — ${educator.title}`,
    description,
    alternates: { canonical: `/le-club/encadrement/${slug}` },
    openGraph: {
      title: `${educator.name} — ${educator.title}`,
      description,
      type: "profile",
      ...(educator.avatar ? { images: [educator.avatar] } : {})
    }
  };
}

export default async function EducatorDetailPage({ params }: Props) {
  const { slug } = await params;
  const educator = await getPublicEducatorBySlug(slug);

  if (!educator) {
    notFound();
  }

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: educator.name,
    jobTitle: educator.title,
    worksFor: { "@type": "SportsOrganization", name: "ES Viry-Châtillon Football" },
    ...(educator.avatar ? { image: educator.avatar } : {}),
    ...(educator.bio ? { description: educator.bio } : {}),
    ...(educator.diplomas.length > 0 ? { hasCredential: educator.diplomas } : {})
  };

  const breadcrumbJsonLd = buildBreadcrumb([
    { name: "Accueil", path: "/" },
    { name: "Le Club", path: "/le-club" },
    { name: "Encadrement", path: "/le-club/encadrement" },
    { name: educator.name }
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />
      <EducatorProfilePage educator={educator} />
    </>
  );
}
