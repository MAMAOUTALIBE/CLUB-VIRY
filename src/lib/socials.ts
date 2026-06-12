// Réseaux sociaux du club — icônes de marque (SVG) réutilisées par le header et le footer.
// Renseigner `href` avec les vraies URLs des comptes du club pour activer les liens.
// Tant que `href` est vide, l'icône reste décorative (pas de lien mort vers "#").
export type SocialItem = {
  label: string;
  href: string;
  background: string;
  borderColor: string;
  color: string;
  viewBox: string;
  path: string;
};

// Un lien social n'est rendu cliquable que si une vraie URL est fournie.
export function isLiveSocial(item: SocialItem): boolean {
  return /^(https?:|mailto:|tel:)/.test(item.href.trim());
}

export const socialItems: SocialItem[] = [
  {
    label: "Facebook",
    href: "",
    background: "#ffffff",
    borderColor: "#1877f2",
    color: "#1877f2",
    viewBox: "0 0 24 24",
    path: "M14.2 8.4V6.7c0-.8.3-1.2 1.3-1.2h1.6V2.3c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.8H7.3v3.6h2.9V22h3.7v-9.9h2.9l.5-3.6h-3.1Z"
  },
  {
    label: "Instagram",
    href: "",
    background: "linear-gradient(135deg, #f58529 0%, #dd2a7b 45%, #8134af 72%, #515bd4 100%)",
    borderColor: "#dd2a7b",
    color: "#ffffff",
    viewBox: "0 0 24 24",
    path: "M7.8 2.5h8.4c3 0 5.3 2.3 5.3 5.3v8.4c0 3-2.3 5.3-5.3 5.3H7.8c-3 0-5.3-2.3-5.3-5.3V7.8c0-3 2.3-5.3 5.3-5.3Zm0 2C5.9 4.5 4.5 5.9 4.5 7.8v8.4c0 1.9 1.4 3.3 3.3 3.3h8.4c1.9 0 3.3-1.4 3.3-3.3V7.8c0-1.9-1.4-3.3-3.3-3.3H7.8Zm4.2 3.3a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm0 2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm5-2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
  },
  {
    label: "YouTube",
    href: "",
    background: "#ffffff",
    borderColor: "#ff0033",
    color: "#ff0033",
    viewBox: "0 0 24 24",
    path: "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4h-.1s-3.7 0-6.6.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2 8.9 2 10.7v1.6c0 1.8.4 3.5.4 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 7.4.2 7.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.4-1.8.4-3.5v-1.6c0-1.8-.4-3.5-.4-3.5ZM10 14.7V8.8l5.7 3-5.7 2.9Z"
  },
  {
    label: "TikTok",
    href: "",
    background: "#ffffff",
    borderColor: "#25f4ee",
    color: "#050505",
    viewBox: "0 0 24 24",
    path: "M16.7 2.5c.3 2.6 1.8 4.2 4.3 4.4v3.4c-1.5.1-2.8-.3-4.2-1.1v6.3c0 3.2-2 5.9-5.2 6.4-4.1.6-7.5-2.6-7.2-6.7.2-3.4 3-6 6.4-6.1.4 0 .8 0 1.2.1v3.6c-.4-.1-.8-.2-1.2-.1-1.7.1-3 1.5-2.9 3.2.1 1.6 1.5 2.8 3.1 2.7 1.7-.1 2.8-1.4 2.8-3.2V2.5h3.9Z"
  },
  {
    label: "WhatsApp",
    href: "",
    background: "#25d366",
    borderColor: "#25d366",
    color: "#ffffff",
    viewBox: "0 0 24 24",
    path: "M12 2.1A9.8 9.8 0 0 0 2.2 11.9c0 1.7.4 3.3 1.2 4.8L2 22l5.5-1.4a9.8 9.8 0 0 0 4.6 1.2h.1A9.8 9.8 0 0 0 12 2.1Zm5.8 13.9c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5.2.6.8 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.6c-.2.2-.4.4-.2.7.2.4.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.9 2.1 1 .3.2.5.2.6.4.1.1.1.7-.1 1.3Z"
  }
];
