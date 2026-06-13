import { Bell, CalendarDays, Camera, CheckCircle2, Megaphone, Trophy, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Rule = { icon: LucideIcon; event: string; action: string; audience: string };

const RULES: Rule[] = [
  { icon: Trophy, event: "Convocation enregistrée", action: "Notification (in-app + email)", audience: "Tuteurs des joueurs convoqués" },
  { icon: CalendarDays, event: "Séance créée ou annulée", action: "Notification (in-app + email)", audience: "Familles de l'équipe" },
  { icon: Camera, event: "Média rattaché à une équipe", action: "Notification « nouvelle photo/vidéo »", audience: "Familles de l'équipe" },
  { icon: Megaphone, event: "Actualité publiée et ciblée", action: "Notification « nouvelle actualité »", audience: "Familles de l'équipe ciblée" },
  { icon: UserPlus, event: "Inscription validée", action: "Création automatique d'un abonnement FAMILLE", audience: "Parent ayant soumis le dossier" },
  { icon: Bell, event: "Notification email en file", action: "Envoi via provider (Brevo) ou webhook", audience: "Destinataire opt-in" }
];

export function AutomationsAdmin() {
  return (
    <section className="official-card rounded-lg bg-white p-5">
      <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Automatisations</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Le CRM agit comme un assistant : certains événements déclenchent automatiquement des actions, en respectant les préférences de notification
        de chaque destinataire. Voici les règles actives.
      </p>
      <div className="mt-4 grid gap-3">
        {RULES.map((rule) => {
          const Icon = rule.icon;
          return (
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-4" key={rule.event}>
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07542f]/10 text-[#07542f]" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[#002f1d]">
                  {rule.event} <span className="text-slate-400">→</span> {rule.action}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-600">Destinataires : {rule.audience}</p>
              </div>
              <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 size={12} aria-hidden="true" /> Active
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
