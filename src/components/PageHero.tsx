import type { ReactNode } from "react";
import { Reveal } from "@/components/Motion";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  description: string;
  image: string;
  children?: ReactNode;
};

export function PageHero({ title, eyebrow, description, image, children }: PageHeroProps) {
  return (
    <section
      className="image-tint stadium-grid light-sweep min-h-[390px] border-b-4 border-[#f7c600] bg-cover bg-center text-white"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div>
            {eyebrow ? <p className="text-sm font-black uppercase text-[#f7c600]">{eyebrow}</p> : null}
            <div className="gold-divider mb-5 mt-3" aria-hidden="true" />
            <h1 className="max-w-4xl text-4xl font-black uppercase leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{description}</p>
            {children ? <div className="mt-6">{children}</div> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
