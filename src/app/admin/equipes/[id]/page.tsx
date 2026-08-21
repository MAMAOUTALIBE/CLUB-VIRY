import { TeamRosterEditor } from "@/components/admin/modules/TeamRosterEditor";

export const metadata = {
  title: "CRM — Effectif & staff"
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminTeamRosterPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <>
          <TeamRosterEditor teamId={id} />
    </>
  );
}
