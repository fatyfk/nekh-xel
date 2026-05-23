"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

// ── Données mock (remplacées par Supabase en prod) ────────────

const student = {
  firstName: "Fatou", lastName: "Diallo",
  level: 7, xp: 3240, xpNext: 4000,
  streak: 12, totalCourses: 12, totalExercises: 84, avgScore: 87,
};

const subjects = [
  { slug: "histoire",           name: "Histoire",          icon: "🏛️", color: "from-amber-400 to-orange-500",   progress: 60, lessons: 8,  done: 5  },
  { slug: "geographie",         name: "Géographie",        icon: "🌍", color: "from-emerald-400 to-green-600",  progress: 40, lessons: 10, done: 4  },
  { slug: "sciences",           name: "Sciences",          icon: "🔬", color: "from-red-400 to-rose-600",       progress: 25, lessons: 12, done: 3  },
  { slug: "instruction-civique",name: "Instruction civique",icon:"⚖️", color: "from-violet-500 to-purple-700",  progress: 80, lessons: 6,  done: 5  },
  { slug: "orthographe",        name: "Orthographe",       icon: "✏️", color: "from-sky-400 to-blue-600",       progress: 70, lessons: 9,  done: 6  },
  { slug: "conjugaison",        name: "Conjugaison",       icon: "📝", color: "from-cyan-400 to-teal-600",      progress: 55, lessons: 8,  done: 4  },
  { slug: "grammaire",          name: "Grammaire",         icon: "📖", color: "from-indigo-500 to-indigo-700",  progress: 100, lessons: 10, done: 10 },
  { slug: "calcul-mental",      name: "Calcul mental",     icon: "🔢", color: "from-pink-400 to-rose-500",      progress: 45, lessons: 15, done: 7  },
  { slug: "culture-generale",   name: "Culture générale",  icon: "🎓", color: "from-teal-400 to-cyan-600",      progress: 30, lessons: 12, done: 4  },
];

const challenges = [
  { id: 1, title: "Tables de multiplication",  subject: "Calcul mental", icon: "🔢", xp: 80,  difficulty: "Facile",  color: "bg-pink-100 text-pink-700",    done: false },
  { id: 2, title: "La Révolution française",   subject: "Histoire",      icon: "🏛️", xp: 120, difficulty: "Moyen",   color: "bg-amber-100 text-amber-700",  done: false },
  { id: 3, title: "Verbes du 3ème groupe",     subject: "Conjugaison",   icon: "📝", xp: 100, difficulty: "Moyen",   color: "bg-cyan-100 text-cyan-700",    done: true  },
];

const recentActivity = [
  { icon: "✅", text: "Exercice complété",   detail: "Grammaire – Accord adjectif",  time: "Il y a 30 min",  xp: "+50 XP"  },
  { icon: "🚀", text: "Nouveau cours lancé", detail: "Sciences – Les volcans",        time: "Il y a 2h",     xp: null       },
  { icon: "🏅", text: "Badge obtenu",        detail: "Série de 7 jours d'affilée",   time: "Hier",           xp: "+150 XP" },
  { icon: "🎯", text: "Score parfait",       detail: "Quiz Instruction civique",     time: "Hier",           xp: "+100 XP" },
];

const badges = [
  { icon: "🔥", label: "Série 12j" },
  { icon: "📚", label: "10 cours"  },
  { icon: "🎯", label: "100%"      },
  { icon: "🚀", label: "1er cours" },
];

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
const streakDays = [true, true, true, true, true, true, false]; // aujourd'hui = index 5

const navItems = [
  { href: "/dashboard/student",          label: "Accueil",    icon: "🏠",  active: true  },
  { href: "/quiz",                        label: "Quiz",       icon: "📝",  active: false },
  { href: "/competition",                 label: "Compétition",icon: "🏆",  active: false },
  { href: "/dashboard/student/rewards",  label: "Récompenses",icon: "⭐",  active: false },
  { href: "/courses",                    label: "Mes cours",  icon: "📚",  active: false },
  { href: "/results",                    label: "Résultats",  icon: "📊",  active: false },
  { href: "/settings",                   label: "Paramètres", icon: "⚙️",  active: false },
];

// ── Composants internes ───────────────────────────────────────

function XPBar({ xp, xpNext, level }: { xp: number; xpNext: number; level: number }) {
  const pct = Math.round((xp / xpNext) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-indigo-300 font-medium">Niveau {level}</span>
          <span className="text-indigo-200">{xp} / {xpNext} XP</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all"
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-lg font-black text-amber-900 shadow-md flex-shrink-0">
        {level}
      </div>
    </div>
  );
}

function SubjectCard({ s }: { s: typeof subjects[0] }) {
  const isComplete = s.progress === 100;
  return (
    <Link href={`/courses?subject=${s.slug}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">
      <div className={`bg-gradient-to-br ${s.color} h-20 flex items-center justify-center`}>
        <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
      </div>
      <div className="p-4">
        <h3 className="text-xs font-bold text-gray-800 mb-2 leading-tight">{s.name}</h3>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
          <div className={`bg-gradient-to-r ${s.color} h-1.5 rounded-full`}
            style={{ width: `${s.progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{s.done}/{s.lessons} leçons</span>
          {isComplete
            ? <span className="text-xs text-green-600 font-bold">✅ Terminé</span>
            : <span className="text-xs font-bold text-gray-600">{s.progress}%</span>
          }
        </div>
      </div>
    </Link>
  );
}

// ── Page principale ───────────────────────────────────────────

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const greetEmoji = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";

  const xpPct = Math.round((student.xp / student.xpNext) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className={`w-64 bg-gradient-to-b from-indigo-700 to-violet-800 flex flex-col fixed h-full z-20 transition-transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-indigo-300 text-xs mt-0.5">Espace élève</p>
        </div>

        {/* XP card dans sidebar */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/20">
          <XPBar xp={student.xp} xpNext={student.xpNext} level={student.level} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${active
                  ? "bg-white/20 text-white"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}>
              <span className="text-base">{icon}</span>{label}
            </Link>
          ))}
        </nav>

        {/* Profil + déconnexion */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white font-black">
              {student.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-indigo-300">Niveau {student.level}</p>
            </div>
            <Link href="/profile" className="text-indigo-300 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
          <form action={logoutAction}>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Contenu principal ── */}
      <div className="lg:ml-64 flex-1 flex flex-col">

        {/* Topbar mobile */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black text-indigo-600">NEKH XËL</span>
          <Link href="/profile" className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {student.firstName[0]}
          </Link>
        </div>

        <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-auto">

          {/* ── Hero header ── */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
            {/* Bulles décoratives */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-3xl font-black shadow-lg flex-shrink-0">
                  {student.firstName[0]}
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium">{greeting} {greetEmoji}</p>
                  <h1 className="text-2xl font-black">{student.firstName} {student.lastName}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                      🔥 {student.streak} jours
                    </span>
                    <span className="flex items-center gap-1 text-sm bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                      ⭐ {student.xp} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-3 lg:gap-5">
                {[
                  { val: student.totalCourses,   label: "Cours",     icon: "📚" },
                  { val: student.totalExercises, label: "Exercices", icon: "✅" },
                  { val: `${student.avgScore}%`, label: "Moyenne",   icon: "🎯" },
                ].map(({ val, label, icon }) => (
                  <div key={label} className="bg-white/15 rounded-2xl px-4 py-3 text-center backdrop-blur-sm border border-white/20">
                    <span className="text-xl">{icon}</span>
                    <p className="text-xl font-black mt-0.5">{val}</p>
                    <p className="text-xs text-indigo-200">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Barre XP */}
            <div className="relative mt-6">
              <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                <span>Niveau {student.level}</span>
                <span>{student.xp} / {student.xpNext} XP → Niveau {student.level + 1}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all"
                  style={{ width: `${xpPct}%` }} />
              </div>
              <p className="text-xs text-indigo-300 mt-1 text-right">{xpPct}% vers le niveau suivant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Colonne principale (2/3) ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Défis du jour */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-gray-900">⚡ Défis du jour</h2>
                  <Link href="/exercises" className="text-xs text-indigo-600 font-semibold hover:underline">Voir tout →</Link>
                </div>
                <div className="space-y-3">
                  {challenges.map((c) => (
                    <div key={c.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                        ${c.done
                          ? "bg-gray-50 border-gray-100 opacity-60"
                          : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                        }`}>
                      <span className="text-2xl flex-shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${c.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {c.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{c.subject}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>{c.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-bold text-yellow-600">+{c.xp} XP</span>
                        {c.done
                          ? <span className="text-green-500 text-lg">✅</span>
                          : (
                            <Link href="/exercises"
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
                              Commencer
                            </Link>
                          )
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mes matières */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black text-gray-900">📚 Mes matières</h2>
                  <Link href="/courses" className="text-xs text-indigo-600 font-semibold hover:underline">Tous les cours →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjects.map((s) => <SubjectCard key={s.slug} s={s} />)}
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-black text-gray-900 mb-4">🕐 Activité récente</h2>
                <div className="space-y-3">
                  {recentActivity.map(({ icon, text, detail, time, xp }) => (
                    <div key={detail} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{text}</p>
                        <p className="text-xs text-gray-400 truncate">{detail}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                      </div>
                      {xp && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          {xp}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Colonne droite (1/3) ── */}
            <div className="space-y-5">

              {/* Streak calendrier */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900">🔥 Ma série</h3>
                  <span className="text-2xl font-black text-orange-500">{student.streak}j</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {weekDays.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{d}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm
                        ${streakDays[i]
                          ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-300"
                        }`}>
                        {streakDays[i] ? "🔥" : "·"}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Continue pour maintenir ta série ! 💪
                </p>
              </div>

              {/* Mes badges */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900">🏅 Mes badges</h3>
                  <Link href="/profile" className="text-xs text-indigo-600 font-semibold hover:underline">Voir tout</Link>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {badges.map(({ icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-xs text-indigo-700 font-medium text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prochain objectif */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
                <h3 className="text-sm font-black text-gray-900 mb-3">🎯 Prochain objectif</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💎</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Série de 30 jours</p>
                    <p className="text-xs text-gray-500">18 jours restants</p>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-1">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: "40%" }} />
                </div>
                <p className="text-xs text-indigo-600 font-semibold">+500 XP à la clé !</p>
              </div>

              {/* Classement */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-gray-900 mb-4">🏆 Classement de la semaine</h3>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: "Aminata S.",  xp: 4200, you: false, medal: "🥇" },
                    { rank: 2, name: "Moussa D.",   xp: 3800, you: false, medal: "🥈" },
                    { rank: 3, name: "Fatou D.",    xp: 3240, you: true,  medal: "🥉" },
                    { rank: 4, name: "Ibrahim K.",  xp: 2980, you: false, medal: null  },
                  ].map(({ rank, name, xp, you, medal }) => (
                    <div key={rank}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                        ${you ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50"}`}>
                      <span className="text-base w-6 text-center">{medal ?? `${rank}.`}</span>
                      <p className={`flex-1 text-sm font-semibold ${you ? "text-indigo-700" : "text-gray-700"}`}>
                        {name} {you && <span className="text-xs font-bold text-indigo-500">(toi)</span>}
                      </p>
                      <span className="text-xs font-bold text-amber-600">{xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
