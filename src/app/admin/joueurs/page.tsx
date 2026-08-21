import { Admin360Explorer } from "@/components/admin/Admin360Explorer";

export const metadata = {
  title: "CRM Joueurs"
};

export default function AdminPlayersPage() {
  return (
    <>
          <Admin360Explorer
            description="Vue 360 des joueurs : identité, famille rattachée, licence, documents, paiements, équipe et suivi sportif. Créez une fiche depuis le CRM (accueil au guichet, transfert en cours de saison) et archivez celles qui ne sont plus actives — l'archivage est réversible depuis la corbeille."
            endpoint="/api/admin/players?limit=100"
            kind="players"
            title="Joueurs"
          />
    </>
  );
}
