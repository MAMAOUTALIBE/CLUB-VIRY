"use client";

import { motion } from "framer-motion";

type BarChartPoint = {
  label: string;
  count: number;
};

type BarChartProps = {
  data: BarChartPoint[];
};

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(1, ...data.map((point) => point.count));

  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((point, index) => {
        const heightPercent = Math.round((point.count / max) * 100);

        return (
          <div className="flex flex-1 flex-col items-center gap-2" key={`${point.label}-${index}`}>
            <span className="text-xs font-black text-[#002f1d]">{point.count}</span>
            <div className="flex h-28 w-full items-end">
              <motion.div
                className="w-full rounded-t-md bg-gradient-to-t from-[#07542f] to-[#0a7a45]"
                initial={{ height: 0 }}
                whileInView={{ height: `${Math.max(4, heightPercent)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.05 }}
                aria-label={`${point.label} : ${point.count}`}
              />
            </div>
            <span className="text-xs font-bold uppercase text-slate-500">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
