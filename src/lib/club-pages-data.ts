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

export type ConductBlock = {
  title: string;
  audience: string;
  icon: string;
  intro: string;
  essentials: string[];
  rules: string[];
};
export type RegulationItem = { title: string; text: string };
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

// Les membres du bureau et les dirigeants proviennent désormais de la source unique
// `getClubOfficials()` (src/lib/public-content.ts), partagée avec l'organigramme.

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
  {
    title: "Jeune joueur",
    audience: "Joueurs",
    icon: "Trophy",
    intro: "Le joueur représente son équipe et le club sur le terrain, au vestiaire et lors de chaque déplacement.",
    essentials: [
      "Dire bonjour, merci et au revoir.",
      "Respecter partenaires, adversaires, arbitres, éducateurs et membres du club.",
      "Arriver à l'heure, équipé correctement, avec une tenue adaptée.",
      "Prévenir l'éducateur en cas d'absence ou de retard."
    ],
    rules: [
      "Ne pas utiliser de langage grossier, sur ou en dehors du terrain.",
      "Être réceptif et à l'écoute de l'éducateur.",
      "Respecter les horaires d'entraînement et de rendez-vous, car l'équipe vous attend.",
      "Porter le survêtement du club lors des matchs : c'est la tenue de présentation.",
      "Savoir préparer son sac, le défaire et l'aérer après la pratique.",
      "Venir avec des chaussures adéquates, propres et adaptées à la séance.",
      "Participer au rangement du matériel d'entraînement.",
      "Être présent au vestiaire 30 minutes avant l'entraînement et sur le terrain 15 minutes avant la prise en main du groupe.",
      "Ne laisser aucun objet précieux au vestiaire et ne porter aucun objet dangereux sur le terrain.",
      "Nettoyer ses chaussures avant de rentrer dans le vestiaire après l'entraînement.",
      "S'encourager, se soutenir et ne pas se moquer des autres.",
      "Si un ballon est perdu, toute l'équipe aide à le retrouver.",
      "Maîtriser ses émotions, refuser la violence et accepter les contacts du jeu.",
      "Être exigeant avec soi-même et tolérant avec les autres.",
      "Préparer son match à l'avance et venir en avance au point de rendez-vous.",
      "Le point de rendez-vous de référence est le Stade Henri Longuet.",
      "Porter la tenue de présentation et, pour les plus jeunes, le pack du club.",
      "Se laver après la pratique et prévoir claquettes, savon, serviette et affaires de change.",
      "Laisser les vestiaires et les abords propres.",
      "S'hydrater, manger correctement et se reposer."
    ]
  },
  {
    title: "Parents",
    audience: "Familles",
    icon: "Users",
    intro: "Les parents accompagnent la progression des enfants en soutenant le cadre éducatif du club.",
    essentials: [
      "Être un modèle pour les enfants.",
      "Motiver et encourager positivement les joueurs et l'équipe.",
      "Respecter les décisions des arbitres, éducateurs et responsables.",
      "Contacter l'éducateur ou le responsable en cas de problème."
    ],
    rules: [
      "Ne pas fumer ou consommer d'alcool dans l'enceinte des stades et complexes sportifs.",
      "Encourager sans coacher à la place de l'éducateur.",
      "Ne pas contester agressivement les décisions arbitrales.",
      "Prendre du recul avant toute critique sur une décision d'arbitre ou d'éducateur.",
      "Échanger avec les parents adverses dans un esprit convivial.",
      "Ne pas utiliser la privation de football comme menace éducative.",
      "Respecter le cadre fixé par l'éducateur pendant les rencontres et les entraînements.",
      "S'adresser à l'éducateur, au responsable de l'école de foot ou au responsable technique en cas de difficulté."
    ]
  },
  {
    title: "Supporters",
    audience: "Tribunes",
    icon: "Megaphone",
    intro: "Les supporters portent l'image du club et doivent encourager les équipes avec respect.",
    essentials: [
      "Soutenir les équipes dans la victoire comme dans la défaite.",
      "Bannir violence, insultes et pressions.",
      "Respecter les décisions de l'arbitre.",
      "Refuser racisme, haine, homophobie et toute discrimination."
    ],
    rules: [
      "Garder un comportement digne dans et en dehors des stades.",
      "Éviter les expressions de mécontentement agressives.",
      "Faire preuve de respect et de tolérance envers les adversaires, arbitres et autres supporters.",
      "Limiter l'alcool et le tabac, qui ne correspondent pas à l'identité sportive du club.",
      "Acclamer nos équipes équitablement et avec respect."
    ]
  },
  {
    title: "Éducateur",
    audience: "Encadrement",
    icon: "GraduationCap",
    intro: "L'éducateur fait vivre le cadre du club par son exemplarité, sa pédagogie et sa bienveillance.",
    essentials: [
      "Être un exemple pour ses joueurs.",
      "Écouter, conseiller et encourager.",
      "Mettre le jeu, le plaisir et la formation avant le résultat.",
      "Faire preuve de patience et de bienveillance."
    ],
    rules: [
      "Ne pas crier : aider le joueur à trouver des solutions.",
      "Ne pas critiquer un joueur devant le groupe ; privilégier un échange individuel.",
      "Sanctionner le mauvais comportement de ses joueurs sans se focaliser sur l'adversaire.",
      "Adapter entraînements et matchs à l'âge et à la physiologie des enfants.",
      "En école de foot, faire participer chaque enfant avec un temps de jeu équilibré.",
      "Ne faire aucun favoritisme et placer tous les joueurs sur un pied d'égalité.",
      "Assumer collectivement la victoire comme la défaite avec les joueurs.",
      "Ne pas s'acharner sur un joueur : utiliser une pédagogie adaptée à l'enfant et à la situation.",
      "Rassurer le joueur après une erreur et l'aider à progresser."
    ]
  }
];

export const regulationItems: RegulationItem[] = [
  {
    title: "Adhésion",
    text: "L'adhésion à l'Entente Sportive de Viry-Châtillon Football implique l'acceptation du règlement intérieur consultable sur le site. Elle ouvre des droits et engage des devoirs."
  },
  {
    title: "Licence et cotisation",
    text: "L'adhésion devient effective après remise de la licence complétée, du certificat médical si requis, et du règlement de la cotisation annuelle non remboursable."
  },
  {
    title: "Autorisation parentale",
    text: "Aucun enfant mineur ne peut être inscrit sans autorisation parentale ou accord de son représentant légal."
  },
  {
    title: "Responsabilité du club",
    text: "La responsabilité du club est engagée lorsque l'enfant est confié à l'éducateur responsable, sur le lieu prévu, et uniquement pendant la durée de la séance ou de la manifestation."
  },
  {
    title: "Annulation de séance",
    text: "L'absence d'un éducateur entraînant l'annulation d'une séance est annoncée par les canaux de communication du club, sur place ou par voie électronique."
  },
  {
    title: "Absences",
    text: "Toute absence d'un licencié doit être signalée au responsable de la section. Les absences répétées et non justifiées peuvent faire l'objet d'une information aux parents."
  },
  {
    title: "Tenue et discipline",
    text: "Une bonne tenue, le respect des personnes et du matériel sont obligatoires. Une mauvaise conduite ou des propos incorrects peuvent entraîner une exclusion temporaire ou définitive."
  },
  {
    title: "Urgence",
    text: "En cas d'urgence, les secours habilités sont alertés et prennent toutes les décisions nécessaires."
  },
  {
    title: "Image et données",
    text: "Le club peut utiliser et diffuser les images concernant le licencié. Conformément à la loi informatique et libertés, chacun peut exercer ses droits d'accès, de modification, de rectification et de suppression."
  }
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

// Palmares de l'equipe Fanion (seniors) : historique des championnats de 1969 a 2013.
// Source : document de M. Vincent Boisselier (Comite Directeur), septembre 2012.
// place/points/... a null pour les saisons sans statistiques renseignees (ex. 2013).
export type SaisonPalmares = {
  annee: number;
  division: string;
  place: number | null;
  points: number | null;
  joue: number | null;
  gagne: number | null;
  nul: number | null;
  perdu: number | null;
  bp: number | null; // buts pour
  bc: number | null; // buts contre
  diff: number | null; // difference de buts (GA)
  highlight?: "champion" | "relegation"; // titre (1re place) / saison 1983 (relegation D2)
};

export const palmaresFanion: SaisonPalmares[] = [
  { annee: 2013, division: "CFA D", place: null, points: null, joue: null, gagne: null, nul: null, perdu: null, bp: null, bc: null, diff: null },
  { annee: 2012, division: "CFA D", place: 11, points: 75, joue: 34, gagne: 12, nul: 5, perdu: 17, bp: 43, bc: 45, diff: -2 },
  { annee: 2011, division: "CFA D", place: 9, points: 74, joue: 32, gagne: 11, nul: 9, perdu: 12, bp: 36, bc: 39, diff: -3 },
  { annee: 2010, division: "CFA D", place: 6, points: 81, joue: 34, gagne: 13, nul: 8, perdu: 13, bp: 50, bc: 58, diff: -8 },
  { annee: 2009, division: "CFA D", place: 9, points: 78, joue: 34, gagne: 11, nul: 11, perdu: 12, bp: 43, bc: 49, diff: -6 },
  { annee: 2008, division: "CFA 2 H", place: 2, points: 91, joue: 30, gagne: 19, nul: 4, perdu: 7, bp: 61, bc: 38, diff: 23 },
  { annee: 2007, division: "CFA 2 F", place: 8, points: 70, joue: 30, gagne: 10, nul: 10, perdu: 10, bp: 43, bc: 42, diff: 1 },
  { annee: 2006, division: "CFA 2 B", place: 12, points: 58, joue: 28, gagne: 6, nul: 12, perdu: 10, bp: 30, bc: 31, diff: -1 },
  { annee: 2005, division: "CFA A", place: 18, points: 54, joue: 34, gagne: 5, nul: 5, perdu: 24, bp: 36, bc: 80, diff: -44 },
  { annee: 2004, division: "CFA B", place: 9, points: 80, joue: 34, gagne: 12, nul: 10, perdu: 12, bp: 42, bc: 49, diff: -7 },
  { annee: 2003, division: "National", place: 18, points: 39, joue: 38, gagne: 8, nul: 15, perdu: 15, bp: 36, bc: 51, diff: -15 },
  { annee: 2002, division: "CFA A", place: 5, points: 87, joue: 34, gagne: 13, nul: 14, perdu: 7, bp: 36, bc: 31, diff: 5 },
  { annee: 2001, division: "CFA A", place: 10, points: 79, joue: 34, gagne: 11, nul: 12, perdu: 11, bp: 40, bc: 44, diff: -4 },
  { annee: 2000, division: "CFA D", place: 13, points: 72, joue: 34, gagne: 8, nul: 14, perdu: 12, bp: 32, bc: 40, diff: -8 },
  { annee: 1999, division: "CFA D", place: 4, points: 86, joue: 34, gagne: 15, nul: 7, perdu: 12, bp: 36, bc: 37, diff: -1 },
  { annee: 1998, division: "CFA D", place: 16, points: 30, joue: 34, gagne: 7, nul: 9, perdu: 18, bp: 24, bc: 52, diff: -28 },
  { annee: 1997, division: "National 2 Gr. D", place: 6, points: 52, joue: 34, gagne: 15, nul: 7, perdu: 12, bp: 43, bc: 39, diff: 4 },
  { annee: 1996, division: "National 2 Gr. A", place: 4, points: 57, joue: 34, gagne: 16, nul: 9, perdu: 9, bp: 40, bc: 26, diff: 14 },
  { annee: 1995, division: "National 2 Gr. D", place: 12, points: 32, joue: 34, gagne: 12, nul: 8, perdu: 14, bp: 40, bc: 37, diff: 3 },
  { annee: 1994, division: "National 2 Gr. D", place: 13, points: 24, joue: 34, gagne: 7, nul: 10, perdu: 17, bp: 35, bc: 52, diff: -17 },
  { annee: 1993, division: "Division 3 Est", place: 10, points: 30, joue: 30, gagne: 10, nul: 10, perdu: 10, bp: 35, bc: 39, diff: -4 },
  { annee: 1992, division: "Division 3 Centre", place: 15, points: 22, joue: 30, gagne: 5, nul: 12, perdu: 13, bp: 28, bc: 45, diff: -17 },
  { annee: 1991, division: "Division 4 Gr. F", place: 1, points: 33, joue: 26, gagne: 12, nul: 9, perdu: 5, bp: 35, bc: 26, diff: 9, highlight: "champion" },
  { annee: 1990, division: "Division 4 Gr. B", place: 7, points: 27, joue: 26, gagne: 7, nul: 13, perdu: 6, bp: 32, bc: 25, diff: 7 },
  { annee: 1989, division: "Division 4 Gr. F", place: 5, points: 30, joue: 26, gagne: 8, nul: 14, perdu: 4, bp: 20, bc: 11, diff: 9 },
  { annee: 1988, division: "Division 3 Centre", place: 16, points: 19, joue: 30, gagne: 4, nul: 11, perdu: 15, bp: 21, bc: 46, diff: -25 },
  { annee: 1987, division: "Division 4 Gr. B", place: 1, points: 37, joue: 26, gagne: 12, nul: 13, perdu: 1, bp: 37, bc: 14, diff: 23, highlight: "champion" },
  { annee: 1986, division: "Division 3 Centre", place: 15, points: 20, joue: 30, gagne: 6, nul: 8, perdu: 16, bp: 31, bc: 50, diff: -19 },
  { annee: 1985, division: "Division 3 Ouest", place: 7, points: 31, joue: 30, gagne: 9, nul: 13, perdu: 8, bp: 24, bc: 30, diff: -6 },
  { annee: 1984, division: "Division 3 Nord", place: 11, points: 25, joue: 30, gagne: 5, nul: 15, perdu: 10, bp: 26, bc: 31, diff: -5 },
  { annee: 1983, division: "Division 2 Gr. A", place: 17, points: 19, joue: 34, gagne: 5, nul: 9, perdu: 20, bp: 21, bc: 58, diff: -37, highlight: "relegation" },
  { annee: 1982, division: "Division 3 Centre-Ouest", place: 2, points: 44, joue: 30, gagne: 17, nul: 10, perdu: 3, bp: 46, bc: 19, diff: 27 },
  { annee: 1981, division: "Division 3 Centre-Ouest", place: 6, points: 32, joue: 30, gagne: 11, nul: 10, perdu: 9, bp: 36, bc: 29, diff: 7 },
  { annee: 1980, division: "Division 3 Ouest", place: 9, points: 30, joue: 30, gagne: 11, nul: 8, perdu: 11, bp: 35, bc: 34, diff: 1 },
  { annee: 1979, division: "Division 3 Centre", place: 10, points: 28, joue: 30, gagne: 8, nul: 12, perdu: 10, bp: 28, bc: 27, diff: 1 },
  { annee: 1978, division: "Division 3 Centre", place: 9, points: 31, joue: 30, gagne: 8, nul: 15, perdu: 7, bp: 31, bc: 30, diff: 1 },
  { annee: 1977, division: "Division 3 Centre", place: 5, points: 35, joue: 30, gagne: 13, nul: 9, perdu: 8, bp: 41, bc: 32, diff: 9 },
  { annee: 1976, division: "DH Paris / Ile-de-France", place: 1, points: 51, joue: 22, gagne: 12, nul: 5, perdu: 5, bp: 37, bc: 17, diff: 20, highlight: "champion" },
  { annee: 1975, division: "DH Paris / Ile-de-France", place: 2, points: 58, joue: 26, gagne: 12, nul: 8, perdu: 6, bp: 41, bc: 27, diff: 14 },
  { annee: 1974, division: "DH Paris / Ile-de-France", place: 4, points: 47, joue: 22, gagne: 10, nul: 6, perdu: 6, bp: 41, bc: 27, diff: 14 },
  { annee: 1973, division: "DH Paris / Ile-de-France", place: 4, points: 47, joue: 22, gagne: 11, nul: 3, perdu: 8, bp: 24, bc: 21, diff: 3 },
  { annee: 1972, division: "DH Paris / Ile-de-France", place: 3, points: 50, joue: 22, gagne: 12, nul: 4, perdu: 6, bp: 31, bc: 19, diff: 12 },
  { annee: 1971, division: "DH Paris / Ile-de-France", place: 6, points: 44, joue: 22, gagne: 7, nul: 8, perdu: 7, bp: 29, bc: 23, diff: 6 },
  { annee: 1970, division: "DH Paris / Ile-de-France", place: 3, points: 49, joue: 22, gagne: 10, nul: 7, perdu: 5, bp: 32, bc: 27, diff: 5 },
  { annee: 1969, division: "DH Paris / Ile-de-France", place: 5, points: 45, joue: 22, gagne: 7, nul: 9, perdu: 6, bp: 42, bc: 40, diff: 2 }
];

export const palmaresNote =
  "Durant toutes ces saisons, le club n'a cesse de monter de division en division : la P.H. en 1961, la D.H.R. en 1967, puis l'acces des 1969 a la Division d'Honneur. Le titre de champion de Paris en 1976 ouvre a Viry l'acces aux championnats nationaux, ou il evolue toujours aujourd'hui. L'ESV atteint son apogee sportive en 1982 en etant promue en Division 2 (Ligue 2). Ne signant que cinq victoires en 34 matches, le club est logiquement relegue au printemps 1983.";

export const palmaresCredit =
  "Document realise par M. Vincent Boisselier, membre du Comite Directeur et responsable de l'equipe CFA — septembre 2012.";

export const palmaresHighlights: { label: string; value: string }[] = [
  { label: "Saisons retracees", value: "1969 → 2013" },
  { label: "Titres de champion", value: "1976 · 1987 · 1991" },
  { label: "Apogee sportive", value: "Division 2 (1982-83)" },
  { label: "Plus haut niveau", value: "National (2003)" }
];

// Photos d'archives du club (1964 -> 2019), copiees telles quelles dans public/historique
// (lot WhatsApp dedoublonne). Ordre chronologique. Le titre sert de legende + texte alternatif ;
// chaque image porte aussi sa legende incrustee. Annee approximative pour quelques cliches.
export const galerieArchives: { title: string; image: string }[] = [
  { title: "1964 · Équipe du collège", image: "/historique/historique-51.jpeg" },
  { title: "1964 · Tournoi « Christfoot »", image: "/historique/historique-52.jpeg" },
  { title: "1966 · Cadets — sortie au pont de Tancarville", image: "/historique/historique-48.jpeg" },
  { title: "1966 · Cadets — trois amis", image: "/historique/historique-49.jpeg" },
  { title: "1966 · Cadets — sur la plage de Cabourg", image: "/historique/historique-50.jpeg" },
  { title: "1967-1968 · Cadets", image: "/historique/historique-47.jpeg" },
  { title: "1969 · Tournoi d'Abbeville", image: "/historique/historique-44.jpeg" },
  { title: "1969 · Finale de la Coupe de France juniors (Parc des Princes)", image: "/historique/historique-45.jpeg" },
  { title: "1969 · Finale au Parc des Princes (action de jeu)", image: "/historique/historique-46.jpeg" },
  { title: "1970 · Minimes", image: "/historique/historique-43.jpeg" },
  { title: "1971 · Pupilles 1 — finalistes de la Coupe de Paris", image: "/historique/historique-42.jpeg" },
  { title: "1971-1972 · Minimes C", image: "/historique/historique-41.jpeg" },
  { title: "1972 · Cadets", image: "/historique/historique-39.jpeg" },
  { title: "1972 · Poussins (avec M. Da Silva)", image: "/historique/historique-40.jpeg" },
  { title: "1973 · Pupilles", image: "/historique/historique-35.jpeg" },
  { title: "1973 · Poussins — tournoi d'Alfortville", image: "/historique/historique-36.jpeg" },
  { title: "1973 · Finale de la Coupe de Paris cadets", image: "/historique/historique-37.jpeg" },
  { title: "1973 · Équipe de jeunes de l'ESV", image: "/historique/historique-38.jpeg" },
  { title: "1974-1975 · Cadets A", image: "/historique/historique-32.jpeg" },
  { title: "1974-1975 · Cadets A (au stade)", image: "/historique/historique-33.jpeg" },
  { title: "1975 · Tournoi de sixte", image: "/historique/historique-34.jpeg" },
  { title: "1976 · Juniors — finalistes de la Coupe Gambardella", image: "/historique/historique-31.jpeg" },
  { title: "1977 · Viry – Racing Club de France", image: "/historique/historique-28.jpeg" },
  { title: "1977 · Poussins 1", image: "/historique/historique-30.jpeg" },
  { title: "1978 · Minimes (saison 1977-78)", image: "/historique/historique-24.jpeg" },
  { title: "1978 · Poussins 1", image: "/historique/historique-25.jpeg" },
  { title: "1978 · Poussins 1 — tournoi d'Alfortville", image: "/historique/historique-26.jpeg" },
  { title: "1978 · Finale de la Coupe de Paris (poussins)", image: "/historique/historique-27.jpeg" },
  { title: "1979 · CDM", image: "/historique/historique-22.jpeg" },
  { title: "1979 · Pupilles A", image: "/historique/historique-23.jpeg" },
  { title: "1980 · Pupilles", image: "/historique/historique-20.jpeg" },
  { title: "1980-1981 · Cadets nationaux — Coupe de Paris (face au Paris FC)", image: "/historique/historique-21.jpeg" },
  { title: "1982 · Minimes — tournoi de Juvisy", image: "/historique/historique-19.jpeg" },
  { title: "1984 · Cadets PH", image: "/historique/historique-17.jpeg" },
  { title: "1984 · Cadets DH — montée en cadets nationaux", image: "/historique/historique-18.jpeg" },
  { title: "1985 · Cadets nationaux", image: "/historique/historique-16.jpeg" },
  { title: "1986 · Juniors", image: "/historique/historique-15.jpeg" },
  { title: "1988 · Cadets nationaux", image: "/historique/historique-01.jpeg" },
  { title: "1988 · Cadets", image: "/historique/historique-02.jpeg" },
  { title: "1988 · Juniors 1re année", image: "/historique/historique-03.jpeg" },
  { title: "1988 · Cadets nationaux — tournoi de Mérignac", image: "/historique/historique-12.jpeg" },
  { title: "1988 · Cadets nationaux — tournoi de Mérignac (maillot vert)", image: "/historique/historique-13.jpeg" },
  { title: "1988 · Cadets nationaux — vainqueurs à Mérignac", image: "/historique/historique-14.jpeg" },
  { title: "1989 · Tournoi cadets (Pays-Bas)", image: "/historique/historique-04.jpeg" },
  { title: "1989 · Poussins", image: "/historique/historique-05.jpeg" },
  { title: "1989 · 20 ans du club (anciens)", image: "/historique/historique-06.jpeg" },
  { title: "1991 · Finale de la Coupe de l'Essonne (juniors)", image: "/historique/historique-07.jpeg" },
  { title: "2003-2004 · -18 ans — champion DSR (parcours Gambardella)", image: "/historique/historique-08.jpeg" },
  { title: "2009 · Retrouvailles « déjà 40 ans » (anciens)", image: "/historique/historique-09.jpeg" },
  { title: "2019 · Coupe de France — Viry-Châtillon / SM Caen", image: "/historique/historique-57.jpeg" },
  { title: "2019 · Coupe de France — les deux équipes", image: "/historique/historique-68.jpeg" },
  { title: "2019 · Coupe de France — entrée des joueurs (Petit Poucet PMU)", image: "/historique/historique-66.jpeg" },
  { title: "2019 · Coupe de France — la joie de la qualification", image: "/historique/historique-53.jpeg" },
  { title: "2019 · Coupe de France — célébration sur le terrain", image: "/historique/historique-54.jpeg" },
  { title: "2019 · Coupe de France — but de l'ESV", image: "/historique/historique-55.jpeg" },
  { title: "2019 · Coupe de France — duel", image: "/historique/historique-56.jpeg" },
  { title: "2019 · Coupe de France — au duel", image: "/historique/historique-58.jpeg" },
  { title: "2019 · Coupe de France — duel aérien", image: "/historique/historique-59.jpeg" },
  { title: "2019 · Coupe de France — face au but", image: "/historique/historique-60.jpeg" },
  { title: "2019 · Coupe de France — sur le terrain", image: "/historique/historique-61.jpeg" },
  { title: "2019 · Coupe de France — sur l'aile", image: "/historique/historique-62.jpeg" },
  { title: "2019 · Coupe de France — percée", image: "/historique/historique-63.jpeg" },
  { title: "2019 · Coupe de France — face à SM Caen", image: "/historique/historique-64.jpeg" },
  { title: "2019 · Coupe de France — duel le long de la ligne", image: "/historique/historique-65.jpeg" },
  { title: "2019 · Coupe de France — au duel (2)", image: "/historique/historique-67.jpeg" }
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
