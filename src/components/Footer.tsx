import Link from "next/link";

const columns = [
  {
    title: "Le Club",
    links: [
      ["Histoire", "/le-club/histoire"],
      ["Mot du président", "/le-club/mot-du-president"],
      ["Organigramme", "/le-club/organigramme"],
      ["Stade", "/le-club/stade-henri-longuet"]
    ]
  },
  {
    title: "Équipes",
    links: [
      ["École de foot", "/equipes/ecole-de-foot"],
      ["Seniors", "/equipes/seniors-r1"],
      ["Féminines", "/equipes/feminines"],
      ["Futsal", "/equipes/futsal"]
    ]
  },
  {
    title: "Infos pratiques",
    links: [
      ["Inscriptions", "/inscriptions"],
      ["Détections", "/detections-recrutement"],
      ["Calendrier", "/calendrier"],
      ["Contact", "/contact"]
    ]
  },
  {
    title: "Boutique",
    links: [
      ["Tous les produits", "/boutique"],
      ["Conditions générales", "/boutique/conditions-generales"],
      ["Livraison & retour", "/boutique/livraison-retour"]
    ]
  }
];

export function Footer() {
  return (
    <footer className="club-shell border-t-4 border-[#f7c600] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr_1.4fr] lg:px-8">
        <div>
          <img className="h-[140px] w-[140px] rounded-full object-contain drop-shadow-xl" src="/club-logo.svg" alt="ES Viry-Châtillon Football" width={140} height={140} />
          <p className="mt-4 max-w-xs text-sm text-white/80">Site officiel de l'ES Viry-Châtillon Football. Jaune et Vert pour toujours.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="border-b border-[#f7c600]/35 pb-2 text-sm font-black uppercase text-[#f7c600]">{column.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link className="focus-ring hover:text-[#f7c600]" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          <div className="rounded-lg border border-[#f7c600]/35 bg-white/5 p-5">
            <p className="text-3xl font-black uppercase text-[#f7c600]">Jaune et Vert</p>
            <p className="mt-1 text-2xl italic">pour toujours !</p>
            <p className="mt-4 text-sm text-white/75">Stade Henri Longuet · Avenue de l'Armée Leclerc · 91170 Viry-Châtillon</p>
          </div>
          <div className="mt-5 flex gap-3" aria-label="Réseaux sociaux">
            {["f", "ig", "yt", "tk"].map((item) => (
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white/10 px-2 text-xs font-black uppercase" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-white/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 ES Viry-Châtillon Football - Tous droits réservés</p>
          <div className="flex flex-wrap gap-4">
            <Link className="focus-ring hover:text-[#f7c600]" href="/mentions-legales">
              Mentions légales
            </Link>
            <Link className="focus-ring hover:text-[#f7c600]" href="/politique-confidentialite">
              Politique de confidentialité
            </Link>
            <Link className="focus-ring hover:text-[#f7c600]" href="/plan-du-site">
              Plan du site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
