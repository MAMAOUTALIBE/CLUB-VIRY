import { Admin360Detail } from "@/components/admin/Admin360Detail";

export const metadata = {
  title: "Detail joueur CRM"
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPlayerDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
          <Admin360Detail backHref="/admin/joueurs" endpoint={`/api/admin/players/${id}`} kind="player" />
    </>
  );
}
