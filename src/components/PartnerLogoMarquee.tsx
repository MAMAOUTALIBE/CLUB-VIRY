import type { CSSProperties } from "react";

export type PartnerLogo = {
  name: string;
  logo?: string | null;
  alt: string;
};

type PartnerLogoMarqueeProps = {
  partners: readonly PartnerLogo[];
};

function PartnerLogoItem({ partner }: { partner: PartnerLogo }) {
  return (
    <span className="inline-flex h-20 w-40 shrink-0 items-center justify-center sm:h-24 sm:w-52 lg:w-60" title={partner.name}>
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.alt}
          className="block max-h-10 w-auto max-w-[8.5rem] object-contain sm:max-h-12 sm:max-w-[11rem] lg:max-h-14 lg:max-w-[13rem]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="max-w-[10rem] truncate text-center text-base font-black uppercase text-[#002f1d]/80 sm:max-w-[13rem] sm:text-lg">
          {partner.name}
        </span>
      )}
    </span>
  );
}

export function PartnerLogoMarquee({ partners }: PartnerLogoMarqueeProps) {
  if (partners.length === 0) return null;

  const repeatCount = partners.length < 7 ? 4 : 2;
  const repeatedPartners = Array.from({ length: repeatCount }, () => partners).flat();
  const marqueeStyle = {
    "--partners-marquee-duration": repeatCount === 4 ? "56s" : "28s"
  } as CSSProperties;

  return (
    <div className="partners-marquee relative mt-12 min-h-28 overflow-hidden py-4 sm:mt-14 sm:min-h-32 sm:py-6" aria-label="Partenaires du club">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white via-white/95 to-transparent sm:w-24 lg:w-32" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white via-white/95 to-transparent sm:w-24 lg:w-32" aria-hidden="true" />

      <div className="partners-marquee__track flex w-max flex-nowrap items-center gap-8 whitespace-nowrap sm:gap-12 lg:gap-16" style={marqueeStyle} aria-hidden="true">
        {repeatedPartners.map((partner, index) => (
          <PartnerLogoItem key={`${partner.logo}-${index}`} partner={partner} />
        ))}
      </div>

      <ul className="sr-only">
        {partners.map((partner) => (
          <li key={partner.name}>{partner.name}</li>
        ))}
      </ul>
    </div>
  );
}
