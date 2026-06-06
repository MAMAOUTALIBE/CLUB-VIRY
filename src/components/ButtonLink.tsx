import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "dark";
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const variants = {
    primary: "bg-[#f7c600] text-[#002f1d] shadow-[0_10px_24px_rgba(247,198,0,0.25)] hover:bg-white",
    outline: "border border-[#f7c600] text-white hover:bg-[#f7c600] hover:text-[#002f1d]",
    dark: "bg-[#002f1d] text-white shadow-[0_10px_24px_rgba(0,47,29,0.18)] hover:bg-[#064126]"
  };

  return (
    <Link
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black uppercase tracking-normal transition duration-200 hover:-translate-y-0.5 ${variants[variant]}`}
      href={href}
    >
      {children}
      <ChevronRight size={16} aria-hidden="true" />
    </Link>
  );
}
