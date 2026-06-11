import type { Metadata } from "next";
import { Kaushan_Script } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const scriptFont = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ES Viry-Châtillon Football",
    template: "%s | ES Viry-Châtillon Football"
  },
  description:
    "Site officiel de l'ES Viry-Châtillon Football : actualités, équipes, inscriptions, calendrier, détections et boutique du club.",
  keywords: ["ES Viry-Châtillon", "football", "club", "Viry-Châtillon", "Essonne", "inscriptions", "école de foot"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "ES Viry-Châtillon Football",
    description: "Le site officiel de l'ES Viry-Châtillon Football : rejoignez la famille Jaune et Vert.",
    url: siteUrl,
    siteName: "ES Viry-Châtillon Football",
    locale: "fr_FR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ES Viry-Châtillon Football",
    description: "Le site officiel de l'ES Viry-Châtillon Football."
  },
  icons: {
    icon: "/club-logo.svg",
    shortcut: "/club-logo.svg"
  }
};

const sportsClubJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "ES Viry-Châtillon Football",
  sport: "Football",
  url: siteUrl,
  logo: `${siteUrl}/club-logo.svg`,
  telephone: "+33169243950",
  email: "esvirychatillon91170@gmail.com",
  foundingDate: "1958",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Stade Henri Longuet, Avenue de l'Armée Leclerc",
    addressLocality: "Viry-Châtillon",
    postalCode: "91170",
    addressCountry: "FR"
  },
  areaServed: "Viry-Châtillon"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="fr" className={scriptFont.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#f7c600] focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:uppercase focus:text-[#002f1d]"
          href="#contenu"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsClubJsonLd) }} />
      </body>
    </html>
  );
}
