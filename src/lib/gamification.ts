// Gamification engine — XP, badges, streak, leaderboard, messages bilingues

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  icon: string;
  name: string;
  nameWo: string;          // name in Wolof
  description: string;
  descWo: string;
  category: "subject" | "streak" | "score" | "milestone";
  subject?: string;        // if subject-specific
  xpReward: number;
  check: (state: GamificationState, event?: XPEvent) => boolean;
}

export interface XPEvent {
  subject: string;
  pct: number;        // 0-100 score percentage
  xpGained: number;
  correct: number;
  total: number;
  difficulty: "facile" | "moyen" | "difficile";
  date: string;       // ISO
}

export interface WeeklyEntry {
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  unlockedBadges: string[];        // badge ids
  subjectXP: Record<string, number>;
  subjectQuizzes: Record<string, number>;
  subjectPerfect: Record<string, number>; // 100% quizzes per subject
  totalQuizzes: number;
  totalPerfect: number;
  weeklyXP: { date: string; xp: number }[]; // rolling 7 days
}

export interface NewBadge {
  badge: Badge;
  isNew: boolean;
}

// ── XP & Level ────────────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 500, 1200, 2200, 3500, 5200, 7500, 10500, 14000, 18500, 24000];

export function computeLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(xp: number): { current: number; next: number; pct: number } {
  const lvl = computeLevel(xp);
  const current = LEVEL_THRESHOLDS[lvl - 1] ?? 0;
  const next    = LEVEL_THRESHOLDS[lvl] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
  return { current, next, pct: Math.round(((xp - current) / (next - current)) * 100) };
}

// ── Badge definitions ─────────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  // ── Milestones
  {
    id: "first_quiz", icon: "🚀", name: "Lancé !", nameWo: "Dém na !",
    description: "Complète ton premier quiz", descWo: "Def sa bopp quiz bu njëkk",
    category: "milestone", xpReward: 50,
    check: (s) => s.totalQuizzes >= 1,
  },
  {
    id: "quiz_10", icon: "📚", name: "Assidu", nameWo: "Jëfandikoo",
    description: "10 quiz complétés", descWo: "10 quiz dafa dem",
    category: "milestone", xpReward: 100,
    check: (s) => s.totalQuizzes >= 10,
  },
  {
    id: "quiz_50", icon: "🏆", name: "Champion", nameWo: "Gagnaak",
    description: "50 quiz complétés", descWo: "50 quiz dafa dem",
    category: "milestone", xpReward: 300,
    check: (s) => s.totalQuizzes >= 50,
  },
  {
    id: "level_5", icon: "⭐", name: "Étoile montante", nameWo: "Jant bu dëkk",
    description: "Atteins le niveau 5", descWo: "Jot niveau 5",
    category: "milestone", xpReward: 200,
    check: (s) => s.level >= 5,
  },
  {
    id: "level_10", icon: "👑", name: "Génie en herbe", nameWo: "Géniy ci dëkk bi",
    description: "Atteins le niveau 10", descWo: "Jot niveau 10",
    category: "milestone", xpReward: 500,
    check: (s) => s.level >= 10,
  },
  {
    id: "xp_1000", icon: "💎", name: "1 000 XP", nameWo: "1000 XP !",
    description: "Accumule 1 000 XP", descWo: "Rassemble 1000 XP",
    category: "milestone", xpReward: 150,
    check: (s) => s.xp >= 1000,
  },
  {
    id: "xp_5000", icon: "💫", name: "5 000 XP", nameWo: "5000 XP !",
    description: "Accumule 5 000 XP", descWo: "Rassemble 5000 XP",
    category: "milestone", xpReward: 400,
    check: (s) => s.xp >= 5000,
  },

  // ── Streak
  {
    id: "streak_3", icon: "🔥", name: "En feu !", nameWo: "Dafa tang !",
    description: "3 jours de suite actif", descWo: "3 bés yépp",
    category: "streak", xpReward: 75,
    check: (s) => s.streak >= 3,
  },
  {
    id: "streak_7", icon: "🌟", name: "Semaine parfaite", nameWo: "Ayubés bu baax",
    description: "7 jours de suite actif", descWo: "7 bés yépp",
    category: "streak", xpReward: 150,
    check: (s) => s.streak >= 7,
  },
  {
    id: "streak_14", icon: "⚡", name: "Incroyable !", nameWo: "Dafa xuman !",
    description: "14 jours de suite actif", descWo: "14 bés yépp",
    category: "streak", xpReward: 300,
    check: (s) => s.streak >= 14,
  },
  {
    id: "streak_30", icon: "🦁", name: "Roi de la discipline", nameWo: "Buur bu disipliin",
    description: "30 jours de suite actif", descWo: "30 bés yépp",
    category: "streak", xpReward: 750,
    check: (s) => s.streak >= 30,
  },

  // ── Score / Performance
  {
    id: "first_perfect", icon: "🎯", name: "Parfait !", nameWo: "Bu baax lool !",
    description: "Score de 100% à un quiz", descWo: "100% ci quiz",
    category: "score", xpReward: 100,
    check: (s) => s.totalPerfect >= 1,
  },
  {
    id: "perfect_5", icon: "🌈", name: "Imbattable", nameWo: "Dégué du tax na",
    description: "5 scores parfaits", descWo: "5 quiz bu 100%",
    category: "score", xpReward: 250,
    check: (s) => s.totalPerfect >= 5,
  },
  {
    id: "hard_first", icon: "💪", name: "Courageux", nameWo: "Dafa dëkk",
    description: "Complète un quiz difficile", descWo: "Def quiz bu doy",
    category: "score", xpReward: 120,
    check: (_, ev) => ev?.difficulty === "difficile",
  },

  // ── Par matière (5 matières × 2 badges chacune)
  {
    id: "maths_first", icon: "🔢", name: "Mathématicien", nameWo: "Gannaaw jëf",
    description: "Premier quiz de Maths", descWo: "Quiz bu njëkk ci Maths",
    category: "subject", subject: "maths", xpReward: 60,
    check: (s) => (s.subjectQuizzes["maths"] ?? 0) >= 1,
  },
  {
    id: "maths_master", icon: "🧮", name: "Maître des maths", nameWo: "Mees bu Maths",
    description: "5 quiz de Maths complétés", descWo: "5 quiz ci Maths",
    category: "subject", subject: "maths", xpReward: 150,
    check: (s) => (s.subjectQuizzes["maths"] ?? 0) >= 5,
  },
  {
    id: "francais_first", icon: "📖", name: "Lecteur", nameWo: "Jàngi",
    description: "Premier quiz de Français", descWo: "Quiz bu njëkk ci Français",
    category: "subject", subject: "francais", xpReward: 60,
    check: (s) => (s.subjectQuizzes["francais"] ?? 0) >= 1,
  },
  {
    id: "francais_master", icon: "✍️", name: "Plume d'or", nameWo: "Pum bu wor",
    description: "5 quiz de Français complétés", descWo: "5 quiz ci Français",
    category: "subject", subject: "francais", xpReward: 150,
    check: (s) => (s.subjectQuizzes["francais"] ?? 0) >= 5,
  },
  {
    id: "histoire_first", icon: "🏛️", name: "Historien", nameWo: "Jëfandikoo Taarix",
    description: "Premier quiz d'Histoire", descWo: "Quiz bu njëkk ci Taarix",
    category: "subject", subject: "histoire", xpReward: 60,
    check: (s) => (s.subjectQuizzes["histoire"] ?? 0) >= 1,
  },
  {
    id: "histoire_master", icon: "⚔️", name: "Gardien de mémoire", nameWo: "Dëkk sunu taarix",
    description: "5 quiz d'Histoire complétés", descWo: "5 quiz ci Taarix",
    category: "subject", subject: "histoire", xpReward: 150,
    check: (s) => (s.subjectQuizzes["histoire"] ?? 0) >= 5,
  },
  {
    id: "geo_first", icon: "🌍", name: "Explorateur", nameWo: "Jënd-jënde",
    description: "Premier quiz de Géographie", descWo: "Quiz bu njëkk ci Géo",
    category: "subject", subject: "geo", xpReward: 60,
    check: (s) => (s.subjectQuizzes["geo"] ?? 0) >= 1,
  },
  {
    id: "geo_master", icon: "🗺️", name: "Cartographe", nameWo: "Cartograf",
    description: "5 quiz de Géographie complétés", descWo: "5 quiz ci Géo",
    category: "subject", subject: "geo", xpReward: 150,
    check: (s) => (s.subjectQuizzes["geo"] ?? 0) >= 5,
  },
  {
    id: "sciences_first", icon: "🔬", name: "Scientifique", nameWo: "Xam-xam bu sayans",
    description: "Premier quiz de Sciences", descWo: "Quiz bu njëkk ci Sciences",
    category: "subject", subject: "sciences", xpReward: 60,
    check: (s) => (s.subjectQuizzes["sciences"] ?? 0) >= 1,
  },
  {
    id: "sciences_master", icon: "🧪", name: "Chercheur", nameWo: "Reew mi",
    description: "5 quiz de Sciences complétés", descWo: "5 quiz ci Sciences",
    category: "subject", subject: "sciences", xpReward: 150,
    check: (s) => (s.subjectQuizzes["sciences"] ?? 0) >= 5,
  },
];

// ── Encouraging messages ──────────────────────────────────────────────────────

type ScoreTier = "perfect" | "great" | "good" | "keep_going";

const MESSAGES: Record<ScoreTier, { fr: string; wo: string }[]> = {
  perfect: [
    { fr: "Parfait ! Tu es imbattable !", wo: "Bu baax lool ! Dégué du tax na !" },
    { fr: "Score parfait ! Génie en herbe !", wo: "100% ! Yow mooy géniiy !" },
    { fr: "Incroyable ! Continue comme ça !", wo: "Dafa xuman ! Jëf ak jàmm !" },
  ],
  great: [
    { fr: "Excellent ! Tu progresses vite !", wo: "Bu baax na ! Maa ngi dem !" },
    { fr: "Bravo ! Tu maîtrises bien le sujet !", wo: "Waaw waaw ! Dëgël !" },
    { fr: "Très bien ! Encore un effort !", wo: "Bu baax na lool ! Ligéeyal !" },
  ],
  good: [
    { fr: "Pas mal ! Continue tes efforts !", wo: "Dafa baax ! Bul doy !" },
    { fr: "Bien joué ! Petit à petit tu grandis !", wo: "Ndank ndank, yëgël na !" },
    { fr: "Courage ! Tu vas y arriver !", wo: "Yëgël ! Maa ngi dem !" },
  ],
  keep_going: [
    { fr: "Courage ! La prochaine fois sera meilleure !", wo: "Bul doy ! Tekki na !" },
    { fr: "Continue ! Le savoir vient avec la pratique !", wo: "Jëfandikoo ! Xam-xam bi dafa baax !" },
    { fr: "N'abandonne pas ! Chaque erreur est une leçon !", wo: "Bul doy ! Ndank ndank mooy jàpp golo !" },
  ],
};

export function getEncouragingMessage(pct: number): { fr: string; wo: string } {
  const tier: ScoreTier = pct === 100 ? "perfect" : pct >= 75 ? "great" : pct >= 50 ? "good" : "keep_going";
  const pool = MESSAGES[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Streak messages ───────────────────────────────────────────────────────────

export function getStreakMessage(streak: number): { fr: string; wo: string } {
  if (streak >= 30) return { fr: `${streak} jours d'affilée ! Légende !`, wo: `${streak} bés ! Léjand la !` };
  if (streak >= 14) return { fr: `${streak} jours de suite ! Incroyable !`, wo: `${streak} bés ! Dafa xuman !` };
  if (streak >= 7)  return { fr: `${streak} jours ! Semaine parfaite !`, wo: `${streak} bés ! Ayubés bu baax !` };
  if (streak >= 3)  return { fr: `${streak} jours de suite ! Continue !`, wo: `${streak} bés ! Jëf ak jàmm !` };
  if (streak >= 1)  return { fr: "C'est parti ! Reviens demain !", wo: "Dém na ! Koy yiw bés bu ëpp !" };
  return { fr: "Commence ta série aujourd'hui !", wo: "Tàmbalee jëm ci kanam !" };
}

// ── localStorage persistence ──────────────────────────────────────────────────

const STORAGE_KEY = "nekh_gamification";

function defaultState(): GamificationState {
  return {
    xp: 0, level: 1, streak: 0, longestStreak: 0,
    lastActivityDate: null,
    unlockedBadges: [],
    subjectXP: {}, subjectQuizzes: {}, subjectPerfect: {},
    totalQuizzes: 0, totalPerfect: 0,
    weeklyXP: [],
  };
}

export function loadState(): GamificationState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) } as GamificationState;
  } catch {
    return defaultState();
  }
}

function saveState(state: GamificationState): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ── Streak calculation ────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(state: GamificationState): GamificationState {
  const td = today();
  if (state.lastActivityDate === td) return state; // already logged today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yd = yesterday.toISOString().slice(0, 10);

  const newStreak = state.lastActivityDate === yd ? state.streak + 1 : 1;
  return {
    ...state,
    streak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActivityDate: td,
  };
}

// ── Weekly XP tracking ────────────────────────────────────────────────────────

function addWeeklyXP(state: GamificationState, xp: number): GamificationState {
  const td = today();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const filtered = (state.weeklyXP ?? []).filter((e) => e.date >= cutoffStr);
  const existing = filtered.find((e) => e.date === td);
  if (existing) {
    return { ...state, weeklyXP: filtered.map((e) => e.date === td ? { ...e, xp: e.xp + xp } : e) };
  }
  return { ...state, weeklyXP: [...filtered, { date: td, xp }] };
}

// ── Main: process a quiz completion ──────────────────────────────────────────

export interface ProcessResult {
  newState: GamificationState;
  xpGained: number;
  newlyUnlocked: Badge[];
  leveledUp: boolean;
  oldLevel: number;
}

export function processQuizCompletion(event: XPEvent): ProcessResult {
  let state = loadState();
  const oldLevel = state.level;

  // Update streak
  state = updateStreak(state);

  // Update quiz counters
  const subj = event.subject;
  state = {
    ...state,
    totalQuizzes: state.totalQuizzes + 1,
    totalPerfect: event.pct === 100 ? state.totalPerfect + 1 : state.totalPerfect,
    subjectQuizzes: { ...state.subjectQuizzes, [subj]: (state.subjectQuizzes[subj] ?? 0) + 1 },
    subjectPerfect: { ...state.subjectPerfect, [subj]: event.pct === 100 ? (state.subjectPerfect[subj] ?? 0) + 1 : (state.subjectPerfect[subj] ?? 0) },
    subjectXP: { ...state.subjectXP, [subj]: (state.subjectXP[subj] ?? 0) + event.xpGained },
  };

  // Add XP
  let totalXPGain = event.xpGained;
  state = { ...state, xp: state.xp + totalXPGain };

  // Check badges
  const newlyUnlocked: Badge[] = [];
  for (const badge of BADGES) {
    if (state.unlockedBadges.includes(badge.id)) continue;
    if (badge.check(state, event)) {
      state = {
        ...state,
        unlockedBadges: [...state.unlockedBadges, badge.id],
        xp: state.xp + badge.xpReward,
      };
      totalXPGain += badge.xpReward;
      newlyUnlocked.push(badge);
    }
  }

  // Track weekly XP
  state = addWeeklyXP(state, totalXPGain);

  // Recompute level
  state = { ...state, level: computeLevel(state.xp) };

  saveState(state);

  return {
    newState: state,
    xpGained: totalXPGain,
    newlyUnlocked,
    leveledUp: state.level > oldLevel,
    oldLevel,
  };
}

// ── Mock weekly leaderboard (replaced by Supabase in prod) ───────────────────

export function buildLeaderboard(currentUserXP: number, currentUserName: string): WeeklyEntry[] {
  const mock: WeeklyEntry[] = [
    { name: "Aminata Sarr",    xp: 1240, avatar: "👧" },
    { name: "Ibrahima Diop",   xp: 980,  avatar: "👦" },
    { name: "Khady Fall",      xp: 870,  avatar: "👧" },
    { name: "Mamadou Konaté",  xp: 760,  avatar: "👦" },
    { name: "Rokhaya Seck",    xp: 620,  avatar: "👧" },
    { name: "Ousmane Gaye",    xp: 510,  avatar: "👦" },
    { name: "Ndéye Mbaye",     xp: 430,  avatar: "👧" },
    { name: "Cheikh Diallo",   xp: 380,  avatar: "👦" },
    { name: "Fatou Ndiaye",    xp: 290,  avatar: "👧" },
  ];

  // Insert current user at the right position
  const entries = [...mock, { name: currentUserName, xp: currentUserXP, avatar: "⭐", isCurrentUser: true }];
  return entries.sort((a, b) => b.xp - a.xp).slice(0, 10);
}
