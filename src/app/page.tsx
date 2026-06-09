import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Flag, HeartHandshake, MapPin, Shield, Trophy, Users } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { SectionTitle } from "@/components/SectionTitle";
import { clubStats, matches, news, partners, teams, values } from "@/lib/data";
import { images } from "@/lib/images";

export default function HomePage() {
  const leadNews = news[0];
  const sideNews = news.slice(1, 4);
  const pathways = [
    ["École de foot", "U6 à U11", "Découvrir, apprendre, aimer le jeu."],
    ["Préformation", "U12 à U13", "Construire les repères et l'exigence."],
    ["Formation", "U14 à U18", "Préparer les joueurs au niveau régional."],
    ["Seniors", "R1 / R3 / D1", "Porter le club avec ambition."]
  ];
  const quickActions = [
    { label: "Inscriptions", href: "/inscriptions", icon: Users, text: "Rejoindre le club" },
    { label: "Détections", href: "/detections-recrutement", icon: Flag, text: "Montrer son talent" },
    { label: "Calendrier", href: "/calendrier", icon: CalendarDays, text: "Suivre les matchs" },
    { label: "Partenaires", href: "/partenaires", icon: HeartHandshake, text: "Associer son image" }
  ];

  const nextMatch = matches[0];
  const otherMatches = matches.slice(1);
  const isClub = (name: string) => name.toLowerCase().includes("viry");
  const teamInitials = (name: string) =>
    name
      .replace(/^ES\s+/i, "")
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  const shortTeam = (name: string) => (isClub(name) ? "ES Viry" : name);
  const crest = (name: string, size: "sm" | "lg") => {
    const dim = size === "lg" ? "h-16 w-16 sm:h-[84px] sm:w-[84px]" : "h-9 w-9";
    return isClub(name) ? (
      <img
        src="/club-logo.svg"
        alt=""
        aria-hidden="true"
        className={`${dim} shrink-0 rounded-full object-contain ring-2 ring-[#f7c600]/40`}
        width={84}
        height={84}
      />
    ) : (
      <span
        aria-hidden="true"
        className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f7c600] to-[#ffd84d] font-black text-[#002f1d] ring-2 ring-white/15 ${
          size === "lg" ? "text-lg sm:text-2xl" : "text-[11px]"
        }`}
      >
        {teamInitials(name)}
      </span>
    );
  };

  return (
    <>
      {/* Préchargement prioritaire de l'image du hero (LCP) */}
      <link rel="preload" as="image" href={images.stadiumHero} fetchPriority="high" />
      <section
        className="hero-stadium image-tint relative isolate flex min-h-[640px] flex-col overflow-hidden border-b border-[#f7c600]/35 bg-cover bg-center text-white lg:h-[calc(100svh-var(--header-h))] lg:min-h-0"
        style={{ backgroundImage: `url(${images.stadiumHero})`, backgroundPosition: "center 90%" }}
      >
        {/* Contenu principal (centré, occupe l'espace disponible) */}
        <div className="relative z-[2] mx-auto flex w-full max-w-[1720px] flex-1 items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <Reveal>
              <div>
                <h1 className="max-w-4xl">
                  <span className="font-script block text-6xl leading-[1.05] text-[#f7c600] drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl">
                    Une passion
                  </span>
                  <span className="font-script -mt-1 block pl-6 text-6xl leading-[1.05] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-8xl">
                    notre force
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg">
                  Porté par un nouveau bureau nouvellement nommé, notre club ouvre un nouveau chapitre.
                </p>
                <div className="mt-4 h-1 w-24 rounded-full bg-[#f7c600]" />
                <div className="mt-7 flex flex-wrap gap-4">
                  <Link className="focus-ring inline-flex items-center gap-4 rounded-lg bg-[#f7c600] px-7 py-3.5 text-sm font-black uppercase text-[#001c10] shadow-[0_18px_34px_rgba(247,198,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white" href="/le-club">
                    Découvrir le club
                    <ArrowRight size={22} aria-hidden="true" />
                  </Link>
                  <Link className="focus-ring inline-flex items-center gap-4 rounded-lg border border-white/70 bg-black/10 px-7 py-3.5 text-sm font-black uppercase text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600]" href="/equipes">
                    Nos équipes
                    <ArrowRight size={22} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="hidden justify-center lg:flex">
              <div className="relative min-h-[300px] w-full max-w-[600px]">
                <div className="absolute left-1/2 top-0 h-[210px] w-[210px] -translate-x-1/2 rounded-full bg-[#f7c600]/20 blur-3xl" aria-hidden="true" />
                <img className="absolute left-1/2 top-0 h-[210px] w-[210px] -translate-x-1/2 rounded-full object-contain drop-shadow-2xl 2xl:h-[250px] 2xl:w-[250px]" src="/club-logo.svg" alt="ES Viry-Châtillon Football" width={250} height={250} />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Barre statistiques : tout en bas du hero, compacte, une seule ligne par carte */}
        <div className="relative z-[2] mx-auto w-full max-w-[1560px] shrink-0 px-4 pb-4 sm:px-6 lg:px-8 lg:pb-5">
          <Stagger
            aria-label="Chiffres clés du club"
            className="grid overflow-hidden rounded-xl border border-white/15 bg-[#00150d]/75 shadow-[0_22px_55px_rgba(0,18,11,0.5)] ring-1 ring-[#f7c600]/10 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5"
          >
            {clubStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <StaggerItem
                  className="flex items-center gap-2.5 border-b border-white/10 px-4 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:py-3"
                  key={stat.label}
                >
                  <Icon className="shrink-0 text-[#f7c600]" size={26} strokeWidth={1.9} aria-hidden="true" />
                  <p className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-xl font-black leading-none text-white lg:text-2xl">{stat.value}</span>
                    <span className="truncate text-[11px] font-black uppercase tracking-wide text-white/80">{stat.label}</span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

	      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
	        <Stagger className="grid overflow-hidden rounded-2xl border border-[#002f1d]/10 bg-white shadow-[0_20px_55px_rgba(0,31,19,0.12)] md:grid-cols-2 xl:grid-cols-4">
	          {quickActions.map((action) => {
	            const Icon = action.icon;
	            return (
	              <StaggerItem key={action.label}>
	                <Link className="focus-ring flex min-h-28 items-center gap-4 border-b border-[#002f1d]/10 p-5 transition hover:bg-[#f7c600]/10 md:border-r xl:border-b-0" href={action.href}>
	                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#002f1d] text-[#f7c600]">
	                    <Icon size={25} aria-hidden="true" />
	                  </div>
	                  <div>
	                    <p className="text-[11px] font-black uppercase tracking-wide text-[#8a6d00]">Accès rapide</p>
	                    <h2 className="mt-1 text-xl font-black uppercase leading-none text-[#002f1d]">{action.label}</h2>
	                    <p className="mt-2 text-sm font-bold text-slate-600">{action.text}</p>
	                  </div>
	                </Link>
	              </StaggerItem>
	            );
	          })}
	        </Stagger>
	      </section>
	
	      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="club-panel overflow-hidden rounded-2xl text-white">
          <div className="grid min-h-full lg:grid-cols-[1fr_0.82fr]">
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#f7c600]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f7c600]" />
                    Matchday
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase leading-tight">Prochain rendez-vous</h2>
                </div>
                <span className="shrink-0 rounded-full border border-[#f7c600]/40 bg-[#f7c600]/10 px-3 py-1 text-[11px] font-black uppercase text-[#f7c600]">
                  {isClub(nextMatch.home) ? "À domicile" : "À l'extérieur"}
                </span>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[#f7c600]">{nextMatch.team}</span>
              </div>

              <div className="mt-5 rounded-2xl border border-white/12 bg-black/20 p-5 sm:p-6">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  <div className="flex flex-col items-center gap-3 text-center">
                    {crest(nextMatch.home, "lg")}
                    <span className="text-sm font-black uppercase leading-tight sm:text-base">{shortTeam(nextMatch.home)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7c600] text-sm font-black text-[#002f1d] shadow-[0_0_28px_rgba(247,198,0,0.55)]">
                      VS
                    </span>
                    <span className="mt-2 text-xs font-black uppercase tracking-wide text-white/65">{nextMatch.time}</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    {crest(nextMatch.away, "lg")}
                    <span className="text-sm font-black uppercase leading-tight sm:text-base">{shortTeam(nextMatch.away)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 text-sm font-bold text-white/85 sm:grid-cols-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] p-3">
                  <CalendarDays className="shrink-0 text-[#f7c600]" size={18} aria-hidden="true" />
                  {nextMatch.date}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] p-3">
                  <Clock className="shrink-0 text-[#f7c600]" size={18} aria-hidden="true" />
                  Coup d'envoi · {nextMatch.time}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.07] p-3 sm:col-span-2">
                  <MapPin className="shrink-0 text-[#f7c600]" size={18} aria-hidden="true" />
                  {nextMatch.place}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/calendrier">Voir le calendrier</ButtonLink>
                <ButtonLink href="/equipes/seniors-r1" variant="outline">
                  Fiche équipe
                </ButtonLink>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#00120b]/40 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f7c600]">Autres matchs</p>
              <div className="mt-4 space-y-3">
                {otherMatches.map((match) => (
                  <article
                    className="group rounded-xl border border-white/10 bg-white/[0.06] p-4 transition hover:-translate-y-0.5 hover:border-[#f7c600]/40 hover:bg-white/[0.1]"
                    key={match.team + "-" + match.away}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[#f7c600]/15 px-2 py-0.5 text-[11px] font-black uppercase text-[#f7c600]">
                        {match.team}
                      </span>
                      <span className="text-[11px] font-black uppercase text-white/60">{match.time}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm font-bold">
                      {crest(match.home, "sm")}
                      <span className="min-w-0 flex-1 truncate">{shortTeam(match.home)}</span>
                      <span className="shrink-0 text-xs font-black uppercase text-[#f7c600]">vs</span>
                      <span className="min-w-0 flex-1 truncate text-right">{shortTeam(match.away)}</span>
                      {crest(match.away, "sm")}
                    </div>
                    <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-white/55">
                      <CalendarDays className="shrink-0 text-[#f7c600]/80" size={13} aria-hidden="true" />
                      {match.date} · {match.place}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
	
	        <div className="grid gap-6">
	          <article className="official-card overflow-hidden rounded-2xl bg-white">
	            <div className="grid sm:grid-cols-[0.95fr_1.05fr]">
	              <img decoding="async" loading="lazy" alt={leadNews.title} className="h-64 w-full object-cover sm:h-full" src={leadNews.image} />
	              <div className="p-6">
	                <p className="text-xs font-black uppercase text-[#8a6d00]">
	                  {leadNews.category} · {leadNews.date}
	                </p>
	                <h2 className="mt-2 text-3xl font-black uppercase leading-tight text-[#002f1d]">{leadNews.title}</h2>
	                <p className="mt-3 text-sm leading-6 text-slate-700">{leadNews.excerpt}</p>
	                <div className="mt-5">
	                  <ButtonLink href="/actualites" variant="dark">
	                    Voir les actualités
	                  </ButtonLink>
	                </div>
	              </div>
	            </div>
	          </article>
	
	          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_42px_rgba(0,31,19,0.08)]">
	            <div className="flex items-start justify-between gap-4">
	              <div>
	                <p className="text-xs font-black uppercase text-[#8a6d00]">Club</p>
	                <h2 className="text-2xl font-black uppercase text-[#002f1d]">À suivre</h2>
	              </div>
	              <Link className="focus-ring text-xs font-black uppercase text-[#002f1d] hover:text-[#f7c600]" href="/actualites">
	                Tout voir
	              </Link>
	            </div>
	            <div className="mt-5 grid gap-3">
	              {sideNews.map((item) => (
	                <article className="grid grid-cols-[82px_1fr] gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-[#f7c600]/60 hover:bg-[#f7c600]/5" key={item.title}>
	                  <img decoding="async" loading="lazy" alt={item.title} className="h-20 w-20 rounded-lg object-cover" src={item.image} />
	                  <div>
	                    <p className="text-[11px] font-black uppercase text-[#8a6d00]">{item.date}</p>
	                    <h3 className="mt-1 font-black uppercase leading-tight text-[#002f1d]">{item.title}</h3>
	                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.excerpt}</p>
	                  </div>
	                </article>
	              ))}
	            </div>
	          </div>
	        </div>
	      </section>

	      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
	        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
	          <SectionTitle
	            eyebrow="Projet sportif"
	            text="Un parcours clair pour progresser, être accompagné et porter les couleurs du club à chaque âge."
	            title="Une école de football structurée"
	          />
	          <div className="flex gap-3 pb-2">
	            <ButtonLink href="/equipes" variant="dark">Voir les équipes</ButtonLink>
	          </div>
	        </div>
	        <div className="grid overflow-hidden rounded-2xl border border-[#002f1d]/10 bg-white shadow-[0_24px_70px_rgba(0,31,19,0.14)] lg:grid-cols-[0.88fr_1.12fr]">
	          <div
	            className="image-tint min-h-[420px] bg-cover bg-center"
	            style={{ backgroundImage: `url(${images.training})` }}
	            aria-label="Entraînement football"
	          >
	            <div className="flex h-full min-h-[420px] flex-col justify-end p-6 text-white sm:p-8">
	              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#f7c600]">Club formateur</p>
	              <h2 className="mt-3 max-w-md text-4xl font-black uppercase leading-tight">Former des joueurs, construire des citoyens</h2>
	              <div className="mt-6 grid gap-3 sm:grid-cols-3">
	                {["Plaisir", "Exigence", "Progression"].map((item) => (
	                  <span className="rounded-full border border-[#f7c600]/45 bg-black/25 px-4 py-2 text-center text-xs font-black uppercase backdrop-blur" key={item}>
	                    {item}
	                  </span>
	                ))}
	              </div>
	            </div>
	          </div>
	          <div className="club-panel p-5 text-white sm:p-7">
	            <div className="grid gap-4">
	              {pathways.map(([title, category, text], index) => (
	                <article className="group grid gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-[#f7c600]/60 hover:bg-white/[0.09] sm:grid-cols-[72px_1fr_auto]" key={title}>
	                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7c600] text-xl font-black text-[#002f1d] shadow-[0_12px_28px_rgba(247,198,0,0.22)]">
	                    {index + 1}
	                  </div>
	                  <div>
	                    <p className="text-xs font-black uppercase tracking-wide text-[#f7c600]">{category}</p>
	                    <h3 className="mt-1 text-2xl font-black uppercase leading-tight">{title}</h3>
	                    <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
	                  </div>
	                  <ArrowRight className="hidden self-center text-[#f7c600] transition group-hover:translate-x-1 sm:block" size={24} aria-hidden="true" />
	                </article>
	              ))}
	            </div>
	            <div className="mt-5 rounded-2xl border border-[#f7c600]/35 bg-[#00120b]/40 p-4">
	              <p className="text-sm font-bold leading-6 text-white/80">
	                Chaque joueur doit comprendre son chemin : apprendre, progresser, s'engager, puis représenter Viry avec fierté.
	              </p>
	            </div>
	          </div>
	        </div>
	      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div
          className="image-tint grid min-h-[380px] overflow-hidden rounded-lg bg-cover bg-center text-white lg:grid-cols-[1fr_0.85fr]"
          style={{ backgroundImage: `url(${images.youthTeam})` }}
        >
          <div className="flex flex-col justify-end p-6 sm:p-8">
            <p className="text-sm font-black uppercase text-[#f7c600]">Inscriptions 2025 / 2026</p>
            <h2 className="mt-2 max-w-2xl text-4xl font-black uppercase leading-tight sm:text-5xl">Rejoignez la famille Viry !</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">École de foot, préformation, formation, compétitions : il y a une place pour chacun.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <ButtonLink href="/inscriptions">Je m'inscris en ligne</ButtonLink>
              <ButtonLink href="/detections-recrutement" variant="outline">
                Détections
              </ButtonLink>
            </div>
          </div>
          <div className="hidden items-end justify-center p-8 lg:flex">
            <div className="rounded-lg border border-[#f7c600]/35 bg-[#001c10]/65 p-5 text-center backdrop-blur">
              <Trophy className="mx-auto text-[#f7c600]" size={54} aria-hidden="true" />
              <p className="mt-3 text-xl font-black uppercase">Former aujourd'hui</p>
              <p className="text-sm text-white/75">Préparer demain</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Partenaires"
              text="Un club sérieux, stable et ambitieux : associez votre image à un acteur majeur du territoire."
              title="Ils accompagnent le projet"
            />
            <div className="pb-8">
              <ButtonLink href="/partenaires" variant="dark">
                Devenir partenaire
              </ButtonLink>
            </div>
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partners.slice(0, 8).map((partner) => (
              <StaggerItem className="premium-card rounded-md px-4 py-5 text-center text-sm font-black uppercase text-[#002f1d]" key={partner}>
                {partner}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-[#f7f8f4] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle centered eyebrow="Équipes" title="Une famille, plusieurs ambitions" text="Chaque catégorie porte le même blason, avec un accompagnement adapté à son âge et à son niveau." />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.slice(0, 3).map((team) => (
              <StaggerItem className="premium-card overflow-hidden rounded-lg bg-white" key={team.slug}>
                <img decoding="async" loading="lazy" alt={team.name} className="h-52 w-full object-cover" src={team.image} />
                <div className="p-5">
                  <p className="text-xs font-black uppercase text-[#8a6d00]">{team.category}</p>
                  <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{team.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{team.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="club-shell py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos valeurs"
            inverse
            text="Des repères simples pour grandir ensemble, sur le terrain et autour du terrain."
            title="L'esprit du club"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article className="rounded-lg border border-[#f7c600]/35 bg-white/5 p-5" key={value.title}>
                  <Icon className="text-[#f7c600]" size={38} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black uppercase text-white">{value.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{value.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
