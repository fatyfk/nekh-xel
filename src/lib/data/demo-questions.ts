// Données de démonstration — 10 questions par matière
// 5 matières : Mathématiques, Français, Histoire, Géographie, Sciences

export interface DemoQuestion {
  subject: string;
  theme: string;
  type: "qcm" | "vrai_faux" | "association" | "identification";
  difficulty: "facile" | "moyen" | "difficile";
  enonce: string;
  /** QCM seulement : tableau de 4 choix */
  choices?: [string, string, string, string];
  /** QCM : index de la bonne réponse (0–3) */
  answer_index?: 0 | 1 | 2 | 3;
  /** Vrai/Faux seulement */
  answer_bool?: boolean;
  /** Association : paires [gauche, droite] */
  pairs?: [string, string][];
  /** Identification : indices progressifs */
  hints?: string[];
  /** Identification : réponse attendue */
  answer_text?: string;
  explanation: string;
  xp: number;
}

// ─── Mathématiques ─────────────────────────────────────────────────────────

export const DEMO_MATHS: DemoQuestion[] = [
  {
    subject: "maths", theme: "Nombres", type: "qcm", difficulty: "facile",
    enonce: "Quel est le résultat de 9 × 7 ?",
    choices: ["54", "63", "56", "72"],
    answer_index: 1,
    explanation: "9 × 7 = 63. Astuce : 9 × 7 = 10 × 7 − 7 = 70 − 7 = 63.",
    xp: 10,
  },
  {
    subject: "maths", theme: "Géométrie", type: "vrai_faux", difficulty: "facile",
    enonce: "Un triangle a toujours trois angles dont la somme est égale à 180°.",
    answer_bool: true,
    explanation: "Vrai ! La somme des angles intérieurs de tout triangle est toujours 180°.",
    xp: 8,
  },
  {
    subject: "maths", theme: "Fractions", type: "qcm", difficulty: "moyen",
    enonce: "Quelle fraction est équivalente à 1/2 ?",
    choices: ["2/3", "3/6", "4/9", "5/8"],
    answer_index: 1,
    explanation: "3/6 = 3÷3 / 6÷3 = 1/2. Pour trouver une fraction équivalente, on multiplie ou divise numérateur et dénominateur par le même nombre.",
    xp: 15,
  },
  {
    subject: "maths", theme: "Mesures", type: "association", difficulty: "moyen",
    enonce: "Associe chaque unité à ce qu'elle mesure :",
    pairs: [["Mètre (m)", "Longueur"], ["Kilogramme (kg)", "Masse"], ["Litre (L)", "Volume"]],
    explanation: "En sciences, chaque grandeur a son unité de mesure dans le système international (SI).",
    xp: 15,
  },
  {
    subject: "maths", theme: "Problèmes", type: "qcm", difficulty: "difficile",
    enonce: "Un vendeur achète 12 mangues à 250 F CFA chacune et les revend à 350 F CFA pièce. Quel est son bénéfice total ?",
    choices: ["1 000 F", "1 100 F", "1 200 F", "1 300 F"],
    answer_index: 2,
    explanation: "Bénéfice par mangue = 350 − 250 = 100 F. Bénéfice total = 100 × 12 = 1 200 F CFA.",
    xp: 25,
  },
];

// ─── Français ──────────────────────────────────────────────────────────────

export const DEMO_FRANCAIS: DemoQuestion[] = [
  {
    subject: "francais", theme: "Grammaire", type: "qcm", difficulty: "facile",
    enonce: "Quel est le verbe de la phrase : 'Les élèves apprennent leurs leçons.' ?",
    choices: ["élèves", "apprennent", "leurs", "leçons"],
    answer_index: 1,
    explanation: "'Apprennent' est le verbe : c'est le mot qui exprime l'action dans la phrase.",
    xp: 10,
  },
  {
    subject: "francais", theme: "Vocabulaire", type: "vrai_faux", difficulty: "facile",
    enonce: "Le mot 'content' et le mot 'joyeux' sont des synonymes.",
    answer_bool: true,
    explanation: "Vrai ! 'Content' et 'joyeux' expriment tous les deux un sentiment de bonheur. Ce sont des synonymes.",
    xp: 8,
  },
  {
    subject: "francais", theme: "Orthographe", type: "qcm", difficulty: "moyen",
    enonce: "Choisissez l'orthographe correcte :",
    choices: ["des chevaus", "des chevals", "des chevaux", "des cheval"],
    answer_index: 2,
    explanation: "Le pluriel de 'cheval' est 'chevaux'. Les mots en -al font généralement leur pluriel en -aux.",
    xp: 15,
  },
  {
    subject: "francais", theme: "Conjugaison", type: "qcm", difficulty: "moyen",
    enonce: "Conjuguez 'aller' au futur simple avec 'je' :",
    choices: ["je vais", "j'allais", "j'irai", "j'allai"],
    answer_index: 2,
    explanation: "'Aller' est un verbe irrégulier au futur. On utilise le radical 'ir' : j'irai, tu iras, il ira...",
    xp: 15,
  },
  {
    subject: "francais", theme: "Lecture", type: "identification", difficulty: "difficile",
    enonce: "Devinez ce type de texte :",
    hints: [
      "Il raconte une histoire imaginaire avec des personnages fictifs",
      "Il commence souvent par 'Il était une fois'",
      "Il met en scène des animaux qui parlent ou des fées",
    ],
    answer_text: "conte",
    explanation: "Le conte est un récit imaginaire avec des éléments merveilleux. Ex : Le Lion et le Rat (La Fontaine), Leuk le Lièvre (Birago Diop).",
    xp: 25,
  },
];

// ─── Histoire ──────────────────────────────────────────────────────────────

export const DEMO_HISTOIRE: DemoQuestion[] = [
  {
    subject: "histoire", theme: "Empires africains", type: "qcm", difficulty: "facile",
    enonce: "L'Empire du Mali est célèbre pour quel grand souverain qui a fait le pèlerinage à La Mecque en 1324 ?",
    choices: ["Soundiata Keïta", "Kankoussa Moussa", "Askia Mohamed", "Gaoussou Kouyaté"],
    answer_index: 1,
    explanation: "Kankou Moussa (ou Mansa Moussa) était si riche que son pèlerinage à La Mecque en 1324 fit chuter le prix de l'or en Afrique du Nord et en Europe.",
    xp: 10,
  },
  {
    subject: "histoire", theme: "Sénégal", type: "vrai_faux", difficulty: "facile",
    enonce: "Le Sénégal a obtenu son indépendance le 4 avril 1960.",
    answer_bool: true,
    explanation: "Vrai ! Le 4 avril est la fête nationale du Sénégal. Cette date commémore l'indépendance proclamée en 1960.",
    xp: 8,
  },
  {
    subject: "histoire", theme: "Colonisation", type: "qcm", difficulty: "moyen",
    enonce: "Quel héros sénégalais résista à la colonisation française et mourut au combat en 1886 ?",
    choices: ["Cheikh Ahmadou Bamba", "Lat Dior", "El Hadj Omar Tall", "Blaise Diagne"],
    answer_index: 1,
    explanation: "Lat Dior, damel du Cayor, est le symbole de la résistance sénégalaise. Il mourut à la bataille de Dekhele en 1886 plutôt que de voir le chemin de fer traverser son royaume.",
    xp: 15,
  },
  {
    subject: "histoire", theme: "Empires africains", type: "association", difficulty: "moyen",
    enonce: "Associe chaque empire africain médiéval à sa région :",
    pairs: [["Empire du Ghana", "Sahel occidental"], ["Empire du Mali", "Afrique de l'Ouest"], ["Royaume du Congo", "Afrique centrale"]],
    explanation: "Ces trois grands empires africains médiévaux ont dominé leurs régions respectives et ont marqué l'histoire du continent.",
    xp: 15,
  },
  {
    subject: "histoire", theme: "Sénégal", type: "identification", difficulty: "difficile",
    enonce: "Qui est ce grand homme politique sénégalais ?",
    hints: [
      "Né à Joal en 1906",
      "Poète et écrivain, il a fondé le mouvement littéraire de la Négritude",
      "Il fut le premier président du Sénégal indépendant",
    ],
    answer_text: "Léopold Sédar Senghor",
    explanation: "Léopold Sédar Senghor (1906–2001) fut à la fois poète, philosophe et homme d'État. Il est célèbre pour sa poésie et le concept de Négritude qu'il co-fonda avec Aimé Césaire.",
    xp: 25,
  },
];

// ─── Géographie ────────────────────────────────────────────────────────────

export const DEMO_GEO: DemoQuestion[] = [
  {
    subject: "geo", theme: "Sénégal", type: "qcm", difficulty: "facile",
    enonce: "Quelle est la capitale du Sénégal ?",
    choices: ["Thiès", "Saint-Louis", "Dakar", "Ziguinchor"],
    answer_index: 2,
    explanation: "Dakar est la capitale et la plus grande ville du Sénégal. Elle se situe sur la presqu'île du Cap-Vert, à l'extrême ouest de l'Afrique.",
    xp: 8,
  },
  {
    subject: "geo", theme: "Afrique", type: "vrai_faux", difficulty: "facile",
    enonce: "Le Sahara est le plus grand désert chaud du monde.",
    answer_bool: true,
    explanation: "Vrai ! Le Sahara couvre environ 9 millions de km², soit une superficie comparable aux États-Unis. Il traverse 11 pays africains.",
    xp: 8,
  },
  {
    subject: "geo", theme: "Sénégal", type: "qcm", difficulty: "moyen",
    enonce: "Quel est le plus grand lac naturel du Sénégal ?",
    choices: ["Lac de Guiers", "Lac Rose (Lac Retba)", "Lac Tamna", "Lac Tanma"],
    answer_index: 0,
    explanation: "Le Lac de Guiers est le plus grand lac d'eau douce du Sénégal. Il alimente en eau potable une grande partie du pays.",
    xp: 15,
  },
  {
    subject: "geo", theme: "Sénégal", type: "association", difficulty: "moyen",
    enonce: "Associe chaque région à sa ville principale :",
    pairs: [["Casamance", "Ziguinchor"], ["Sine-Saloum", "Kaolack"], ["Fleuve", "Saint-Louis"]],
    explanation: "Ces régions naturelles du Sénégal ont chacune leur grande ville et leurs caractéristiques géographiques particulières.",
    xp: 15,
  },
  {
    subject: "geo", theme: "Monde", type: "identification", difficulty: "difficile",
    enonce: "Quel continent suis-je ?",
    hints: [
      "Je suis le plus grand continent du monde",
      "Je suis séparé de l'Europe par l'Oural",
      "Je compte des pays comme la Chine, l'Inde et le Japon",
    ],
    answer_text: "Asie",
    explanation: "L'Asie est le plus grand continent (44 millions de km²) avec plus de 4 milliards d'habitants. C'est là que se trouvent les pays les plus peuplés du monde.",
    xp: 20,
  },
];

// ─── Sciences ──────────────────────────────────────────────────────────────

export const DEMO_SCIENCES: DemoQuestion[] = [
  {
    subject: "sciences", theme: "Le vivant", type: "qcm", difficulty: "facile",
    enonce: "Comment s'appelle le processus par lequel les plantes fabriquent leur nourriture grâce à la lumière solaire ?",
    choices: ["La respiration", "La photosynthèse", "La digestion", "La transpiration"],
    answer_index: 1,
    explanation: "La photosynthèse (photo = lumière, synthèse = fabrication) permet aux plantes de transformer CO₂ et eau en sucre et oxygène grâce à l'énergie solaire.",
    xp: 10,
  },
  {
    subject: "sciences", theme: "Corps humain", type: "vrai_faux", difficulty: "facile",
    enonce: "Le cœur humain bat environ 70 fois par minute au repos.",
    answer_bool: true,
    explanation: "Vrai ! Le cœur bat entre 60 et 80 fois par minute au repos. Il pompe environ 5 litres de sang par minute.",
    xp: 8,
  },
  {
    subject: "sciences", theme: "Matière", type: "qcm", difficulty: "moyen",
    enonce: "Quelle est la formule chimique de l'eau ?",
    choices: ["CO₂", "O₂", "H₂O", "NaCl"],
    answer_index: 2,
    explanation: "L'eau est formée de 2 atomes d'hydrogène (H) et 1 atome d'oxygène (O) : H₂O. C'est la molécule la plus abondante sur Terre.",
    xp: 15,
  },
  {
    subject: "sciences", theme: "Le vivant", type: "association", difficulty: "moyen",
    enonce: "Associe chaque animal à son type de reproduction :",
    pairs: [["Poule", "Ovipare (ponte d'œufs)"], ["Vache", "Vivipare (naissance directe)"], ["Grenouille", "Ovipare (dans l'eau)"]],
    explanation: "Les animaux ovipares pondent des œufs (oiseaux, reptiles, poissons, amphibiens). Les vivipares donnent naissance à des petits déjà formés (mammifères).",
    xp: 15,
  },
  {
    subject: "sciences", theme: "Corps humain", type: "identification", difficulty: "difficile",
    enonce: "Quel organe suis-je ?",
    hints: [
      "Je suis le plus grand organe du corps humain",
      "Je protège les autres organes de l'extérieur",
      "Je régule la température du corps et empêche la déshydratation",
    ],
    answer_text: "la peau",
    explanation: "La peau est le plus grand organe du corps (environ 2 m²). Elle protège contre les microbes, régule la température, et contient des récepteurs sensoriels.",
    xp: 20,
  },
];

// ─── Export groupé ─────────────────────────────────────────────────────────

export const ALL_DEMO_QUESTIONS: DemoQuestion[] = [
  ...DEMO_MATHS,
  ...DEMO_FRANCAIS,
  ...DEMO_HISTOIRE,
  ...DEMO_GEO,
  ...DEMO_SCIENCES,
];
