import { Download } from "lucide-react";
import { Admin360Explorer } from "@/components/admin/Admin360Explorer";

export const metadata = {
  title: "CRM Inscriptions"
};

export default function AdminRegistrationsPage() {
  return (
    <>
          <div className="mb-4 flex justify-end">
            <a
              href="/api/admin/exports/registrations"
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#002f1d]/20 bg-white px-4 py-2 text-xs font-black uppercase text-[#002f1d] transition-colors hover:border-[#f7c600]"
            >
              <Download size={16} aria-hidden="true" /> Exporter CSV
            </a>
          </div>
          <Admin360Explorer
            description="Vue 360 des dossiers : statut, joueur, famille, documents, paiement, validation et affectation equipe."
            endpoint="/api/admin/registrations?limit=100"
            kind="registrations"
            title="Inscriptions"
          />
    </>
  );
}
