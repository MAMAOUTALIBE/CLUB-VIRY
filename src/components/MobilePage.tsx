import Link from "next/link";
import type { ReactNode } from "react";

type MobileAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type MobileScreenProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: MobileAction[];
  children: ReactNode;
  scrollable?: boolean;
};

export function MobileScreen({ actions = [], children, description, eyebrow, scrollable = false, title }: MobileScreenProps) {
  return (
    <section className="flex h-[calc(100dvh_-_var(--header-h))] min-h-[calc(100dvh_-_var(--header-h))] flex-col overflow-hidden bg-[#f7f8f4] px-4 py-4 md:px-6 md:py-5 lg:px-8 xl:hidden">
      <div className="mx-auto w-full max-w-5xl shrink-0">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-wide text-[#664d00]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-[2rem] font-black uppercase leading-[0.98] text-[#002f1d] md:text-4xl lg:text-5xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-base font-semibold leading-6 text-slate-700 md:text-lg md:leading-7">{description}</p> : null}
      </div>

      <div className={`mx-auto mt-4 min-h-0 w-full max-w-5xl flex-1 md:mt-5 ${scrollable ? "overflow-y-auto overscroll-contain pr-1" : "overflow-hidden"}`}>{children}</div>

      {actions.length ? (
        <div className="mx-auto mt-4 grid w-full max-w-5xl shrink-0 gap-2 md:grid-cols-2 lg:max-w-4xl">
          {actions.map((action) => (
            <Link
              className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-md px-4 text-sm font-black uppercase ${
                action.variant === "secondary"
                  ? "border border-[#07542f]/20 bg-white text-[#07542f]"
                  : "bg-[#f7c600] text-[#001c10] shadow-[0_12px_24px_rgba(247,198,0,0.2)]"
              }`}
              href={action.href}
              key={`${action.label}-${action.href}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function MobileCard({ children }: { children: ReactNode }) {
  return <article className="rounded-lg border border-[#07542f]/12 bg-white p-4 shadow-sm md:p-5 lg:p-6">{children}</article>;
}

export function MobileLinkCard({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link className="focus-ring block rounded-lg border border-[#07542f]/12 bg-white p-4 shadow-sm md:p-5 lg:p-6" href={href}>
      {children}
    </Link>
  );
}

export function MobileScrollableList({ children }: { children: ReactNode }) {
  return <div className="grid max-h-full gap-3 overflow-y-auto overscroll-contain pr-1 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  return <div className="hidden xl:block">{children}</div>;
}
