import type { DisplayOfficial } from "@/lib/public-content";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

export function OfficialCard({ official, featured = false }: { official: DisplayOfficial; featured?: boolean }) {
  const { name, position, photo } = official;
  const avatarSize = featured ? "h-24 w-24" : "h-16 w-16";

  return (
    <article className="official-card flex flex-col items-center rounded-2xl bg-white p-6 text-center text-[#002f1d] shadow-lg">
      {photo ? (
        <img src={photo} alt={name} className={`${avatarSize} rounded-full object-cover ring-2 ring-[#f7c600]`} />
      ) : (
        <span
          className={`${avatarSize} flex items-center justify-center rounded-full bg-[#07542f] text-xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]`}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      <h3 className={`mt-4 font-black uppercase leading-tight ${featured ? "text-xl" : "text-lg"}`}>{name}</h3>
      <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#07542f]">{position}</p>
    </article>
  );
}
