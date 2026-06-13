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
    description: "Decouvrez l'ES Viry-Chatillon Football, club formateur de l'Essonne : son histoire depuis 1958, ses valeurs, son organigramme et le stade Henri Longuet."
  },
  "/le-club/histoire": {
    title: "Histoire",
    description: "L'histoire de l'ES Viry-Chatillon Football depuis 1958 : un club formateur et populaire de l'Essonne, ancre dans son territoire et tourne vers l'avenir."
  },
  "/le-club/mot-du-president": {
    title: "Mot du President",
    description: "Le mot du president de l'ES Viry-Chatillon Football : la vision, les ambitions sportives et les valeurs humaines qui animent le club et ses licencies."
  },
  "/le-club/organigramme": {
    title: "Organigramme",
    description: "L'organigramme de l'ES Viry-Chatillon Football : bureau executif, dirigeants, encadrement sportif et referents par categorie, de l'ecole de foot aux Seniors."
  },
  "/le-club/encadrement": {
    title: "Encadrement",
    description: "L'encadrement sportif de l'ES Viry-Chatillon Football : educateurs et entraineurs diplomes, leurs equipes encadrees et leur activite au service des licencies."
  },
  "/le-club/stade-henri-longuet": {
    title: "Stade Henri Longuet",
    description: "Le stade Henri Longuet a Viry-Chatillon (91170), antre de l'ES Viry-Chatillon Football : acces, infrastructures, terrains et informations pratiques."
  },
  "/equipes": {
    title: "Equipes",
    description: "Toutes les equipes de l'ES Viry-Chatillon Football, de l'ecole de foot aux Seniors en passant par les feminines et le futsal : effectifs, staff et categories."
  },
  "/actualites": {
    title: "Actualites",
    description: "Toute l'actualite de l'ES Viry-Chatillon Football : resultats des equipes, stages, evenements, vie du club et informations pratiques pour les familles."
  },
  "/calendrier": {
    title: "Calendrier",
    description: "Le calendrier officiel de l'ES Viry-Chatillon Football : matchs des equipes, evenements du club et rendez-vous des Jaune et Vert tout au long de la saison."
  },
  "/inscriptions": {
    title: "Inscriptions",
    description: "Inscrivez votre enfant a l'ES Viry-Chatillon Football : modalites, pieces a fournir, tarifs et formulaire d'inscription en ligne pour la nouvelle saison."
  },
  "/detections-recrutement": {
    title: "Detections / Recrutement",
    description: "Detections et recrutement a l'ES Viry-Chatillon Football : rejoignez un club formateur de l'Essonne, passez vos tests sportifs et tentez votre chance."
  },
  "/partenaires": {
    title: "Partenaires",
    description: "Les partenaires de l'ES Viry-Chatillon Football et les opportunites de sponsoring : associez votre image a un club populaire et formateur de l'Essonne."
  },
  "/medias": {
    title: "Medias / Galerie",
    description: "La galerie photos et videos de l'ES Viry-Chatillon Football : revivez les temps forts, les matchs et les evenements des Jaune et Vert tout au long de l'annee."
  },
  "/boutique": {
    title: "Boutique",
    description: "La boutique officielle de l'ES Viry-Chatillon Football : maillots, survetements et accessoires aux couleurs Jaune et Vert pour supporters et licencies."
  },
  "/boutique/conditions-generales": {
    title: "Conditions generales",
    description: "Les conditions generales de vente de la boutique officielle de l'ES Viry-Chatillon Football : commandes, paiement, livraison et droit de retractation."
  },
  "/boutique/livraison-retour": {
    title: "Livraison & retour",
    description: "Modalites de livraison et de retour des commandes de la boutique officielle de l'ES Viry-Chatillon Football : delais, frais, echanges et remboursements."
  },
  "/contact": {
    title: "Contact",
    description: "Contactez l'ES Viry-Chatillon Football : adresse du stade Henri Longuet a Viry-Chatillon, telephone, email et formulaire de contact pour toute demande."
  },
  "/mentions-legales": {
    title: "Mentions legales",
    description: "Mentions legales du site officiel de l'ES Viry-Chatillon Football : editeur, directeur de publication, hebergement et responsabilites editoriales du site."
  },
  "/politique-confidentialite": {
    title: "Politique de confidentialite",
    description: "Politique de confidentialite de l'ES Viry-Chatillon Football : traitement des donnees personnelles, cookies, duree de conservation et exercice des droits RGPD."
  },
  "/plan-du-site": {
    title: "Plan du site",
    description: "Le plan du site officiel de l'ES Viry-Chatillon Football : retrouvez rapidement toutes les pages du club, des equipes a la boutique et aux inscriptions."
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
