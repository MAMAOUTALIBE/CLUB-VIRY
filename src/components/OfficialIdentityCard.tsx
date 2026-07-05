import { PersonProfileCard } from "@/components/PersonProfileCard";
import { images } from "@/lib/images";

type OfficialIdentity = {
  name: string;
  position: string;
  department: string;
  photo: string | null;
  missionCount?: number;
};

export function OfficialIdentityCard({ href, official }: { href?: string; official: OfficialIdentity }) {
  return (
    <PersonProfileCard
      actionHref={href}
      avatarPhoto={official.photo}
      badge={official.department}
      category={official.department}
      coverImage={images.stadiumAerial}
      name={official.name}
      pole={official.department}
      role={official.position}
      stats={[
        { icon: "shield", label: "Pôle", value: 1 },
        { icon: "calendar", label: "Missions", value: Math.max(1, official.missionCount ?? 1) },
        { icon: "trophy", label: "Club", value: "Viry" }
      ]}
      tags={[official.department, "Direction"]}
    />
  );
}
