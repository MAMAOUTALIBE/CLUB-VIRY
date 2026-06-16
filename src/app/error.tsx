"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center">
      <p className="text-sm font-black uppercase text-[#664d00]">Erreur</p>
      <h1 className="mt-2 text-4xl font-black uppercase text-[#002f1d]">Une erreur est survenue</h1>
      <p className="mt-4 text-slate-700">Merci de réessayer ou de contacter le club si le problème persiste.</p>
      <button className="focus-ring mt-8 rounded-md bg-[#002f1d] px-5 py-3 font-black uppercase text-white" onClick={reset} type="button">
        Réessayer
      </button>
    </section>
  );
}
