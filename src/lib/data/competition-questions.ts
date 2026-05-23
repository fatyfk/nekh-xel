// Banque de questions pour le mode compétition Génie en Herbe
// Mélange de QCM, Vrai/Faux, Association, Identification avec indices progressifs

export type CompQType = "qcm" | "vrai_faux" | "association" | "identification";

export interface CompQuestion {
  id: string;
  subject: string;
  subjectIcon: string;
  type: CompQType;
  difficulty: "facile" | "moyen" | "difficile";
  enonce: string;
  // QCM
  choices?: string[];
  answer_index?: number;
  // Vrai/Faux
  answer_bool?: boolean;
  // Association : paires [gauche, droite] mélangées à l'affichage
  pairs?: [string, string][];
  // Identification : indices révélés un par un
  hints?: string[];
  answer_text?: string;
  explanation: string;
  // Droit de réplique : question alternative si l'équipe adverse répond mal
  replique?: string;
}

export const COMPETITION_QUESTIONS: CompQuestion[] = [
  // ─── QCM ─────────────────────────────────────────────────
  {
    id: "c1", subject: "Histoire", subjectIcon: "🏛️", type: "qcm", difficulty: "moyen",
    enonce: "Quel est le nom du damel du Cayor qui résista à la colonisation française et mourut à la bataille de Dekhele en 1886 ?",
    choices: ["Cheikh Ahmadou Bamba", "Lat Dior", "El Hadj Umar Tall", "Boubacar Boris Diop"],
    answer_index: 1,
    explanation: "Lat Dior Ngoné Latyr Diop, damel du Cayor, préféra mourir en combattant plutôt que de voir le chemin de fer traverser son royaume.",
    replique: "Dans quel royaume régnait Lat Dior ?",
  },
  {
    id: "c2", subject: "Géographie", subjectIcon: "🌍", type: "qcm", difficulty: "facile",
    enonce: "Combien de régions administratives compte le Sénégal depuis la réforme de 2008 ?",
    choices: ["10", "12", "14", "16"],
    answer_index: 2,
    explanation: "Le Sénégal compte 14 régions depuis 2008 : Dakar, Thiès, Saint-Louis, Diourbel, Fatick, Kaolack, Kaffrine, Louga, Tambacounda, Kédougou, Kolda, Sédhiou, Ziguinchor et Matam.",
    replique: "Quelle est la capitale de la région de Ziguinchor ?",
  },
  {
    id: "c3", subject: "Mathématiques", subjectIcon: "🔢", type: "qcm", difficulty: "facile",
    enonce: "Moussa achète 8 cahiers à 350 F CFA chacun et 4 stylos à 150 F CFA chacun. Combien dépense-t-il au total ?",
    choices: ["2 400 F CFA", "3 000 F CFA", "3 400 F CFA", "3 800 F CFA"],
    answer_index: 2,
    explanation: "Cahiers : 8 × 350 = 2 800 F. Stylos : 4 × 150 = 600 F. Total : 2 800 + 600 = 3 400 F CFA.",
    replique: "Combien coûtent seulement les cahiers ?",
  },
  {
    id: "c4", subject: "Français", subjectIcon: "📖", type: "qcm", difficulty: "moyen",
    enonce: "Dans la phrase « Hier, Aminata est allée à l'école », quelle est la nature du mot « allée » ?",
    choices: ["Un verbe à l'infinitif", "Un participe passé", "Un adjectif qualificatif", "Un nom commun"],
    answer_index: 1,
    explanation: "« allée » est le participe passé du verbe « aller », utilisé avec l'auxiliaire « être » pour former le passé composé.",
    replique: "Avec quel auxiliaire se conjugue le verbe aller au passé composé ?",
  },
  {
    id: "c5", subject: "Sciences", subjectIcon: "🔬", type: "qcm", difficulty: "moyen",
    enonce: "Dans la chaîne alimentaire herbe → criquet → grenouille → serpent → aigle, quel animal est un prédateur de la grenouille ?",
    choices: ["Le criquet", "L'herbe", "Le serpent", "L'aigle"],
    answer_index: 2,
    explanation: "Le serpent se nourrit de la grenouille : il est donc son prédateur. L'aigle, lui, est le prédateur du serpent.",
    replique: "Quel animal est la proie du criquet dans cette chaîne ?",
  },
  {
    id: "c6", subject: "Histoire", subjectIcon: "🏛️", type: "qcm", difficulty: "difficile",
    enonce: "Qui a fondé l'Empire du Mali au XIIIe siècle après sa victoire sur Soumaoro Kanté à la bataille de Kirina ?",
    choices: ["Kankou Moussa", "Soundiata Keïta", "Askia Mohamed", "Cheikh Ahmadou Bamba"],
    answer_index: 1,
    explanation: "Soundiata Keïta fonda l'Empire du Mali vers 1235 après avoir vaincu le sorcier-roi Soumaoro Kanté du Sosso à la bataille de Kirina.",
    replique: "Dans quel pays actuel se trouve Kirina, lieu de la bataille de fondation de l'Empire du Mali ?",
  },
  {
    id: "c7", subject: "Mathématiques", subjectIcon: "🔢", type: "qcm", difficulty: "facile",
    enonce: "Un carré a un périmètre de 32 cm. Quelle est la longueur de chacun de ses côtés ?",
    choices: ["6 cm", "8 cm", "10 cm", "12 cm"],
    answer_index: 1,
    explanation: "Périmètre du carré = 4 × côté, donc côté = 32 ÷ 4 = 8 cm.",
    replique: "Quelle est la formule du périmètre d'un carré ?",
  },
  {
    id: "c8", subject: "Géographie", subjectIcon: "🌍", type: "qcm", difficulty: "moyen",
    enonce: "Quel fleuve forme la frontière naturelle entre le Sénégal et la Mauritanie ?",
    choices: ["Le fleuve Casamance", "Le fleuve Gambie", "Le fleuve Sénégal", "Le fleuve Sine"],
    answer_index: 2,
    explanation: "Le fleuve Sénégal (1 790 km) marque la frontière nord du pays avec la Mauritanie avant de se jeter dans l'Atlantique à Saint-Louis.",
    replique: "Dans quelle ville sénégalaise le fleuve Sénégal se jette-t-il dans l'Atlantique ?",
  },

  // ─── Vrai/Faux ───────────────────────────────────────────
  {
    id: "c9", subject: "Histoire", subjectIcon: "🏛️", type: "vrai_faux", difficulty: "facile",
    enonce: "Le Sénégal a obtenu son indépendance le 4 avril 1960.",
    answer_bool: true,
    explanation: "VRAI. Le 4 avril 1960 est la date de l'indépendance du Sénégal vis-à-vis de la France. C'est la fête nationale sénégalaise.",
    replique: "De quel pays le Sénégal s'est-il libéré en 1960 ?",
  },
  {
    id: "c10", subject: "Sciences", subjectIcon: "🔬", type: "vrai_faux", difficulty: "moyen",
    enonce: "L'eau bout à 0°C au niveau de la mer.",
    answer_bool: false,
    explanation: "FAUX. L'eau bout à 100°C au niveau de la mer. Elle gèle (se solidifie) à 0°C.",
    replique: "À quelle température l'eau se solidifie-t-elle ?",
  },
  {
    id: "c11", subject: "Français", subjectIcon: "📖", type: "vrai_faux", difficulty: "moyen",
    enonce: "Lat Dior, damel du Cayor, a accepté la construction du chemin de fer Dakar–Saint-Louis avant de mourir en 1886.",
    answer_bool: false,
    explanation: "FAUX. Lat Dior a résisté farouchement à la construction du chemin de fer. Il mourut à la bataille de Dekhele en refusant de se soumettre.",
    replique: "Quelle est la bataille où Lat Dior a trouvé la mort ?",
  },
  {
    id: "c12", subject: "Mathématiques", subjectIcon: "🔢", type: "vrai_faux", difficulty: "facile",
    enonce: "L'aire d'un rectangle de 6 cm de long et 4 cm de large est égale à 24 cm².",
    answer_bool: true,
    explanation: "VRAI. Aire = longueur × largeur = 6 × 4 = 24 cm².",
    replique: "Quelle est la formule de l'aire d'un rectangle ?",
  },

  // ─── Association (relier) ─────────────────────────────────
  {
    id: "c13", subject: "Histoire", subjectIcon: "🏛️", type: "association", difficulty: "moyen",
    enonce: "Relier chaque souverain africain à son empire ou royaume :",
    pairs: [
      ["Kankou Moussa", "Empire du Mali"],
      ["Askia Mohamed", "Empire Songhaï"],
      ["Soundiata Keïta", "Fondateur de l'Empire du Mali"],
      ["Lat Dior", "Royaume du Cayor"],
    ],
    explanation: "Kankou Moussa (Mali), Askia Mohamed (Songhaï), Soundiata Keïta (fondateur du Mali), Lat Dior (Cayor sénégalais).",
    replique: "Quel empire Askia Mohamed a-t-il dirigé ?",
  },
  {
    id: "c14", subject: "Géographie", subjectIcon: "🌍", type: "association", difficulty: "moyen",
    enonce: "Relier chaque pays africain à sa capitale :",
    pairs: [
      ["Sénégal", "Dakar"],
      ["Mali", "Bamako"],
      ["Guinée", "Conakry"],
      ["Mauritanie", "Nouakchott"],
    ],
    explanation: "Les capitales des pays voisins du Sénégal : Mali→Bamako, Guinée→Conakry, Mauritanie→Nouakchott.",
    replique: "Quelle est la capitale du Mali ?",
  },
  {
    id: "c15", subject: "Sciences", subjectIcon: "🔬", type: "association", difficulty: "moyen",
    enonce: "Relier chaque organe à sa fonction principale :",
    pairs: [
      ["Le cœur", "Pomper le sang"],
      ["Les poumons", "Respirer l'air"],
      ["Le foie", "Filtrer le sang"],
      ["L'estomac", "Digérer les aliments"],
    ],
    explanation: "Chaque organe a une fonction vitale : le cœur pour la circulation, les poumons pour la respiration, le foie pour la filtration, l'estomac pour la digestion.",
    replique: "Quel organe pompe le sang dans le corps ?",
  },
  {
    id: "c16", subject: "Français", subjectIcon: "📖", type: "association", difficulty: "difficile",
    enonce: "Relier chaque temps verbal à son exemple :",
    pairs: [
      ["Passé composé", "Aminata est allée à l'école"],
      ["Imparfait", "Il pleuvait tous les jours"],
      ["Futur simple", "Nous partirons demain"],
      ["Présent", "Les enfants jouent dehors"],
    ],
    explanation: "Chaque temps verbal exprime une relation différente au temps : révolu (passé composé), habituel (imparfait), à venir (futur), actuel (présent).",
    replique: "Quel temps utilise-t-on pour parler d'une action habituelle dans le passé ?",
  },

  // ─── Identification (Qui suis-je ?) ──────────────────────
  {
    id: "c17", subject: "Géographie", subjectIcon: "🌍", type: "identification", difficulty: "difficile",
    enonce: "Qui suis-je ?",
    hints: [
      "Indice 1 : Je suis une ville sénégalaise, capitale d'une région qui porte mon nom.",
      "Indice 2 : Je suis en Casamance, au sud du Sénégal.",
      "Indice 3 : Le fleuve Casamance me traverse et je suis proche de la Guinée-Bissau.",
    ],
    answer_text: "Ziguinchor",
    explanation: "Ziguinchor est la capitale de la région éponyme en Casamance. C'est la principale ville du sud du Sénégal, riche en biodiversité et en cultures.",
    replique: "Dans quelle région naturelle du Sénégal se trouve Ziguinchor ?",
  },
  {
    id: "c18", subject: "Histoire", subjectIcon: "🏛️", type: "identification", difficulty: "difficile",
    enonce: "Qui suis-je ?",
    hints: [
      "Indice 1 : Je suis né vers 1853 à Mbacké Baol, au Sénégal.",
      "Indice 2 : Je suis le fondateur de la confrérie des Mourides.",
      "Indice 3 : Les Sénégalais m'appellent Khadimou Rassoul et je suis exilé par les Français en 1895.",
    ],
    answer_text: "Cheikh Ahmadou Bamba",
    explanation: "Cheikh Ahmadou Bamba Mbacké (1853-1927), fondateur du mouridisme, résista à la colonisation par la foi et le travail. Sa ville sainte est Touba.",
    replique: "Quelle ville sainte Cheikh Ahmadou Bamba a-t-il fondée ?",
  },
  {
    id: "c19", subject: "Sciences", subjectIcon: "🔬", type: "identification", difficulty: "moyen",
    enonce: "Qui suis-je ?",
    hints: [
      "Indice 1 : Je bats environ 70 fois par minute au repos.",
      "Indice 2 : Je suis un muscle creux situé dans la poitrine.",
      "Indice 3 : Je pompe le sang dans tout le corps humain.",
    ],
    answer_text: "Le cœur",
    explanation: "Le cœur est le moteur de la circulation sanguine : il bat ~70 fois/min au repos, soit plus de 100 000 battements par jour.",
    replique: "Dans quelle cavité du corps le cœur se trouve-t-il ?",
  },
  {
    id: "c20", subject: "Mathématiques", subjectIcon: "🔢", type: "identification", difficulty: "moyen",
    enonce: "Quel nombre suis-je ?",
    hints: [
      "Indice 1 : Je suis un nombre pair inférieur à 100.",
      "Indice 2 : Je suis divisible par 9 et par 8.",
      "Indice 3 : Je suis le plus petit nombre divisible à la fois par 8 et par 9.",
    ],
    answer_text: "72",
    explanation: "72 = 8 × 9. C'est le plus petit commun multiple (PPCM) de 8 et de 9. 72 ÷ 8 = 9 et 72 ÷ 9 = 8.",
    replique: "Quel est le résultat de 8 × 9 ?",
  },
];
