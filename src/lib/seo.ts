import type { Metadata } from "next";

/**
 * Metadonnees SEO par page : titre + description UNIQUE (120-160 caracteres) et
 * canonical auto-derive du chemin. Centralise ici pour eviter la duplication de
 * description (toutes les pages heritaient sinon la meme description du layout) et
 * le canonical "/" du root layout qui fuyait sur toutes les pages.
 *
 * metadataBase etant defini dans le layout, un chemin relatif suffit : Next.js
 * resout l'URL absolue du canonical et de l'openGraph.url.
 */
type PageSeo = { title: string; description: string };

const PAGES: Record<string, PageSeo> = {
  "/le-club": {
    title: "Le Club",
    description: "Decouvrez l'ES Viry-Chatillon Football : son histoire depuis 1958, ses valeurs, son organigramme et le stade Henri Longuet."
  },
  "/le-club/histoire": {
    title: "Histoire",
    description: "L'histoire de l'ES Viry-Chatillon Football : un club formateur et populaire de l'Essonne, ancre dans son territoire depuis 1958."
  },
  "/le-club/mot-du-president": {
    title: "Mot du President",
    description: "Le mot du president de l'ES Viry-Chatillon Football : la vision, les ambitions et les valeurs qui animent le club."
  },
  "/le-club/organigramme": {
    title: "Organigramme",
    description: "L'organigramme de l'ES Viry-Chatillon Football : dirigeants, encadrement sportif et referents par categorie."
  },
  "/le-club/encadrement": {
    title: "Encadrement",
    description: "L'encadrement sportif de l'ES Viry-Chatillon Football : educateurs et entraineurs diplomes, leurs equipes et leur activite."
  },
  "/le-club/stade-henri-longuet": {
    title: "Stade Henri Longuet",
    description: "Le stade Henri Longuet, antre de l'ES Viry-Chatillon Football a Viry-Chatillon : acces, infrastructures et informations pratiques."
  },
  "/equipes": {
    title: "Equipes",
    description: "Toutes les equipes de l'ES Viry-Chatillon Football, de l'ecole de foot aux Seniors : effectifs, staff et categories."
  },
  "/actualites": {
    title: "Actualites",
    description: "Toute l'actualite de l'ES Viry-Chatillon Football : resultats, stages, evenements et informations pratiques du club."
  },
  "/calendrier": {
    title: "Calendrier",
    description: "Le calendrier officiel de l'ES Viry-Chatillon Football : matchs, evenements et rendez-vous des Jaune et Vert."
  },
  "/inscriptions": {
    title: "Inscriptions",
    description: "Inscrivez-vous a l'ES Viry-Chatillon Football : modalites, pieces a fournir et formulaire d'inscription en ligne."
  },
  "/detections-recrutement": {
    title: "Detections / Recrutement",
    description: "Detections et recrutement a l'ES Viry-Chatillon Football : rejoignez un club formateur et tentez votre chance."
  },
  "/partenaires": {
    title: "Partenaires",
    description: "Les partenaires de l'ES Viry-Chatillon Football et les opportunites de sponsoring pour soutenir le club."
  },
  "/medias": {
    title: "Medias / Galerie",
    description: "La galerie photos et videos de l'ES Viry-Chatillon Football : revivez les temps forts des Jaune et Vert."
  },
  "/boutique": {
    title: "Boutique",
    description: "La boutique officielle de l'ES Viry-Chatillon Football : maillots, survetements et accessoires aux couleurs du club."
  },
  "/boutique/conditions-generales": {
    title: "Conditions generales",
    description: "Les conditions generales de vente de la boutique officielle de l'ES Viry-Chatillon Football."
  },
  "/boutique/livraison-retour": {
    title: "Livraison & retour",
    description: "Modalites de livraison et de retour des commandes de la boutique officielle de l'ES Viry-Chatillon Football."
  },
  "/contact": {
    title: "Contact",
    description: "Contactez l'ES Viry-Chatillon Football : adresse du stade Henri Longuet, telephone, email et formulaire de contact."
  },
  "/mentions-legales": {
    title: "Mentions legales",
    description: "Mentions legales du site officiel de l'ES Viry-Chatillon Football : editeur, hebergement et responsabilites."
  },
  "/politique-confidentialite": {
    title: "Politique de confidentialite",
    description: "Politique de confidentialite de l'ES Viry-Chatillon Football : traitement des donnees personnelles et droits RGPD."
  },
  "/plan-du-site": {
    title: "Plan du site",
    description: "Le plan du site officiel de l'ES Viry-Chatillon Football : retrouvez rapidement toutes les pages du club."
  }
};

export function pageMetadata(path: string): Metadata {
  const page = PAGES[path];

  if (!page) {
    return { alternates: { canonical: path } };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: path,
      type: "website"
    }
  };
}
