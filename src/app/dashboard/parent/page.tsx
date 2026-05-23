"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

// ── Données ──────────────────────────────────────────────────
const PARENT = { firstName: "Mariama", lastName: "Diallo" };

const CHILD = {
  firstName: "Fatou", lastName: "Diallo",
  class: "CM2 – B", school: "École El Hadj Malick Sy",
  level: 7, xp: 3240, xpNext: 4000, streak: 12,
  avgScore: 87, totalQuizzes: 84, teacher: "M. Ousmane Ndiaye",
};

const SUBJECTS = [
  { name: "Histoire",       icon: "🏛️", score: 92, quizzes: 18, gradient: "from-amber-400 to-orange-500",   bar: "bg-amber-500"   },
  { name: "Instr. civique", icon: "⚖️", score: 88, quizzes: 14, gradient: "from-violet-500 to-purple-600",  bar: "bg-violet-500"  },
  { name: "Orthographe",    icon: "✏️", score: 85, quizzes: 16, gradient: "from-sky-400 to-blue-500",       bar: "bg-sky-500"     },
  { name: "Sciences",       icon: "🔬", score: 72, quizzes: 12, gradient: "from-red-400 to-rose-500",       bar: "bg-red-500"     },
  { name: "Géographie",     icon: "🌍", score: 65, quizzes: 15, gradient: "from-emerald-400 to-green-500",  bar: "bg-emerald-500" },
  { name: "Calcul mental",  icon: "🔢", score: 55, quizzes: 9,  gradient: "from-pink-400 to-rose-500",      bar: "bg-pink-500"    },
] as const;

const PROGRESS_WEEKS = [
  { label: "25 Mar", score: 64 }, { label: "1 Avr",  score: 69 },
  { label: "8 Avr",  score: 67 }, { label: "15 Avr", score: 74 },
  { label: "22 Avr", score: 79 }, { label: "1 Mai",  score: 82 },
  { label: "8 Mai",  score: 85 }, { label: "15 Mai", score: 87 },
];

const QUIZ_HISTORY = [
  { quiz: "Accord de l'adjectif",            subject: "Orthographe",    score: 92, date: "23 Mai 2026", duration: "12 min", questions: 10 },
  { quiz: "La colonisation de l'Afrique",    subject: "Histoire",       score: 78, date: "21 Mai 2026", duration: "15 min", questions: 12 },
  { quiz: "Droits et devoirs du citoyen",    subject: "Instr. civique", score: 100, date: "20 Mai 2026", duration: "10 min", questions: 8 },
  { quiz: "Les fleuves du Sénégal",          subject: "Géographie",     score: 65, date: "17 Mai 2026", duration: "18 min", questions: 15 },
  { quiz: "Le système solaire",              subject: "Sciences",       score: 72, date: "14 Mai 2026", duration: "14 min", questions: 10 },
  { quiz: "Les tables de multiplication",    subject: "Calcul mental",  score: 55, date: "10 Mai 2026", duration: "8 min",  questions: 20 },
  { quiz: "Empires africains précoloniaux",  subject: "Histoire",       score: 88, date: "6 Mai 2026",  duration: "16 min", questions: 10 },
  { quiz: "Conjugaison – Temps du passé",    subject: "Orthographe",    score: 79, date: "2 Mai 2026",  duration: "12 min", questions: 12 },
  { quiz: "La Constitution sénégalaise",     subject: "Instr. civique", score: 95, date: "28 Avr 2026", duration: "10 min", questions: 8  },
  { quiz: "Les volcans",                     subject: "Sciences",       score: 68, date: "24 Avr 2026", duration: "14 min", questions: 10 },
  { quiz: "Régions du Sénégal",             subject: "Géographie",     score: 62, date: "20 Avr 2026", duration: "15 min", questions: 12 },
  { quiz: "Fractions et décimaux",           subject: "Calcul mental",  score: 58, date: "16 Avr 2026", duration: "10 min", questions: 15 },
];

const ACTIVITY = [
  { icon: "✅", text: "Quiz complété",  detail: "Accord de l'adjectif",        score: 92,  time: "Il y a 30 min" },
  { icon: "📚", text: "Cours démarré",  detail: "Sciences – Les volcans",       score: null, time: "Il y a 2h"   },
  { icon: "🏅", text: "Badge obtenu",   detail: "Série de 12 jours d'affilée",  score: null, time: "Hier"        },
  { icon: "🎯", text: "Score parfait",  detail: "Quiz Instruction civique",     score: 100, time: "Hier"         },
  { icon: "📝", text: "Quiz terminé",   detail: "La colonisation de l'Afrique", score: 78,  time: "Il y a 2j"   },
];

const EVENTS = [
  { name: "Génie en Herbe – Sélection école", date: "28 Mai 2026",  icon: "🏆" },
  { name: "Réunion parents-professeurs",       date: "15 Juin 2026", icon: "👨‍👩‍👧" },
  { name: "Remise des carnets scolaires",      date: "1 Juil. 2026", icon: "📋" },
];

const MESSAGES = [
  { from: "M. Ousmane Ndiaye", subject: "Progrès de Fatou en Histoire", preview: "Fatou fait de très bons progrès ce trimestre, notamment en...", time: "Hier", unread: true },
  { from: "Administration",    subject: "Réunion parents-professeurs",   preview: "Nous vous invitons à la réunion du 15 juin à 18h...", time: "Il y a 3j", unread: false },
];

const STREAK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const STREAK_ACTIVE = [true, true, true, true, true, true, false];

// ── Graphique SVG de progression ─────────────────────────────
function ProgressChart() {
  const W = 540, H = 200;
  const pad = { t: 32, r: 24, b: 44, l: 44 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const scores = PROGRESS_WEEKS.map((d) => d.score);
  const minS = Math.max(0, Math.min(...scores) - 8);
  const maxS = Math.min(100, Math.max(...scores) + 8);
  const xOf = (i: number) => pad.l + (i / (PROGRESS_WEEKS.length - 1)) * cW;
  const yOf = (v: number) => pad.t + cH - ((v - minS) / (maxS - minS)) * cH;
  const lineD = PROGRESS_WEEKS.map((d, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(d.score).toFixed(1)}`).join(" ");
  const fillD = `${lineD} L ${xOf(PROGRESS_WEEKS.length - 1).toFixed(1)} ${(pad.t + cH).toFixed(1)} L ${pad.l} ${(pad.t + cH).toFixed(1)} Z`;
  const gridVals = [60, 70, 80, 90].filter((v) => v >= minS && v <= maxS);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="pgFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={pad.l} y1={yOf(v)} x2={W - pad.r} y2={yOf(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={pad.l - 8} y={yOf(v) + 4} textAnchor="end" fontSize="11" fill="#d1d5db">{v}</text>
        </g>
      ))}
      {/* Area */}
      <path d={fillD} fill="url(#pgFill)" />
      {/* Line */}
      <path d={lineD} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points + labels */}
      {PROGRESS_WEEKS.map((d, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(d.score)} r="5" fill="white" stroke="#f97316" strokeWidth="2.5" />
          <text x={xOf(i)} y={yOf(d.score) - 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ea580c">{d.score}</text>
          <text x={xOf(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────
function scoreMeta(v: number) {
  if (v >= 85) return { label: "Excellent 🌟", color: "text-emerald-700", bg: "bg-emerald-100", bar: "bg-emerald-500" };
  if (v >= 75) return { label: "Bien 👍",      color: "text-indigo-700",  bg: "bg-indigo-100",  bar: "bg-indigo-500"  };
  if (v >= 60) return { label: "Moyen 📈",     color: "text-amber-700",   bg: "bg-amber-100",   bar: "bg-amber-500"   };
  return              { label: "À revoir 💪",  color: "text-red-700",     bg: "bg-red-100",     bar: "bg-red-500"     };
}

type Tab = "resume" | "matieres" | "progression" | "historique";

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("resume");
  const [histSubject, setHistSubject] = useState("Toutes");
  const xpPct = Math.round((CHILD.xp / CHILD.xpNext) * 100);

  const strengths  = SUBJECTS.filter((s) => s.score >= 80);
  const toImprove  = SUBJECTS.filter((s) => s.score < 65);
  const average    = SUBJECTS.filter((s) => s.score >= 65 && s.score < 80);

  const histFiltered = histSubject === "Toutes"
    ? QUIZ_HISTORY
    : QUIZ_HISTORY.filter((q) => q.subject === histSubject);

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: "resume",      icon: "🏠", label: "Résumé"     },
    { key: "matieres",    icon: "📚", label: "Par matière" },
    { key: "progression", icon: "📈", label: "Progression" },
    { key: "historique",  icon: "📝", label: "Historique"  },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-amber-600 to-orange-700 flex flex-col fixed h-full z-20 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-amber-200 text-xs mt-0.5">Espace parent</p>
        </div>

        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black text-white">
              {PARENT.firstName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{PARENT.firstName} {PARENT.lastName}</p>
              <p className="text-xs text-amber-200">Parent de {CHILD.firstName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {[
            { href: "/dashboard/parent", label: "Tableau de bord", icon: "🏠", active: true  },
            { href: "/messages",         label: "Messages",        icon: "💬", active: false },
            { href: "/settings",         label: "Paramètres",      icon: "⚙️", active: false },
          ].map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-white/20 text-white" : "text-amber-200 hover:bg-white/10 hover:text-white"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-64 flex-1 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black text-amber-600">NEKH XËL</span>
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">{PARENT.firstName[0]}</div>
        </div>

        <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-auto">
          {/* ── Carte enfant ─────────────────────────────── */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            </div>
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black shadow-lg flex-shrink-0 border-2 border-white/30">
                  {CHILD.firstName[0]}
                </div>
                <div>
                  <p className="text-amber-100 text-sm font-medium">Votre enfant 👧</p>
                  <h1 className="text-3xl font-black">{CHILD.firstName} {CHILD.lastName}</h1>
                  <p className="text-amber-100 text-sm">{CHILD.class} · {CHILD.school}</p>
                  <p className="text-amber-200 text-xs mt-1">Enseignant : {CHILD.teacher}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-bold">🔥 {CHILD.streak} jours de suite</span>
                    <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-xs font-bold">⭐ Niveau {CHILD.level}</span>
                  </div>
                </div>
              </div>
              <div className="lg:ml-auto grid grid-cols-3 gap-3">
                {[
                  { val: `${CHILD.avgScore}%`, label: "Moyenne",   icon: "🎯" },
                  { val: CHILD.totalQuizzes,   label: "Quiz faits", icon: "📝" },
                  { val: `${CHILD.xp} XP`,    label: "Points",     icon: "⭐" },
                ].map(({ val, label, icon }) => (
                  <div key={label} className="bg-white/15 border border-white/20 rounded-2xl px-4 py-4 text-center backdrop-blur-sm">
                    <span className="text-2xl">{icon}</span>
                    <p className="text-xl font-black mt-1">{val}</p>
                    <p className="text-xs text-amber-100 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Barre XP */}
            <div className="relative mt-5">
              <div className="flex justify-between text-xs text-amber-100 mb-1.5">
                <span>Niveau {CHILD.level}</span>
                <span>{CHILD.xp} / {CHILD.xpNext} points</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
              </div>
              <p className="text-xs text-amber-200 mt-1.5">Plus que {CHILD.xpNext - CHILD.xp} points pour passer au niveau {CHILD.level + 1} !</p>
            </div>
          </div>

          {/* ── Navigation par onglets ────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="grid grid-cols-4 border-b border-gray-100">
              {TABS.map(({ key, icon, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3.5 px-2 text-xs sm:text-sm font-bold transition-colors ${tab === key ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <span className="text-lg sm:text-base">{icon}</span>
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>

            {/* ── Onglet Résumé ─────────────────────────── */}
            {tab === "resume" && (
              <div className="p-5 lg:p-6 space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: "🎯", label: "Score moyen",      value: `${CHILD.avgScore}%`,         sub: "sur tous les quiz",    bg: "bg-emerald-50",  val: CHILD.avgScore, text: "text-emerald-700" },
                    { icon: "🔥", label: "Jours de suite",   value: `${CHILD.streak} jours`,       sub: "sans interruption",    bg: "bg-orange-50",   val: 0,              text: "text-orange-700" },
                    { icon: "📝", label: "Quiz cette semaine", value: "5 quiz",                   sub: "les 7 derniers jours", bg: "bg-indigo-50",   val: 0,              text: "text-indigo-700" },
                    { icon: "🏆", label: "Compétition",       value: "28 Mai",                    sub: "Génie en Herbe",        bg: "bg-violet-50",   val: 0,              text: "text-violet-700" },
                  ].map(({ icon, label, value, sub, bg, text }) => (
                    <div key={label} className={`${bg} rounded-2xl p-4 border border-white`}>
                      <span className="text-3xl">{icon}</span>
                      <p className={`text-2xl font-black mt-2 ${text}`}>{value}</p>
                      <p className="text-sm font-bold text-gray-700 mt-0.5">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  {/* Activité récente */}
                  <div className="lg:col-span-3">
                    <h2 className="text-base font-black text-gray-900 mb-4">🕐 Ce que fait {CHILD.firstName} en ce moment</h2>
                    <div className="space-y-3">
                      {ACTIVITY.map(({ icon, text, detail, score, time }, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800">{text}</p>
                            <p className="text-xs text-gray-500 truncate">{detail}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                          </div>
                          {score !== null && (
                            <div className={`text-sm font-black px-2.5 py-1 rounded-xl flex-shrink-0 ${score >= 85 ? "bg-emerald-100 text-emerald-700" : score >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                              {score}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colonne droite résumé */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Streak calendar */}
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-gray-900">🔥 Assiduité cette semaine</h3>
                        <span className="text-xl font-black text-orange-600">{CHILD.streak}j</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {STREAK_DAYS.map((d, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-400 font-medium">{d}</span>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${STREAK_ACTIVE[i] ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm" : "bg-white text-gray-300 border border-gray-200"}`}>
                              {STREAK_ACTIVE[i] ? "🔥" : "·"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-3 font-semibold">
                        {CHILD.firstName} est très assidU(e) ! Félicitez-la 👏
                      </p>
                    </div>

                    {/* Messages */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-gray-900">💬 Messages de l'école</h3>
                        <Link href="/messages" className="text-xs text-amber-600 font-semibold hover:underline">Voir tout</Link>
                      </div>
                      <div className="space-y-2.5">
                        {MESSAGES.map((m, i) => (
                          <div key={i} className={`p-3 rounded-xl border ${m.unread ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-bold leading-tight ${m.unread ? "text-gray-900" : "text-gray-600"}`}>{m.subject}</p>
                              {m.unread && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-0.5" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">De : {m.from}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{m.preview}</p>
                          </div>
                        ))}
                      </div>
                      <Link href="/messages" className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-amber-200 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-50 transition-colors">
                        ✉️ Écrire à l&apos;enseignant
                      </Link>
                    </div>

                    {/* À venir */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
                      <h3 className="text-sm font-black text-gray-900 mb-3">📅 Prochains événements</h3>
                      <div className="space-y-3">
                        {EVENTS.map((e) => (
                          <div key={e.name} className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{e.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-gray-800">{e.name}</p>
                              <p className="text-xs text-amber-600 font-semibold mt-0.5">📅 {e.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Onglet Par matière ─────────────────────── */}
            {tab === "matieres" && (
              <div className="p-5 lg:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Résultats par matière</h2>
                  <p className="text-sm text-gray-500">Plus le score est élevé, mieux c&apos;est. 🟢 ≥ 80 · 🟡 65–79 · 🔴 &lt; 65</p>
                </div>

                {/* Subject grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SUBJECTS.map((s) => {
                    const meta = scoreMeta(s.score);
                    return (
                      <div key={s.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className={`bg-gradient-to-br ${s.gradient} p-5 flex items-center justify-between`}>
                          <span className="text-4xl">{s.icon}</span>
                          <div className="text-right">
                            <p className="text-3xl font-black text-white">{s.score}%</p>
                            <p className="text-white/80 text-xs font-medium">{s.quizzes} quiz</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-gray-900">{s.name}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${meta.bg} ${meta.color}`}>{meta.label}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className={`h-3 rounded-full transition-all ${s.bar}`} style={{ width: `${s.score}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {s.score >= 80 ? `🎉 ${CHILD.firstName} excelle dans cette matière !`
                              : s.score >= 65 ? `👍 De bons résultats, continuez comme ça !`
                              : `💪 Cette matière mérite plus de pratique.`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Points forts & difficultés */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Points forts */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
                    <h3 className="text-base font-black text-emerald-800 mb-1">🌟 Points forts</h3>
                    <p className="text-xs text-emerald-600 mb-3">Matières où {CHILD.firstName} réussit très bien</p>
                    <div className="space-y-2.5">
                      {strengths.map((s) => (
                        <div key={s.name} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-emerald-100">
                          <span className="text-xl">{s.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{s.name}</p>
                            <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-1">
                              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${s.score}%` }} />
                            </div>
                          </div>
                          <span className="text-base font-black text-emerald-700">{s.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moyenne */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                    <h3 className="text-base font-black text-amber-800 mb-1">📈 En progression</h3>
                    <p className="text-xs text-amber-600 mb-3">Matières avec de bons progrès en cours</p>
                    <div className="space-y-2.5">
                      {average.map((s) => (
                        <div key={s.name} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                          <span className="text-xl">{s.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{s.name}</p>
                            <div className="w-full bg-amber-100 rounded-full h-1.5 mt-1">
                              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${s.score}%` }} />
                            </div>
                          </div>
                          <span className="text-base font-black text-amber-700">{s.score}%</span>
                        </div>
                      ))}
                      {average.length === 0 && <p className="text-xs text-amber-500 italic">Toutes les matières sont bien maîtrisées !</p>}
                    </div>
                  </div>

                  {/* À renforcer */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                    <h3 className="text-base font-black text-red-800 mb-1">💪 À renforcer</h3>
                    <p className="text-xs text-red-500 mb-3">Matières qui méritent plus de travail</p>
                    <div className="space-y-2.5">
                      {toImprove.map((s) => (
                        <div key={s.name} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-red-100">
                          <span className="text-xl">{s.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{s.name}</p>
                            <div className="w-full bg-red-100 rounded-full h-1.5 mt-1">
                              <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${s.score}%` }} />
                            </div>
                          </div>
                          <span className="text-base font-black text-red-700">{s.score}%</span>
                        </div>
                      ))}
                      {toImprove.length === 0 && <p className="text-xs text-red-400 italic">Aucune matière en difficulté. Bravo !</p>}
                    </div>
                    {toImprove.length > 0 && (
                      <div className="mt-4 p-3 bg-white border border-red-200 rounded-xl">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          💡 <strong>Conseil :</strong> Encouragez {CHILD.firstName} à faire 2–3 quiz par semaine sur {toImprove.map(s => s.name).join(" et ")} pour s&apos;améliorer progressivement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Onglet Progression ────────────────────── */}
            {tab === "progression" && (
              <div className="p-5 lg:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">📈 Progression de {CHILD.firstName}</h2>
                  <p className="text-sm text-gray-500">Score moyen semaine après semaine – les 2 derniers mois</p>
                </div>

                {/* Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-black text-gray-900">{PROGRESS_WEEKS.at(-1)?.score}%</p>
                      <p className="text-sm text-emerald-600 font-semibold">
                        ↑ +{(PROGRESS_WEEKS.at(-1)?.score ?? 0) - (PROGRESS_WEEKS[0]?.score ?? 0)} points depuis le début
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl">🚀</span>
                      <p className="text-xs text-gray-400 mt-1">{CHILD.firstName} progresse !</p>
                    </div>
                  </div>
                  <ProgressChart />
                </div>

                {/* Bilan semaine par semaine */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-black text-gray-900 mb-4">Semaine par semaine</h3>
                  <div className="space-y-3">
                    {[...PROGRESS_WEEKS].reverse().map((w, i, arr) => {
                      const prev = arr[i + 1];
                      const diff = prev ? w.score - prev.score : 0;
                      const meta = scoreMeta(w.score);
                      return (
                        <div key={w.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 text-xs text-gray-400 font-medium flex-shrink-0">{w.label}</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full ${meta.bar}`} style={{ width: `${w.score}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-black ${meta.color}`}>{w.score}%</span>
                            {diff !== 0 && (
                              <span className={`text-xs font-bold ${diff > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {diff > 0 ? `↑ +${diff}` : `↓ ${diff}`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message encourageant */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
                  <p className="text-2xl mb-2">🎊</p>
                  <h3 className="text-lg font-black mb-2">{CHILD.firstName} progresse régulièrement !</h3>
                  <p className="text-sm text-amber-100 leading-relaxed">
                    En 2 mois, son score moyen est passé de <strong>{PROGRESS_WEEKS[0].score}%</strong> à <strong>{PROGRESS_WEEKS.at(-1)?.score}%</strong>.
                    C&apos;est une belle amélioration ! Continuez à l&apos;encourager.
                  </p>
                </div>
              </div>
            )}

            {/* ── Onglet Historique ─────────────────────── */}
            {tab === "historique" && (
              <div className="p-5 lg:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">📝 Tous les quiz de {CHILD.firstName}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{QUIZ_HISTORY.length} quiz au total</p>
                  </div>
                  <select value={histSubject} onChange={(e) => setHistSubject(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300">
                    <option value="Toutes">Toutes les matières</option>
                    {Array.from(new Set(QUIZ_HISTORY.map((q) => q.subject))).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {histFiltered.map((q, i) => {
                    const meta = scoreMeta(q.score);
                    return (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-all flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 ${meta.bg}`}>
                          {q.score >= 90 ? "🥇" : q.score >= 80 ? "🥈" : q.score >= 70 ? "🥉" : "📝"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm leading-tight">{q.quiz}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                            <span className="text-xs text-gray-400">📅 {q.date}</span>
                            <span className="text-xs text-gray-400">⏱ {q.duration}</span>
                            <span className="text-xs text-gray-400">{q.questions} questions</span>
                          </div>
                          <div className="mt-2 w-full max-w-[200px] bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${meta.bar}`} style={{ width: `${q.score}%` }} />
                          </div>
                        </div>
                        <div className={`text-right flex-shrink-0`}>
                          <p className={`text-2xl font-black ${meta.color}`}>{q.score}%</p>
                          <p className={`text-xs font-bold mt-0.5 ${meta.color}`}>{meta.label}</p>
                        </div>
                      </div>
                    );
                  })}

                  {histFiltered.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-4xl mb-3">📭</p>
                      <p className="text-gray-500 font-semibold">Aucun quiz dans cette matière</p>
                    </div>
                  )}
                </div>

                {/* Résumé stats */}
                {histFiltered.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-black text-amber-700">{histFiltered.length}</p>
                      <p className="text-xs text-gray-500 font-medium">Quiz passés</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-amber-700">
                        {Math.round(histFiltered.reduce((s, q) => s + q.score, 0) / histFiltered.length)}%
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Score moyen</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-amber-700">{Math.max(...histFiltered.map((q) => q.score))}%</p>
                      <p className="text-xs text-gray-500 font-medium">Meilleur score</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
