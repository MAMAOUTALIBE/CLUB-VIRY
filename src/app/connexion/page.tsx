import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Connexion CRM",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function ConnexionPage() {
  redirect("/");
}
