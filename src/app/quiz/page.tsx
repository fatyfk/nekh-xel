"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { processQuizCompletion, getEncouragingMessage, type Badge } from "@/lib/gamification";

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = "facile" | "moyen" | "difficile";
type QType = "qcm" | "vrai_faux" | "association" | "identification";

interface QCMQuestion {
  type: "qcm";
  id: string;
  subject: string;
  theme: string;
  difficulty: Difficulty;
  enonce: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
  xp: number;
}
interface VraiFauxQuestion {
  type: "vrai_faux";
  id: string;
  subject: string;
  theme: string;
  difficulty: Difficulty;
  enonce: string;
  answer: boolean;
  explanation: string;
  xp: number;
}
interface AssocQuestion {
  type: "association";
  id: string;
  subject: string;
  theme: string;
  difficulty: Difficulty;
  enonce: string;
  pairs: [string, string][];
  explanation: string;
  xp: number;
}
interface IdentQuestion {
  type: "identification";
  id: string;
  subject: string;
  theme: string;
  difficulty: Difficulty;
  enonce: string;
  hints: string[];
  answer: string;
  explanation: string;
  xp: number;
}
type Question = QCMQuestion | VraiFauxQuestion | AssocQuestion | IdentQuestion;

// ─── Data ────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: "maths",      label: "Mathématiques",      icon: "🔢", color: "from-blue-500 to-blue-700",     themes: ["Nombres", "Géométrie", "Mesures", "Problèmes"] },
  { id: "francais",   label: "Français",            icon: "📖", color: "from-violet-500 to-purple-700", themes: ["Lecture", "Vocabulaire", "Expression écrite"] },
  { id: "histoire",   label: "Histoire",            icon: "🏛️", color: "from-amber-500 to-orange-600",  themes: ["Empires africains", "Colonisation", "Indépendance"] },
  { id: "geo",        label: "Géographie",          icon: "🌍", color: "from-emerald-500 to-green-700", themes: ["Sénégal", "Afrique", "Monde"] },
  { id: "sciences",   label: "Sciences",            icon: "🔬", color: "from-red-500 to-rose-700",      themes: ["Le vivant", "Matière", "Énergie"] },
  { id: "civique",    label: "Instruction civique", icon: "⚖️", color: "from-cyan-500 to-teal-700",     themes: ["Droits", "Devoirs", "Institutions"] },
  { id: "ortho",      label: "Orthographe",         icon: "✏️", color: "from-pink-500 to-fuchsia-600",  themes: ["Accord", "Homophones", "Dictée"] },
  { id: "conjugaison",label: "Conjugaison",         icon: "🔤", color: "from-indigo-500 to-indigo-700", themes: ["Présent", "Passé", "Futur"] },
  { id: "grammaire",  label: "Grammaire",           icon: "📝", color: "from-teal-500 to-cyan-700",     themes: ["Noms", "Verbes", "Phrases"] },
  { id: "calcul",     label: "Calcul mental",       icon: "🧮", color: "from-orange-500 to-amber-600",  themes: ["Addition", "Multiplication", "Division"] },
  { id: "culture",    label: "Culture générale",    icon: "🌟", color: "from-rose-500 to-pink-700",     themes: ["Sénégal", "Afrique", "Monde"] },
] as const;

type SubjectId = typeof SUBJECTS[number]["id"];

const QUESTIONS: Question[] = [
  // ── Maths ──
  {
    type: "qcm", id: "m1", subject: "maths", theme: "Nombres", difficulty: "facile",
    enonce: "Combien font 7 × 8 ?",
    choices: ["54", "56", "48", "63"],
    answer: 1,
    explanation: "7 × 8 = 56. Astuce : 7 × 8 = 7 × 4 × 2 = 28 × 2 = 56.",
    xp: 10,
  },
  {
    type: "qcm", id: "m2", subject: "maths", theme: "Géométrie", difficulty: "moyen",
    enonce: "Un carré de côté 5 cm a un périmètre de :",
    choices: ["10 cm", "15 cm", "20 cm", "25 cm"],
    answer: 2,
    explanation: "Périmètre d'un carré = 4 × côté = 4 × 5 = 20 cm.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "m3", subject: "maths", theme: "Mesures", difficulty: "facile",
    enonce: "1 kilomètre = 1 000 mètres",
    answer: true,
    explanation: "Vrai ! Le préfixe 'kilo' signifie 1000. Donc 1 km = 1 000 m.",
    xp: 8,
  },
  {
    type: "qcm", id: "m4", subject: "maths", theme: "Problèmes", difficulty: "difficile",
    enonce: "Aminata a 48 biscuits. Elle les partage équitablement entre 6 amis. Combien chaque ami reçoit-il ?",
    choices: ["6", "7", "8", "9"],
    answer: 2,
    explanation: "48 ÷ 6 = 8. Chaque ami reçoit 8 biscuits.",
    xp: 20,
  },
  {
    type: "association", id: "m5", subject: "maths", theme: "Géométrie", difficulty: "moyen",
    enonce: "Associe chaque forme à son nombre de côtés :",
    pairs: [["Triangle", "3"], ["Carré", "4"], ["Pentagone", "5"]],
    explanation: "Triangle = 3 côtés, Carré = 4 côtés, Pentagone = 5 côtés.",
    xp: 15,
  },
  // ── Français ──
  {
    type: "qcm", id: "f1", subject: "francais", theme: "Vocabulaire", difficulty: "facile",
    enonce: "Quel est le synonyme du mot 'rapide' ?",
    choices: ["Lent", "Vite", "Grand", "Fort"],
    answer: 1,
    explanation: "'Rapide' et 'vite' ont le même sens. Ce sont des synonymes.",
    xp: 10,
  },
  {
    type: "vrai_faux", id: "f2", subject: "francais", theme: "Vocabulaire", difficulty: "moyen",
    enonce: "Le mot 'chat' et le mot 'chien' sont des synonymes.",
    answer: false,
    explanation: "Faux ! Ce sont deux animaux différents. Un synonyme doit avoir le même sens.",
    xp: 10,
  },
  {
    type: "qcm", id: "f3", subject: "francais", theme: "Lecture", difficulty: "moyen",
    enonce: "Dans la phrase 'Le petit garçon mange une pomme', quel est le sujet ?",
    choices: ["mange", "une pomme", "Le petit garçon", "petit"],
    answer: 2,
    explanation: "Le sujet dit qui fait l'action. 'Le petit garçon' fait l'action de manger.",
    xp: 15,
  },
  {
    type: "identification", id: "f4", subject: "francais", theme: "Vocabulaire", difficulty: "difficile",
    enonce: "Quel mot suis-je ?",
    hints: ["Je suis un animal africain", "J'ai une très longue cou", "Je suis le plus grand animal terrestre"],
    answer: "girafe",
    explanation: "La girafe est le plus grand animal terrestre grâce à son long cou qui lui permet de manger les feuilles des arbres.",
    xp: 25,
  },
  {
    type: "association", id: "f5", subject: "francais", theme: "Vocabulaire", difficulty: "moyen",
    enonce: "Associe chaque mot à son contraire :",
    pairs: [["Grand", "Petit"], ["Chaud", "Froid"], ["Rapide", "Lent"]],
    explanation: "Les contraires ou antonymes sont des mots de sens opposés.",
    xp: 15,
  },
  // ── Histoire ──
  {
    type: "qcm", id: "h1", subject: "histoire", theme: "Empires africains", difficulty: "moyen",
    enonce: "Quel empire africain a eu Soundiata Keïta comme fondateur ?",
    choices: ["Empire du Ghana", "Empire du Mali", "Empire Songhaï", "Empire du Kanem"],
    answer: 1,
    explanation: "Soundiata Keïta a fondé l'Empire du Mali au XIIIe siècle. Il est célèbre dans l'épopée mandingue.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "h2", subject: "histoire", theme: "Empires africains", difficulty: "facile",
    enonce: "Dakar est la capitale du Sénégal depuis l'indépendance en 1960.",
    answer: true,
    explanation: "Vrai ! Le Sénégal a obtenu son indépendance le 4 avril 1960 et Dakar en est la capitale.",
    xp: 10,
  },
  {
    type: "qcm", id: "h3", subject: "histoire", theme: "Indépendance", difficulty: "difficile",
    enonce: "Qui était le premier président du Sénégal ?",
    choices: ["Abdou Diouf", "Léopold Sédar Senghor", "Abdoulaye Wade", "Macky Sall"],
    answer: 1,
    explanation: "Léopold Sédar Senghor fut le premier président du Sénégal de 1960 à 1980. Il était aussi un grand poète.",
    xp: 20,
  },
  {
    type: "association", id: "h4", subject: "histoire", theme: "Empires africains", difficulty: "moyen",
    enonce: "Associe chaque empire à sa capitale :",
    pairs: [["Empire du Mali", "Koumbi Saleh"], ["Empire Songhaï", "Gao"], ["Empire du Ghana", "Tombouctou"]],
    explanation: "Ces empires médiévaux africains avaient chacun leur grande capitale.",
    xp: 15,
  },
  {
    type: "identification", id: "h5", subject: "histoire", theme: "Colonisation", difficulty: "difficile",
    enonce: "Devine ce personnage historique sénégalais :",
    hints: ["Né à Saint-Louis en 1821", "Il a résisté à la colonisation française", "Son vrai nom est Lat Dior Ngoné Latyr Diop"],
    answer: "Lat Dior",
    explanation: "Lat Dior est un héros national sénégalais. Il a combattu vaillamment contre la colonisation française et le chemin de fer Dakar-Saint-Louis.",
    xp: 25,
  },
  // ── Géographie ──
  {
    type: "qcm", id: "g1", subject: "geo", theme: "Sénégal", difficulty: "facile",
    enonce: "Quel est le plus long fleuve du Sénégal ?",
    choices: ["Fleuve Casamance", "Fleuve Gambie", "Fleuve Sénégal", "Fleuve Sine"],
    answer: 2,
    explanation: "Le Fleuve Sénégal est le plus long. Il borde la frontière nord avec la Mauritanie.",
    xp: 10,
  },
  {
    type: "vrai_faux", id: "g2", subject: "geo", theme: "Sénégal", difficulty: "facile",
    enonce: "Le Sénégal est entièrement entouré par la Gambie.",
    answer: false,
    explanation: "Faux ! C'est la Gambie qui est presque entièrement entourée par le Sénégal. Le Sénégal a une côte atlantique.",
    xp: 10,
  },
  {
    type: "qcm", id: "g3", subject: "geo", theme: "Sénégal", difficulty: "moyen",
    enonce: "Combien de régions administratives compte le Sénégal ?",
    choices: ["10", "12", "14", "16"],
    answer: 2,
    explanation: "Le Sénégal compte 14 régions administratives depuis 2008.",
    xp: 15,
  },
  {
    type: "association", id: "g4", subject: "geo", theme: "Afrique", difficulty: "moyen",
    enonce: "Associe chaque pays à sa capitale :",
    pairs: [["Mali", "Bamako"], ["Côte d'Ivoire", "Yamoussoukro"], ["Guinée", "Conakry"]],
    explanation: "Les capitales des pays voisins du Sénégal en Afrique de l'Ouest.",
    xp: 15,
  },
  {
    type: "identification", id: "g5", subject: "geo", theme: "Sénégal", difficulty: "difficile",
    enonce: "Quelle ville sénégalaise suis-je ?",
    hints: ["Je suis la deuxième ville du Sénégal", "Je suis surnommée 'la capitale du Nord'", "Je suis au bord du fleuve Sénégal"],
    answer: "Saint-Louis",
    explanation: "Saint-Louis est une ville historique classée au patrimoine mondial de l'UNESCO, ancienne capitale du Sénégal colonial.",
    xp: 25,
  },
  // ── Sciences ──
  {
    type: "qcm", id: "sc1", subject: "sciences", theme: "Le vivant", difficulty: "facile",
    enonce: "Quelle est la fonction principale des feuilles d'une plante ?",
    choices: ["Absorber l'eau", "Faire la photosynthèse", "Stocker les nutriments", "Reproduire la plante"],
    answer: 1,
    explanation: "Les feuilles réalisent la photosynthèse : elles transforment la lumière solaire en énergie pour la plante.",
    xp: 10,
  },
  {
    type: "vrai_faux", id: "sc2", subject: "sciences", theme: "Le vivant", difficulty: "facile",
    enonce: "Les poissons respirent grâce à des poumons.",
    answer: false,
    explanation: "Faux ! Les poissons respirent grâce à des branchies qui filtrent l'oxygène dissous dans l'eau.",
    xp: 8,
  },
  {
    type: "qcm", id: "sc3", subject: "sciences", theme: "Matière", difficulty: "moyen",
    enonce: "À quelle température l'eau se transforme-t-elle en glace ?",
    choices: ["100°C", "50°C", "0°C", "-10°C"],
    answer: 2,
    explanation: "L'eau gèle (se solidifie) à 0°C et bout à 100°C à pression normale.",
    xp: 10,
  },
  {
    type: "association", id: "sc4", subject: "sciences", theme: "Le vivant", difficulty: "moyen",
    enonce: "Associe chaque animal à son mode de déplacement :",
    pairs: [["Oiseau", "Vol"], ["Poisson", "Nage"], ["Serpent", "Rampe"]],
    explanation: "Les animaux se déplacent de différentes façons selon leur morphologie.",
    xp: 15,
  },
  {
    type: "identification", id: "sc5", subject: "sciences", theme: "Le vivant", difficulty: "difficile",
    enonce: "Quel organe suis-je ?",
    hints: ["Je suis dans ta poitrine", "Je bats environ 70 fois par minute", "Je pompe le sang dans tout le corps"],
    answer: "le cœur",
    explanation: "Le cœur est un muscle qui bat sans arrêt pour faire circuler le sang et apporter l'oxygène à tous les organes.",
    xp: 20,
  },
  // ── Instruction civique ──
  {
    type: "qcm", id: "c1", subject: "civique", theme: "Institutions", difficulty: "moyen",
    enonce: "Qui est le chef de l'État au Sénégal ?",
    choices: ["Le Premier Ministre", "Le Président de l'Assemblée", "Le Président de la République", "Le Maire de Dakar"],
    answer: 2,
    explanation: "Le Président de la République est le chef de l'État au Sénégal, élu pour 5 ans.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "c2", subject: "civique", theme: "Droits", difficulty: "facile",
    enonce: "Tous les enfants ont le droit d'aller à l'école.",
    answer: true,
    explanation: "Vrai ! L'éducation est un droit fondamental reconnu par la Convention des droits de l'enfant.",
    xp: 8,
  },
  {
    type: "qcm", id: "c3", subject: "civique", theme: "Devoirs", difficulty: "facile",
    enonce: "Quel est le devoir de chaque citoyen sénégalais dès 18 ans ?",
    choices: ["Payer des impôts", "Voter aux élections", "Servir dans l'armée", "Travailler pour l'État"],
    answer: 1,
    explanation: "Voter est à la fois un droit et un devoir civique. Chaque citoyen de 18 ans peut participer aux élections.",
    xp: 10,
  },
  // ── Orthographe ──
  {
    type: "qcm", id: "o1", subject: "ortho", theme: "Accord", difficulty: "moyen",
    enonce: "Choisissez la bonne orthographe : 'Les enfants sont ___'",
    choices: ["content", "contente", "contents", "contentes"],
    answer: 2,
    explanation: "'Enfants' est masculin pluriel, donc l'adjectif prend la marque du pluriel masculin : 'contents'.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "o2", subject: "ortho", theme: "Homophones", difficulty: "moyen",
    enonce: "'a' (verbe avoir) et 'à' (préposition) se prononcent de la même façon.",
    answer: true,
    explanation: "Vrai ! Ces deux mots sont des homophones : même prononciation, orthographe et sens différents.",
    xp: 10,
  },
  {
    type: "qcm", id: "o3", subject: "ortho", theme: "Dictée", difficulty: "difficile",
    enonce: "Quelle est la bonne orthographe ?",
    choices: ["des chevaus", "des chevals", "des chevaux", "des cheval"],
    answer: 2,
    explanation: "Le pluriel irrégulier de 'cheval' est 'chevaux'. Les mots en -al font souvent leur pluriel en -aux.",
    xp: 20,
  },
  // ── Conjugaison ──
  {
    type: "qcm", id: "co1", subject: "conjugaison", theme: "Présent", difficulty: "facile",
    enonce: "Conjuguez 'manger' au présent avec 'nous' :",
    choices: ["nous mangons", "nous mangeons", "nous mangons", "nous mang"],
    answer: 1,
    explanation: "Les verbes en -ger prennent un 'e' avant -ons pour conserver le son [ʒ] : nous mangeons.",
    xp: 10,
  },
  {
    type: "qcm", id: "co2", subject: "conjugaison", theme: "Passé", difficulty: "moyen",
    enonce: "Quelle est la forme correcte du passé composé ? 'Elle ___ à l'école.'",
    choices: ["a allé", "est allée", "a été allée", "est allé"],
    answer: 1,
    explanation: "'Aller' se conjugue avec l'auxiliaire 'être'. Le participe passé s'accorde avec le sujet féminin : 'est allée'.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "co3", subject: "conjugaison", theme: "Futur", difficulty: "moyen",
    enonce: "Au futur simple, 'je ferai' est la bonne conjugaison de 'faire'.",
    answer: true,
    explanation: "Vrai ! 'Faire' est un verbe irrégulier au futur : je ferai, tu feras, il fera...",
    xp: 12,
  },
  // ── Grammaire ──
  {
    type: "qcm", id: "gr1", subject: "grammaire", theme: "Noms", difficulty: "facile",
    enonce: "Dans 'La belle maison bleue', combien y a-t-il d'adjectifs qualificatifs ?",
    choices: ["1", "2", "3", "0"],
    answer: 1,
    explanation: "'Belle' et 'bleue' sont les deux adjectifs qualificatifs qui décrivent le nom 'maison'.",
    xp: 10,
  },
  {
    type: "vrai_faux", id: "gr2", subject: "grammaire", theme: "Verbes", difficulty: "moyen",
    enonce: "Dans 'Le chat mange la souris', 'la souris' est le complément d'objet direct (COD).",
    answer: true,
    explanation: "Vrai ! 'La souris' répond à la question 'mange quoi ?' → c'est le COD.",
    xp: 12,
  },
  {
    type: "qcm", id: "gr3", subject: "grammaire", theme: "Phrases", difficulty: "difficile",
    enonce: "Quelle est la nature du mot souligné : 'Elle court RAPIDEMENT.'",
    choices: ["Adjectif", "Nom", "Adverbe", "Verbe"],
    answer: 2,
    explanation: "'Rapidement' modifie le verbe 'court', c'est donc un adverbe de manière.",
    xp: 20,
  },
  // ── Calcul mental ──
  {
    type: "qcm", id: "ca1", subject: "calcul", theme: "Multiplication", difficulty: "facile",
    enonce: "Combien font 6 × 9 ?",
    choices: ["52", "54", "56", "63"],
    answer: 1,
    explanation: "6 × 9 = 54. Astuce : 6 × 9 = 6 × 10 - 6 = 60 - 6 = 54.",
    xp: 10,
  },
  {
    type: "qcm", id: "ca2", subject: "calcul", theme: "Addition", difficulty: "facile",
    enonce: "Calcule rapidement : 47 + 38 = ?",
    choices: ["75", "85", "84", "95"],
    answer: 1,
    explanation: "47 + 38 = 47 + 40 - 2 = 87 - 2 = 85.",
    xp: 10,
  },
  {
    type: "vrai_faux", id: "ca3", subject: "calcul", theme: "Division", difficulty: "moyen",
    enonce: "72 est divisible par 9.",
    answer: true,
    explanation: "Vrai ! 72 ÷ 9 = 8. La somme des chiffres de 72 est 7+2=9, multiple de 9 : donc 72 est divisible par 9.",
    xp: 12,
  },
  // ── Culture générale ──
  {
    type: "qcm", id: "cu1", subject: "culture", theme: "Sénégal", difficulty: "facile",
    enonce: "Quelle est la devise du Sénégal ?",
    choices: ["Un peuple, un but, une foi", "Liberté, Égalité, Fraternité", "Unité, Travail, Progrès", "Paix, Justice, Solidarité"],
    answer: 0,
    explanation: "La devise du Sénégal est 'Un peuple, un but, une foi'. Elle exprime l'unité nationale.",
    xp: 15,
  },
  {
    type: "qcm", id: "cu2", subject: "culture", theme: "Afrique", difficulty: "moyen",
    enonce: "Quelle est la plus grande ville d'Afrique ?",
    choices: ["Dakar", "Lagos", "Le Caire", "Kinshasa"],
    answer: 2,
    explanation: "Le Caire, capitale de l'Égypte, est la plus grande ville d'Afrique avec plus de 20 millions d'habitants.",
    xp: 15,
  },
  {
    type: "vrai_faux", id: "cu3", subject: "culture", theme: "Monde", difficulty: "moyen",
    enonce: "La Tour Eiffel se trouve à Paris.",
    answer: true,
    explanation: "Vrai ! La Tour Eiffel, construite en 1889 par Gustave Eiffel, est le monument le plus visité au monde.",
    xp: 8,
  },
];

// ─── Encouragements ──────────────────────────────────────────────────────────

const CORRECT_MSGS = ["🎉 Excellent !", "🌟 Bravo !", "🔥 Super !", "✨ Parfait !", "🏆 Génial !"];
const WRONG_MSGS   = ["😊 Continue !", "💪 Courage !", "📚 Rappelle-toi !", "🌱 Tu progresses !"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Timer Ring ───────────────────────────────────────────────────────────────

function TimerRing({ current, total }: { current: number; total: number }) {
  const pct = current / total;
  const r = 24, circ = 2 * Math.PI * r;
  const color = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.5s" }} />
      </svg>
      <span className={`font-black text-lg z-10 ${pct <= 0.25 ? "text-red-600" : "text-gray-800"}`}>{current}</span>
    </div>
  );
}

// ─── Screen 1 : Subject Selection ────────────────────────────────────────────

function SubjectScreen({ onSelect }: { onSelect: (id: SubjectId) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/dashboard/student" className="inline-flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm mb-4">
            ← Accueil
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">📚 Choisis ta matière</h1>
          <p className="text-indigo-200 text-lg">11 matières du programme CM2 sénégalais</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => onSelect(s.id as SubjectId)}
              className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 flex flex-col items-center gap-2 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95`}>
              <span className="text-4xl">{s.icon}</span>
              <span className="font-black text-sm text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/quiz/history" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm">
            📊 Mon historique &amp; stats →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2 : Config ────────────────────────────────────────────────────────

function ConfigScreen({
  subjectId,
  onStart,
  onBack,
}: {
  subjectId: SubjectId;
  onStart: (difficulty: Difficulty, count: number) => void;
  onBack: () => void;
}) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const [difficulty, setDifficulty] = useState<Difficulty>("moyen");
  const [count, setCount]           = useState(5);

  const available = QUESTIONS.filter((q) => q.subject === subjectId && q.difficulty === difficulty).length;
  const max = Math.min(available, 10);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 text-sm mb-5 flex items-center gap-1">
          ← Retour
        </button>
        <div className={`bg-gradient-to-br ${subject.color} rounded-2xl p-5 text-white text-center mb-6`}>
          <div className="text-5xl mb-2">{subject.icon}</div>
          <h2 className="text-xl font-black">{subject.label}</h2>
        </div>

        <div className="mb-6">
          <p className="text-sm font-bold text-gray-600 mb-2">Niveau de difficulté</p>
          <div className="grid grid-cols-3 gap-2">
            {([["facile", "😊 Facile", "bg-emerald-500"], ["moyen", "🤔 Moyen", "bg-amber-500"], ["difficile", "🔥 Difficile", "bg-red-500"]] as const).map(
              ([d, label, bg]) => (
                <button key={d} onClick={() => { setDifficulty(d); setCount(Math.min(count, Math.min(QUESTIONS.filter(q => q.subject === subjectId && q.difficulty === d).length, 10))); }}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${difficulty === d ? `${bg} text-white shadow-md scale-105` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold text-gray-600 mb-2">Nombre de questions</p>
          <div className="flex gap-2 flex-wrap">
            {[3, 5, Math.min(8, max), max].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${count === n ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {n}
              </button>
            ))}
          </div>
          {max === 0 && (
            <p className="text-red-500 text-xs mt-2">Pas encore de questions pour ce niveau. Choisissez une autre difficulté.</p>
          )}
        </div>

        <button onClick={() => onStart(difficulty, count)} disabled={max === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-black rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
          Lancer le quiz ! 🚀
        </button>
      </div>
    </div>
  );
}

// ─── QCM Renderer ─────────────────────────────────────────────────────────────

function QCMRenderer({ q, onAnswer, answered }: { q: QCMQuestion; onAnswer: (i: number) => void; answered: number | null }) {
  const colors = ["from-blue-500 to-blue-600", "from-violet-500 to-violet-600", "from-amber-500 to-amber-600", "from-rose-500 to-rose-600"];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {q.choices.map((c, i) => {
        let cls = `w-full text-left p-4 rounded-2xl font-bold text-sm transition-all `;
        if (answered === null) {
          cls += `bg-gradient-to-r ${colors[i]} text-white hover:scale-102 hover:shadow-md active:scale-98`;
        } else if (i === q.answer) {
          cls += "bg-emerald-100 border-2 border-emerald-500 text-emerald-800";
        } else if (i === answered) {
          cls += "bg-red-100 border-2 border-red-400 text-red-800";
        } else {
          cls += "bg-gray-100 text-gray-400";
        }
        return (
          <button key={i} onClick={() => answered === null && onAnswer(i)} className={cls}>
            <span className="font-black mr-2">{["A", "B", "C", "D"][i]}.</span>{c}
          </button>
        );
      })}
    </div>
  );
}

// ─── VraiFaux Renderer ────────────────────────────────────────────────────────

function VraiFauxRenderer({ q, onAnswer, answered }: { q: VraiFauxQuestion; onAnswer: (v: boolean) => void; answered: boolean | null }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {([true, false] as const).map((val) => {
        let cls = "py-6 rounded-2xl font-black text-xl transition-all ";
        if (answered === null) {
          cls += val ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white hover:scale-105 shadow-md" : "bg-gradient-to-br from-red-400 to-rose-600 text-white hover:scale-105 shadow-md";
        } else if (val === q.answer) {
          cls += "bg-emerald-100 border-2 border-emerald-500 text-emerald-800";
        } else if (val === answered) {
          cls += "bg-red-100 border-2 border-red-400 text-red-800";
        } else {
          cls += "bg-gray-100 text-gray-400";
        }
        return (
          <button key={String(val)} onClick={() => answered === null && onAnswer(val)} className={cls}>
            {val ? "✅ VRAI" : "❌ FAUX"}
          </button>
        );
      })}
    </div>
  );
}

// ─── Association Renderer ─────────────────────────────────────────────────────

function AssocRenderer({ q, onAnswer, answered }: { q: AssocQuestion; onAnswer: () => void; answered: boolean | null }) {
  const rights = shuffle(q.pairs.map(([, r]) => r));
  const [sel, setSel] = useState<{ left: number | null; matched: Record<number, number> }>({ left: null, matched: {} });

  const handleLeft  = (i: number) => answered === null && setSel((s) => ({ ...s, left: s.left === i ? null : i }));
  const handleRight = (rVal: string) => {
    if (answered !== null || sel.left === null) return;
    const ri = rights.indexOf(rVal);
    setSel((s) => {
      const matched = { ...s.matched, [s.left!]: ri };
      if (Object.keys(matched).length === q.pairs.length) {
        const correct = q.pairs.every(([, r], li) => rights[matched[li]] === r);
        setTimeout(() => onAnswer(), 300);
        void correct;
      }
      return { left: null, matched };
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <div className="space-y-2">
        {q.pairs.map(([left], i) => {
          const isMatched = i in sel.matched;
          return (
            <button key={i} onClick={() => handleLeft(i)}
              className={`w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                isMatched ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                sel.left === i ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}>
              {left}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {rights.map((right, ri) => {
          const usedBy = Object.values(sel.matched).indexOf(ri);
          return (
            <button key={ri} onClick={() => handleRight(right)}
              className={`w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                usedBy >= 0 ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                sel.left !== null ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-gray-50 text-gray-600"}`}>
              {right}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Identification Renderer ──────────────────────────────────────────────────

function IdentRenderer({ q, onAnswer, answered }: { q: IdentQuestion; onAnswer: (correct: boolean) => void; answered: boolean | null }) {
  const [hintIdx, setHintIdx]   = useState(0);
  const [input, setInput]       = useState("");
  const [tried, setTried]       = useState(false);

  const check = () => {
    if (!input.trim()) return;
    setTried(true);
    const correct = input.trim().toLowerCase() === q.answer.toLowerCase();
    onAnswer(correct);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {q.hints.slice(0, hintIdx + 1).map((hint, i) => (
          <div key={i} className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
            <span className="text-amber-500 font-black text-sm">Indice {i + 1}</span>
            <p className="text-sm text-amber-900 font-medium">{hint}</p>
          </div>
        ))}
      </div>
      {hintIdx < q.hints.length - 1 && answered === null && (
        <button onClick={() => setHintIdx((v) => Math.min(v + 1, q.hints.length - 1))}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Voir l&apos;indice suivant
        </button>
      )}
      {answered === null && (
        <div className="flex gap-2 mt-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Ta réponse…"
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-400 focus:outline-none" />
          <button onClick={check}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl text-sm transition-colors">
            OK
          </button>
        </div>
      )}
      {tried && answered !== null && (
        <p className={`font-bold text-sm ${answered ? "text-emerald-600" : "text-red-500"}`}>
          {answered ? "✅ Correct !" : `❌ La réponse était : ${q.answer}`}
        </p>
      )}
    </div>
  );
}

// ─── Screen 3 : Quiz Runner ───────────────────────────────────────────────────

type QuizResult = { question: Question; correct: boolean; timeLeft: number };

function QuizScreen({
  questions,
  subject,
  onFinish,
}: {
  questions: Question[];
  subject: typeof SUBJECTS[number];
  onFinish: (results: QuizResult[]) => void;
}) {
  const QUESTION_TIME = 30;
  const [qIdx, setQIdx]         = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [results, setResults]   = useState<QuizResult[]>([]);
  // For QCM/VraiFaux we track raw answer; for Assoc/Ident we compute directly
  const [rawAnswer, setRawAnswer] = useState<number | boolean | null>(null);

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      if (isLast) {
        onFinish(results);
      } else {
        setQIdx((v) => v + 1);
        setAnswered(null);
        setRawAnswer(null);
        setFeedback("");
        setTimeLeft(QUESTION_TIME);
      }
    }, 1800);
  }, [isLast, onFinish, results]);

  const recordAnswer = useCallback((correct: boolean, tl: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswered(correct);
    const msg = correct ? rand(CORRECT_MSGS) : rand(WRONG_MSGS);
    setFeedback(msg);
    setResults((prev) => [...prev, { question: q, correct, timeLeft: tl }]);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      if (qIdx === questions.length - 1) {
        onFinish([...results, { question: q, correct, timeLeft: tl }]);
      } else {
        setQIdx((v) => v + 1);
        setAnswered(null);
        setRawAnswer(null);
        setFeedback("");
        setTimeLeft(QUESTION_TIME);
      }
    }, 2000);
  }, [q, qIdx, questions.length, onFinish, results]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
  }, [qIdx]);

  useEffect(() => {
    if (answered !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          recordAnswer(false, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [qIdx, answered, recordAnswer]);

  const handleQCM = (i: number) => {
    setRawAnswer(i);
    const correct = (q as QCMQuestion).answer === i;
    recordAnswer(correct, timeLeft);
  };
  const handleVF = (v: boolean) => {
    setRawAnswer(v);
    const correct = (q as VraiFauxQuestion).answer === v;
    recordAnswer(correct, timeLeft);
  };
  const handleAssoc = () => recordAnswer(true, timeLeft);
  const handleIdent = (correct: boolean) => recordAnswer(correct, timeLeft);

  const progress = ((qIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className={`bg-gradient-to-r ${subject.color} text-white px-4 py-3`}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-white/80">
              <span>{subject.icon} {subject.label}</span>
              <span>Question {qIdx + 1}/{questions.length}</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <TimerRing current={timeLeft} total={QUESTION_TIME} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Question card */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
              {q.type === "qcm" ? "QCM" : q.type === "vrai_faux" ? "Vrai / Faux" : q.type === "association" ? "Association" : "Identification"}
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">{q.theme}</span>
          </div>
          <p className="text-gray-900 font-black text-lg leading-snug mb-6">{q.enonce}</p>

          {q.type === "qcm"         && <QCMRenderer    q={q} onAnswer={handleQCM} answered={rawAnswer as number | null} />}
          {q.type === "vrai_faux"   && <VraiFauxRenderer q={q} onAnswer={handleVF}  answered={rawAnswer as boolean | null} />}
          {q.type === "association" && <AssocRenderer   q={q} onAnswer={handleAssoc} answered={answered} />}
          {q.type === "identification" && <IdentRenderer q={q} onAnswer={handleIdent} answered={answered} />}
        </div>

        {/* Feedback + explanation */}
        {answered !== null && (
          <div className={`rounded-2xl p-5 border-2 ${answered ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}>
            <p className={`font-black text-lg mb-2 ${answered ? "text-emerald-700" : "text-red-600"}`}>{feedback}</p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">{q.explanation}</p>
            <p className="text-xs text-gray-500 mt-2 font-semibold">
              {isLast ? "Dernière question — calcul du score…" : "Question suivante dans 2 s…"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 4 : Results ───────────────────────────────────────────────────────

function ResultsScreen({
  results,
  subject,
  difficulty,
  onRestart,
  onHome,
}: {
  results: QuizResult[];
  subject: typeof SUBJECTS[number];
  difficulty: Difficulty;
  onRestart: () => void;
  onHome: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const total   = results.length;
  const pct     = Math.round((correct / total) * 100);
  const xp      = results.reduce((acc, r) => acc + (r.correct ? r.question.xp : 0), 0);

  const [displayed, setDisplayed] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [leveledUp, setLeveledUp] = useState(false);
  const [wolof, setWolof]         = useState<{ fr: string; wo: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [totalXPGain, setTotalXPGain]   = useState(xp);

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + 2, pct);
      setDisplayed(v);
      if (v >= pct) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [pct]);

  const medal = pct >= 90 ? "🥇" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "😊";
  const msg   = pct >= 90 ? "Excellent ! Tu es un champion !" : pct >= 70 ? "Très bien ! Continue comme ça !" : pct >= 50 ? "Pas mal ! Encore un effort !" : "Courage ! La prochaine fois tu feras mieux !";

  // Save to localStorage + trigger gamification
  useEffect(() => {
    try {
      const entry = { date: new Date().toISOString(), subject: subject.id, subjectLabel: subject.label, difficulty, pct, correct, total, xp };
      const prev = JSON.parse(localStorage.getItem("nekh_history") ?? "[]") as unknown[];
      localStorage.setItem("nekh_history", JSON.stringify([entry, ...prev].slice(0, 50)));
    } catch (_) { /* ignore */ }

    // Gamification engine
    const result = processQuizCompletion({
      subject: subject.id,
      pct, xpGained: xp, correct, total, difficulty,
      date: new Date().toISOString(),
    });
    setNewBadges(result.newlyUnlocked);
    setLeveledUp(result.leveledUp);
    setTotalXPGain(result.xpGained);
    setWolof(getEncouragingMessage(pct));
    // Slight delay so XP toast appears after score animation
    const t = setTimeout(() => setToastVisible(true), 1200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4">
      {/* XP / Badge toast */}
      {toastVisible && (
        <div className="fixed top-6 right-6 z-50 space-y-2 animate-in">
          {/* XP toast */}
          <div className="flex items-center gap-3 bg-amber-400 text-gray-900 font-black text-sm px-4 py-3 rounded-2xl shadow-xl">
            <span className="text-xl">⚡</span>
            <div>
              <p>+{totalXPGain} XP gagnés !</p>
              {leveledUp && <p className="text-xs font-bold text-gray-700">🎉 Niveau supérieur !</p>}
            </div>
          </div>
          {/* New badges */}
          {newBadges.map((b) => (
            <div key={b.id} className="flex items-center gap-3 bg-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-xl">
              <span className="text-xl">{b.icon}</span>
              <div>
                <p>Badge débloqué : {b.name}</p>
                <p className="text-indigo-200 text-xs">{b.nameWo} · +{b.xpReward} XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-7xl mb-3 animate-bounce">{medal}</div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">{msg}</h2>
        {/* Wolof message */}
        {wolof && (
          <p className="text-indigo-600 font-bold text-sm italic mb-1">{wolof.wo}</p>
        )}
        <p className="text-gray-500 text-sm mb-6">{subject.label} · {difficulty}</p>

        {/* Score circle */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="absolute inset-0 -rotate-90" width="144" height="144">
            <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="72" cy="72" r="60" fill="none"
              stroke={pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="10"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - displayed / 100)}
              style={{ transition: "stroke-dashoffset 0.05s linear" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gray-900">{displayed}</span>
            <span className="text-gray-400 text-sm font-semibold">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[["✅", `${correct}/${total}`, "Bonnes rép."], ["⚡", `+${totalXPGain}`, "XP gagnés"], ["⏱", `${results.filter(r => r.timeLeft > 20).length}`, "Rapides"]].map(([icon, val, lbl]) => (
            <div key={lbl} className="bg-gray-50 rounded-2xl p-2 sm:p-3">
              <p className="text-lg sm:text-xl">{icon}</p>
              <p className="font-black text-gray-900 text-base sm:text-lg">{val}</p>
              <p className="text-gray-500 text-xs leading-tight">{lbl}</p>
            </div>
          ))}
        </div>

        {/* Per-question breakdown */}
        <div className="text-left mb-6">
          <p className="text-sm font-bold text-gray-600 mb-2">Détail des réponses</p>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${r.correct ? "bg-emerald-50" : "bg-red-50"}`}>
                <span className="text-base flex-shrink-0">{r.correct ? "✅" : "❌"}</span>
                <div>
                  <p className={`font-semibold ${r.correct ? "text-emerald-800" : "text-red-800"}`}>{r.question.enonce.slice(0, 60)}{r.question.enonce.length > 60 ? "…" : ""}</p>
                  {!r.correct && <p className="text-gray-500 mt-0.5">{r.question.explanation.slice(0, 80)}…</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onRestart} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-colors text-sm">
            🔄 Rejouer
          </button>
          <button onClick={onHome} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-colors text-sm">
            🏠 Accueil
          </button>
        </div>
        <div className="flex gap-4 justify-center mt-3">
          <Link href="/quiz/history" className="text-indigo-600 hover:underline text-sm font-semibold">
            📊 Historique →
          </Link>
          <Link href="/dashboard/student/rewards" className="text-amber-600 hover:underline text-sm font-semibold">
            ⭐ Mes récompenses →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

type Screen = "subject" | "config" | "quiz" | "results";

export default function QuizPage() {
  const [screen, setScreen]         = useState<Screen>("subject");
  const [subjectId, setSubjectId]   = useState<SubjectId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("moyen");
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [results, setResults]       = useState<QuizResult[]>([]);

  const subject = SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0];

  const handleSelectSubject = (id: SubjectId) => {
    setSubjectId(id);
    setScreen("config");
  };

  const handleStart = (diff: Difficulty, count: number) => {
    const pool = QUESTIONS.filter((q) => q.subject === subjectId && q.difficulty === diff);
    const picked = shuffle(pool).slice(0, count);
    setDifficulty(diff);
    setQuestions(picked);
    setScreen("quiz");
  };

  const handleFinish = (res: QuizResult[]) => {
    setResults(res);
    setScreen("results");
  };

  const handleRestart = () => {
    setScreen("config");
  };

  if (screen === "subject") return <SubjectScreen onSelect={handleSelectSubject} />;
  if (screen === "config")  return <ConfigScreen  subjectId={subjectId!} onStart={handleStart} onBack={() => setScreen("subject")} />;
  if (screen === "quiz")    return <QuizScreen     questions={questions} subject={subject} onFinish={handleFinish} />;
  return <ResultsScreen results={results} subject={subject} difficulty={difficulty} onRestart={handleRestart} onHome={() => setScreen("subject")} />;
}
