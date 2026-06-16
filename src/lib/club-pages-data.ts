import { images } from "@/lib/images";

export type StaffPerson = {
  name: string;
  role: string;
  category: string;
  pole: string;
  contact: string;
  photo: string;
  tags?: string[];
};

export type Installation = {
  name: string;
  address: string;
  type: string;
  usage: string;
  teams: string[];
  image: string;
  mapsUrl: string;
};

export type ConductBlock = { title: string; icon: string; rules: string[] };
export type Stage = { title: string; audience: string; dates: string; places: string; status: "Ouvert" | "Bientot" | "Complet"; description: string };
export type OrgNode = { title: string; lead: string; mission: string; children?: string[] };

const personPhoto = images.training;

export const ecoleFootEducators: StaffPerson[] = [
  { name: "Nadia Ait Ali", role: "Responsable Ecole de Foot", category: "U6-U13", pole: "Coordination", contact: "contact via secretariat", photo: personPhoto, tags: ["Accueil familles", "Projet educatif"] },
  { name: "Karim Messaoudi", role: "Educateur U6-U7", category: "U6-U7", pole: "Ecole de foot", contact: "contact via secretariat", photo: personPhoto, tags: ["Motricite", "Plaisir"] },
  { name: "Sarah Belkacem", role: "Educatrice U8-U9", category: "U8-U9", pole: "Ecole de foot", contact: "contact via secretariat", photo: personPhoto, tags: ["Technique", "Vie collective"] },
  { name: "Ilyes Cherif", role: "Educateur U10-U11", category: "U10-U11", pole: "Ecole de foot", contact: "contact via secretariat", photo: personPhoto, tags: ["Jeu court", "Autonomie"] },
  { name: "Moussa Kone", role: "Educateur U12-U13", category: "U12-U13", pole: "Ecole de foot", contact: "contact via secretariat", photo: personPhoto, tags: ["Transition foot a 11", "Exigence"] }
];

export const footA11Educators: StaffPerson[] = [
  { name: "Rachid Amrani", role: "Responsable technique football a 11", category: "U14-Seniors", pole: "Direction sportive", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Plan de jeu", "Suivi educateurs"] },
  { name: "Sofiane Haddad", role: "Coach U14", category: "U14", pole: "Formation", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Perfectionnement"] },
  { name: "Thomas Leroy", role: "Coach U15", category: "U15", pole: "Formation", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Intensite"] },
  { name: "Malik Benali", role: "Coach U16", category: "U16", pole: "Formation", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Competition"] },
  { name: "Mehdi Diallo", role: "Coach U17-U18", category: "U17", pole: "Formation", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Projet joueur"] },
  { name: "Yacine Traore", role: "Coach Seniors", category: "Seniors", pole: "Competition", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Performance"] },
  { name: "Philippe Martin", role: "Educateur gardiens", category: "Gardiens", pole: "Specifique", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Technique gardien"] },
  { name: "Amina Roux", role: "Preparation physique", category: "Seniors", pole: "Performance", contact: "contact via secretariat", photo: images.teamHuddle, tags: ["Prevention", "Reathletisation"] }
];

export const dirigeants: StaffPerson[] = [
  { name: "Samir Rahmani", role: "Responsable administratif", category: "Administration", pole: "Administration", contact: "contact via secretariat", photo: images.supporters, tags: ["Licences", "Dossiers"] },
  { name: "Claire Dubois", role: "Referente communication", category: "Communication", pole: "Communication", contact: "contact via secretariat", photo: images.supporters, tags: ["Site", "Reseaux"] },
  { name: "Jean Morel", role: "Responsable logistique", category: "Logistique", pole: "Logistique", contact: "contact via secretariat", photo: images.supporters, tags: ["Materiel", "Planning"] },
  { name: "Binta Sow", role: "Coordination sportive", category: "Sportif", pole: "Sportif", contact: "contact via secretariat", photo: images.supporters, tags: ["Equipes", "Educateurs"] },
  { name: "Olivier Petit", role: "Partenariats locaux", category: "Administration", pole: "Partenariats", contact: "contact via secretariat", photo: images.supporters, tags: ["Sponsors"] }
];

export const bureau: StaffPerson[] = [
  { name: "SAGLAM FERHAT", role: "President", category: "Presidence", pole: "Bureau", contact: "contact via secretariat", photo: images.stadiumAerial },
  { name: "Fatou Camara", role: "Vice-presidente", category: "Direction", pole: "Bureau", contact: "contact via secretariat", photo: images.stadiumAerial },
  { name: "Laurent Girard", role: "Tresorier", category: "Finances", pole: "Bureau", contact: "contact via secretariat", photo: images.stadiumAerial },
  { name: "Sonia Mercier", role: "Secretaire generale", category: "Administration", pole: "Bureau", contact: "contact via secretariat", photo: images.stadiumAerial },
  { name: "Equipe bureau", role: "Membres actifs", category: "Vie associative", pole: "Bureau", contact: "contact via secretariat", photo: images.stadiumAerial }
];

export const trainingSlots = [
  { category: "U6-U7", time: "Mercredi 14h00 - 15h30", place: "Terrain synthetique" },
  { category: "U8-U9", time: "Mercredi 15h45 - 17h15", place: "Terrain synthetique" },
  { category: "U10-U11", time: "Mardi et jeudi 18h00 - 19h30", place: "Terrain annexe" },
  { category: "U12-U13", time: "Lundi et mercredi 18h00 - 19h45", place: "Terrain principal" }
];

export const installations: Installation[] = [
  { name: "Stade Henri Longuet", address: "Avenue de l'Armee Leclerc, 91170 Viry-Chatillon", type: "Matchs officiels", usage: "Terrain principal, tribune, rendez-vous seniors et jeunes", teams: ["Seniors", "U18", "U16"], image: images.stadiumAerial, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Stade+Henri+Longuet+Viry-Chatillon" },
  { name: "Terrain synthetique", address: "Parc des sports Henri Longuet", type: "Entrainements", usage: "Ecole de foot, seances techniques, gardiens", teams: ["U6-U13", "Gardiens"], image: images.pitch, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Parc+des+sports+Henri+Longuet" },
  { name: "Club-house", address: "Stade Henri Longuet, 91170 Viry-Chatillon", type: "Permanence", usage: "Accueil familles, inscriptions, reunions educateurs", teams: ["Familles", "Bureau"], image: images.stadeTribune, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Stade+Henri+Longuet+Viry-Chatillon" },
  { name: "Salle de reunion", address: "Complexe sportif municipal", type: "Reunions", usage: "Briefs dirigeants, formations internes, preparation evenements", teams: ["Dirigeants", "Educateurs"], image: images.stadeTribune2, mapsUrl: "https://www.google.com/maps/search/?api=1&query=Viry-Chatillon+complexe+sportif" }
];

export const conductBlocks: ConductBlock[] = [
  { title: "Joueurs", icon: "Trophy", rules: ["Respecter partenaires, adversaires et arbitres.", "Arriver a l'heure avec une tenue adaptee.", "Prevenir l'educateur en cas d'absence."] },
  { title: "Parents", icon: "Users", rules: ["Encourager sans coacher a la place de l'educateur.", "Respecter les horaires de depot et recuperation.", "Repondre rapidement aux convocations."] },
  { title: "Educateurs", icon: "GraduationCap", rules: ["Assurer un cadre securisant et formateur.", "Communiquer clairement avec les familles.", "Appliquer le projet sportif du club."] },
  { title: "Supporters", icon: "Megaphone", rules: ["Soutenir positivement les equipes.", "Refuser toute insulte ou pression.", "Representer dignement les couleurs du club."] },
  { title: "Dirigeants", icon: "ShieldCheck", rules: ["Garantir l'equite et la confidentialite.", "Accompagner les benevoles.", "Faire respecter le reglement interieur."] },
  { title: "Reglement interieur", icon: "ClipboardCheck", rules: ["Document de reference du club.", "Validation UI prevue.", "Telechargement PDF a connecter quand le fichier officiel sera disponible."] }
];

export const schoolProject = [
  { year: "2026", title: "Cadre commun", text: "Mettre en place des reperes communs par categorie : comportement, rythme, contenus et evaluations." },
  { year: "2027", title: "Formation educateurs", text: "Renforcer les formations internes et l'accompagnement des jeunes educateurs." },
  { year: "2028", title: "Developpement feminin", text: "Structurer l'accueil et la progression des joueuses sur les petites categories." },
  { year: "2029", title: "Accompagnement global", text: "Relier sport, citoyennete, scolarite et hygiene de vie autour du joueur." },
  { year: "2030", title: "Club formateur reference", text: "Installer une identite de jeu lisible et une passerelle solide vers le foot a 11." }
];

export const stages: Stage[] = [
  { title: "Stage vacances", audience: "U8-U13", dates: "Vacances scolaires", places: "36 places", status: "Ouvert", description: "Technique, matchs, ateliers educatifs et vie collective." },
  { title: "Stage perfectionnement", audience: "U12-U16", dates: "Bientot annonce", places: "24 places", status: "Bientot", description: "Travail par poste, intensite, finition et lecture du jeu." },
  { title: "Stage gardiens", audience: "U10-U17", dates: "Bientot annonce", places: "12 places", status: "Bientot", description: "Appuis, plongeons, relances, duel et communication." },
  { title: "Stage feminin", audience: "U9-U15", dates: "Printemps", places: "20 places", status: "Ouvert", description: "Decouverte et progression pour les joueuses du territoire." },
  { title: "Stage elite", audience: "U14-U18", dates: "Sur selection", places: "Complet", status: "Complet", description: "Preparation exigeante pour joueurs confirmes." }
];

export const orgNodes: OrgNode[] = [
  { title: "President", lead: "SAGLAM FERHAT", mission: "Fixe le cap associatif, represente le club et arbitre les grandes decisions.", children: ["Bureau", "Direction sportive", "Partenariats"] },
  { title: "Bureau", lead: "President, vice-president, tresorier, secretaire", mission: "Pilote l'administration, les finances, la conformite et la vie associative.", children: ["Administration", "Communication", "Logistique"] },
  { title: "Direction sportive", lead: "Responsable technique", mission: "Coordonne le projet sportif et accompagne les educateurs.", children: ["Ecole de foot", "Football a 11", "Gardiens"] },
  { title: "Ecole de foot", lead: "Responsable U6-U13", mission: "Accueil, apprentissage, plaisir et premiers reperes collectifs." },
  { title: "Football a 11", lead: "Responsable U14-Seniors", mission: "Progression, competition, passerelles vers les seniors." },
  { title: "Communication", lead: "Referent communication", mission: "Site, reseaux sociaux, medias, informations familles." },
  { title: "Logistique", lead: "Responsable materiel", mission: "Equipements, terrains, transports, organisation jour de match." },
  { title: "Evenementiel", lead: "Equipe benevole", mission: "Tournois, stages, animations club et temps forts." },
  { title: "Partenariats", lead: "Referent partenaires", mission: "Relations entreprises, offres sponsors, visibilite locale." }
];
