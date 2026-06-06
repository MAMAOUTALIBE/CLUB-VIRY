import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ES Viry-Châtillon Football",
    template: "%s | ES Viry-Châtillon Football"
  },
  description: "Site officiel de l'ES Viry-Châtillon Football : actualités, équipes, inscriptions, calendrier et boutique.",
  icons: {
    icon: "/club-logo.svg",
    shortcut: "/club-logo.svg"
  },
  openGraph: {
    title: "ES Viry-Châtillon Football",
    description: "Un club, une ville, une passion.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    siteName: "ES Viry-Châtillon Football",
    locale: "fr_FR",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
