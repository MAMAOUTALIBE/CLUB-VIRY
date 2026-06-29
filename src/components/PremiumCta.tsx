import { Shield } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Motion";

type PremiumCtaProps = {
  eyebrow?: string;
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function PremiumCta({ eyebrow = "ES Viry-Châtillon Football", title, text, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: PremiumCtaProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 3xl:py-16">
      <Reveal>
        <div className="club-panel mx-auto grid max-w-7xl gap-6 rounded-lg p-6 text-white md:grid-cols-[1fr_auto] md:items-center sm:p-8 2xl:p-10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#f7c600]">
              <Shield size={16} aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">{text}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
            {secondaryHref && secondaryLabel ? (
              <ButtonLink href={secondaryHref} variant="outline">
                {secondaryLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
