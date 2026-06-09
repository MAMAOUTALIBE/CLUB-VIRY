"use client";

import { motion } from "framer-motion";

type StatusDatum = {
  status: string;
  label: string;
  count: number;
};

type StatusBarChartProps = {
  data: StatusDatum[];
  hideEmpty?: boolean;
};

// Couleur par famille de statut (cohérente entre inscriptions, commandes, paiements...).
function colorForStatus(status: string): string {
  const positive = ["VALIDATED", "PAID", "SUCCEEDED", "ACCEPTED", "DELIVERED"];
  const progress = ["SUBMITTED", "IN_REVIEW", "PENDING", "PREPARING", "READY", "CONTACTED", "TRIAL_SCHEDULED"];
  const negative = ["REJECTED", "FAILED", "CANCELLED"];
  const warning = ["MISSING_DOCUMENTS"];

  if (positive.includes(status)) {
    return "bg-[#07542f]";
  }
  if (warning.includes(status)) {
    return "bg-[#ea8c00]";
  }
  if (progress.includes(status)) {
    return "bg-[#f7c600]";
  }
  if (negative.includes(status)) {
    return "bg-[#d4382f]";
  }
  return "bg-slate-400";
}

export function StatusBarChart({ data, hideEmpty = true }: StatusBarChartProps) {
  const rows = hideEmpty ? data.filter((datum) => datum.count > 0) : data;
  const visible = rows.length > 0 ? rows : data;
  const max = Math.max(1, ...visible.map((datum) => datum.count));

  return (
    <div className="grid gap-3">
      {visible.map((datum, index) => {
        const widthPercent = Math.round((datum.count / max) * 100);

        return (
          <div className="grid grid-cols-[140px_1fr_2.5rem] items-center gap-3" key={datum.status}>
            <span className="truncate text-xs font-black uppercase text-slate-600">{datum.label}</span>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full ${colorForStatus(datum.status)}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${datum.count === 0 ? 0 : Math.max(6, widthPercent)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.04 }}
                aria-label={`${datum.label} : ${datum.count}`}
              />
            </div>
            <span className="text-right text-sm font-black text-[#002f1d]">{datum.count}</span>
          </div>
        );
      })}
    </div>
  );
}
