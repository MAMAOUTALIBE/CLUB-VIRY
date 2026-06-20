import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function getUrlOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function getRemotePattern(value: string | undefined): RemotePattern | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (url.hostname.endsWith(".supabase.co")) {
      return null;
    }

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {})
    };
  } catch {
    return null;
  }
}

const supabaseOrigin = getUrlOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseCspSources = ["https://*.supabase.co", ...(supabaseOrigin ? [supabaseOrigin] : [])].join(" ");
const supabaseRemotePattern = getRemotePattern(process.env.NEXT_PUBLIC_SUPABASE_URL);

// CSP volontairement compatible avec le rendu statique (sans nonce) :
// protège contre le clickjacking, l'injection d'objets et de base href,
// tout en autorisant ce dont Next.js / next-font / la carte Google ont besoin.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `img-src 'self' data: blob: https://images.unsplash.com https://maps.gstatic.com https://*.googleusercontent.com ${supabaseCspSources}`,
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `connect-src 'self' https://images.unsplash.com ${supabaseCspSources}`,
  "frame-src https://www.google.com https://maps.google.com",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" }
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // AVIF en premier (poids ~20-30% < WebP), WebP en repli. Sert les <Image> en formats modernes.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        // Stockage Supabase (photos d'équipes / galerie stade téléversées via le CRM).
        protocol: "https",
        hostname: "*.supabase.co"
      },
      ...(supabaseRemotePattern ? [supabaseRemotePattern] : [])
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
