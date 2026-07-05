import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";

type PersonCardStatIcon = "users" | "calendar" | "shield" | "trophy";

export type PersonCardStat = {
  icon?: PersonCardStatIcon;
  label: string;
  value: number | string;
};

type PersonProfileCardProps = {
  actionHref?: string;
  actionLabel?: string;
  avatarPhoto?: string | null;
  badge?: string;
  category: string;
  className?: string;
  coverImage: string;
  featured?: boolean;
  name: string;
  pole?: string;
  role: string;
  stats?: PersonCardStat[];
  tags?: string[];
};

const statIcons = {
  calendar: CalendarDays,
  shield: ShieldCheck,
  trophy: Trophy,
  users: Users
};

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

function uniqueShortItems(items: Array<string | undefined>): string[] {
  return Array.from(new Set(items.map((item) => item?.trim()).filter((item): item is string => Boolean(item))));
}

function PersonAvatar({ avatarPhoto, name }: { avatarPhoto?: string | null; name: string }) {
  if (avatarPhoto) {
    return <img src={avatarPhoto} alt={name} className="h-full w-full rounded-full object-cover object-center" />;
  }

  return (
    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#00391f]/92 text-4xl font-black uppercase text-[#f7c600]">
      {monogram(name)}
    </span>
  );
}

function CardStat({ stat }: { stat: PersonCardStat }) {
  const Icon = statIcons[stat.icon ?? "users"];

  return (
    <div className="min-w-0 text-center">
      <Icon className="mx-auto text-[#07542f]" size={24} strokeWidth={2.3} aria-hidden="true" />
      <p className="mt-1 truncate text-2xl font-black leading-none text-[#002f1d]">{stat.value}</p>
      <p className="mt-1 truncate text-[11px] font-black uppercase text-slate-500">{stat.label}</p>
    </div>
  );
}

export function PersonProfileCard({
  actionHref,
  actionLabel = "Voir la fiche & contacter",
  avatarPhoto,
  badge,
  category,
  className = "",
  coverImage,
  featured = false,
  name,
  pole,
  role,
  stats = [],
  tags = []
}: PersonProfileCardProps) {
  const visibleTags = uniqueShortItems(tags).slice(0, 2);
  const scopeItems = uniqueShortItems([category, pole]).slice(0, 2);
  const visibleStats = stats.slice(0, 3);

  return (
    <article
      className={`premium-card flex h-full flex-col overflow-hidden rounded-lg bg-white text-[#002f1d] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${
        featured ? "ring-2 ring-[#f7c600]/80" : ""
      } ${className}`}
    >
      <div className="relative h-44 overflow-hidden bg-[#002f1d] sm:h-48">
        <Image alt="" className="object-cover" fill sizes="(max-width: 768px) 100vw, 420px" src={coverImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/50 via-[#001c10]/8 to-transparent" aria-hidden="true" />
        {badge ? (
          <span className="absolute right-4 top-4 inline-flex max-w-[72%] items-center gap-2 rounded-lg bg-[#07542f] px-3 py-2 text-xs font-black uppercase text-white ring-2 ring-[#f7c600]">
            <ShieldCheck size={16} className="shrink-0 text-[#f7c600]" aria-hidden="true" />
            <span className="truncate">{badge}</span>
          </span>
        ) : null}
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#f7c600] bg-[#00391f] p-1 shadow-xl sm:h-28 sm:w-28">
          <PersonAvatar avatarPhoto={avatarPhoto} name={name} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6">
        <h2 className="line-clamp-2 text-2xl font-black uppercase leading-tight text-[#002f1d]">{name}</h2>
        <p className="mt-2 line-clamp-2 text-base font-black leading-snug text-slate-500">{role}</p>
        <span className="mt-5 h-1.5 w-20 rounded-full bg-[#f7c600]" aria-hidden="true" />

        {visibleTags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span className="rounded-lg bg-[#07542f]/8 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#07542f]" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {scopeItems.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {scopeItems.map((item, index) => (
              <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-black uppercase text-[#07542f]" key={item}>
                {index === 0 ? <Trophy size={16} className="shrink-0 text-[#f7c600]" aria-hidden="true" /> : <ShieldCheck size={16} className="shrink-0" aria-hidden="true" />}
                <span className="truncate">{item}</span>
              </span>
            ))}
          </div>
        ) : null}

        {visibleStats.length ? (
          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-200 pt-5">
            {visibleStats.map((stat) => (
              <CardStat key={`${stat.label}-${stat.value}`} stat={stat} />
            ))}
          </div>
        ) : null}

        {actionHref ? (
          <Link
            href={actionHref}
            className="focus-ring mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f7c600] px-3 py-3 text-center text-xs font-black uppercase leading-tight text-[#001c10] shadow-[0_12px_24px_rgba(247,198,0,0.22)] transition hover:bg-[#ffd83d] sm:text-[13px]"
          >
            <UserRound size={19} className="shrink-0" aria-hidden="true" />
            <span className="min-w-0">{actionLabel}</span>
            <ArrowRight size={20} className="shrink-0" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
