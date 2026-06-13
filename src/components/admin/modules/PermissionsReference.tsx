import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import { APP_ROLES } from "@/lib/auth/roles";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN_CLUB: "Admin club",
  DIRIGEANT: "Dirigeant",
  EDUCATEUR: "Éducateur",
  FAMILLE: "Famille",
  JOUEUR: "Joueur",
  MEMBRE: "Membre",
  PARTENAIRE: "Partenaire",
  VISITEUR: "Visiteur"
};

export function PermissionsReference() {
  return (
    <section className="official-card rounded-lg bg-white p-5">
      <p className="text-xs font-black uppercase text-[#07542f]">Référence</p>
      <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Permissions par rôle</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Matrice (lecture seule) des permissions accordées à chaque rôle. Le contrôle d'accès est appliqué côté serveur sur chaque route API.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {APP_ROLES.map((role) => (
          <div className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-3" key={role}>
            <p className="text-sm font-black uppercase text-[#002f1d]">{ROLE_LABELS[role] ?? role}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ROLE_PERMISSIONS[role].map((perm) => (
                <span className="rounded-full bg-[#07542f]/10 px-2 py-0.5 text-[11px] font-bold text-[#07542f]" key={perm}>
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
