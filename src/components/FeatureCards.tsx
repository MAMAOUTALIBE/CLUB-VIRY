import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/Motion";

type FeatureCardsProps = {
  items: Array<{
    title: string;
    text: string;
    icon: LucideIcon;
  }>;
  inverse?: boolean;
};

export function FeatureCards({ items, inverse = false }: FeatureCardsProps) {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <StaggerItem className={`${inverse ? "border border-white/15 bg-white/5 text-white" : "premium-card bg-white"} rounded-lg p-5`} key={item.title}>
            <Icon className="text-[#f7c600]" size={34} aria-hidden="true" />
            <h3 className={`mt-4 text-xl font-black uppercase ${inverse ? "text-white" : "text-[#002f1d]"}`}>{item.title}</h3>
            <p className={`mt-2 text-sm leading-6 ${inverse ? "text-white/75" : "text-slate-700"}`}>{item.text}</p>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
