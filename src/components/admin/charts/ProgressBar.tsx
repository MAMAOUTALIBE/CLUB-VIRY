"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  label: string;
  value: string;
  percent: number;
  hint?: string;
  tone?: "green" | "yellow";
};

export function ProgressBar({ label, value, percent, hint, tone = "green" }: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const fill = tone === "yellow" ? "bg-[#f7c600]" : "bg-[#07542f]";

  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-xs font-black uppercase text-slate-500">{label}</p>
        <p className="text-sm font-black text-[#002f1d]">{value}</p>
      </div>
      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={safePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} : ${value} (${safePercent}%)`}
      >
        <motion.div
          className={`h-full rounded-full ${fill}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${safePercent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {hint ? <p className="mt-2 text-xs font-bold text-slate-500">{hint}</p> : null}
    </div>
  );
}
