type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  inverse?: boolean;
  centered?: boolean;
};

export function SectionTitle({ eyebrow, title, text, inverse = false, centered = false }: SectionTitleProps) {
  return (
    <div className={`mb-8 ${centered ? "mx-auto max-w-3xl text-center" : ""}`}>
      {eyebrow ? <p className="text-sm font-black uppercase text-[#f7c600]">{eyebrow}</p> : null}
      <div className={`gold-divider mb-3 mt-2 ${centered ? "mx-auto" : ""}`} aria-hidden="true" />
      <h2 className={`text-3xl font-black uppercase sm:text-4xl ${inverse ? "text-white" : "text-[#002f1d]"}`}>{title}</h2>
      {text ? <p className={`mt-3 max-w-3xl text-base leading-7 ${inverse ? "text-white/80" : "text-slate-700"}`}>{text}</p> : null}
    </div>
  );
}
