import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center">
      <p className="text-sm font-black uppercase text-[#664d00]">Erreur 404</p>
      <h1 className="mt-2 text-4xl font-black uppercase text-[#002f1d]">Page introuvable</h1>
      <p className="mt-4 text-slate-700">La page demandée n'existe pas ou a été déplacée.</p>
      <Link className="focus-ring mt-8 inline-flex rounded-md bg-[#002f1d] px-5 py-3 font-black uppercase text-white" href="/">
        Retour à l'accueil
      </Link>
    </section>
  );
}
