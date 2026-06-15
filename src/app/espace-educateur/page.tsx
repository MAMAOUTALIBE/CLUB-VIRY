import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Espace éducateur",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function EducatorSpacePage() {
  redirect("/admin/convocations");
}
