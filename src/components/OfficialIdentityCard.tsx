import Link from "next/link";

type OfficialIdentity = {
  name: string;
  position: string;
  department: string;
  photo: string | null;
};

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

function OfficialPortrait({ official }: { official: OfficialIdentity }) {
  if (official.photo) {
    return <img src={official.photo} alt={official.name} className="h-full w-full object-cover" />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#002f1d] text-center text-[#f7c600]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#001c10] text-lg font-black ring-2 ring-[#f7c600]">
        {monogram(official.name)}
      </span>
      <span className="mt-2 text-[10px] font-black uppercase tracking-wide">Photo à ajouter</span>
    </div>
  );
}

function OfficialCardInner({ official }: { official: OfficialIdentity }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#07542f]/12 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-[#002f1d]">
        <OfficialPortrait official={official} />
      </div>
      <div className="p-4">
        <p className="text-xs font-black uppercase text-[#664d00]">{official.department}</p>
        <h2 className="mt-1 text-lg font-black uppercase leading-tight text-[#002f1d]">{official.name}</h2>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{official.position}</p>
      </div>
    </article>
  );
}

export function OfficialIdentityCard({ href, official }: { href?: string; official: OfficialIdentity }) {
  if (href) {
    return (
      <Link href={href} className="focus-ring block rounded-lg">
        <OfficialCardInner official={official} />
      </Link>
    );
  }

  return <OfficialCardInner official={official} />;
}
