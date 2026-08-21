import { Admin360Explorer } from "@/components/admin/Admin360Explorer";

export const metadata = {
  title: "CRM Joueurs"
};

export default function AdminPlayersPage() {
  return (
    <>
          <Admin360Explorer
            description="Vue 360 des joueurs : identite, famille rattachee, licence, documents, paiements, equipe et suivi sportif."
            endpoint="/api/admin/players?limit=100"
            kind="players"
            title="Joueurs"
          />
    </>
  );
}
