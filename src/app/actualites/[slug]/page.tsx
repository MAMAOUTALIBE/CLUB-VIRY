import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { buildBreadcrumb, buildNewsArticle } from "@/lib/jsonld";
import { getPublicNews, getPublicNewsBySlug } from "@/lib/public-content";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const all = await getPublicNews(50);
  return all.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicNewsBySlug(slug);

  if (!article) {
    return { title: "Actualité" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/actualites/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [article.image]
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleJsonLd = buildNewsArticle(article, `/actualites/${slug}`);
  const breadcrumbJsonLd = buildBreadcrumb([
    { name: "Accueil", path: "/" },
    { name: "Actualités", path: "/actualites" },
    { name: article.title }
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageHero description={article.excerpt} eyebrow={`${article.category} · ${article.date}`} image={article.image} title={article.title} />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Link className="focus-ring inline-flex items-center gap-2 text-sm font-black uppercase text-[#002f1d] hover:text-[#8a6d00]" href="/actualites">
          <ArrowLeft size={18} aria-hidden="true" />
          Toutes les actualités
        </Link>
        <p className="mt-6 text-xs font-black uppercase text-[#8a6d00]">
          {article.category} · <time dateTime={article.isoDate}>{article.date}</time>
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight text-[#002f1d] sm:text-4xl">{article.title}</h1>
        <div className="gold-divider mt-4" aria-hidden="true" />
        {article.excerpt ? <p className="mt-6 text-lg font-medium leading-8 text-slate-800">{article.excerpt}</p> : null}
        {article.content ? (
          <div className="mt-4 whitespace-pre-line leading-8 text-slate-700">{article.content}</div>
        ) : (
          <p className="mt-4 leading-8 text-slate-600">
            Le contenu complet de cette actualité sera bientôt disponible. En attendant, suivez le club sur ses réseaux et
            contactez-nous pour toute information.
          </p>
        )}
        <div className="official-card mt-10 rounded-lg bg-white p-6">
          <p className="text-xs font-black uppercase text-[#8a6d00]">Rester informé</p>
          <h2 className="mt-1 text-xl font-black uppercase text-[#002f1d]">Rejoignez la famille Viry</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="focus-ring inline-flex min-h-11 items-center rounded-md bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white" href="/inscriptions">
              S'inscrire
            </Link>
            <Link className="focus-ring inline-flex min-h-11 items-center rounded-md border border-[#002f1d]/20 px-5 py-3 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white" href="/contact">
              Contacter le club
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
