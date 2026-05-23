"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type SubjectKey = "Histoire" | "Géographie" | "Sciences" | "Instr. civique" | "Conjugaison" | "Calcul mental";

type QuizResult = { quiz: string; score: number; date: string; subject: SubjectKey };

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  xp: number;
  streak: number;
  avgScore: number;
  lastActivity: string;
  subjects: Record<SubjectKey, number>;
  recentQuizzes: QuizResult[];
};

const STUDENTS: Student[] = [
  {
    id: "1", firstName: "Aminata", lastName: "Sarr", class: "CM1-A",
    xp: 2840, streak: 12, avgScore: 87, lastActivity: "Aujourd'hui",
    subjects: { Histoire: 92, Géographie: 85, Sciences: 78, "Instr. civique": 88, Conjugaison: 75, "Calcul mental": 82 },
    recentQuizzes: [
      { quiz: "La colonisation de l'Afrique", score: 95, date: "Aujourd'hui", subject: "Histoire" },
      { quiz: "Les fleuves du Sénégal", score: 88, date: "Il y a 2j", subject: "Géographie" },
      { quiz: "Le système solaire", score: 79, date: "Il y a 4j", subject: "Sciences" },
    ],
  },
  {
    id: "2", firstName: "Moussa", lastName: "Diop", class: "CM2-B",
    xp: 2150, streak: 7, avgScore: 81, lastActivity: "Hier",
    subjects: { Histoire: 78, Géographie: 88, Sciences: 82, "Instr. civique": 79, Conjugaison: 85, "Calcul mental": 76 },
    recentQuizzes: [
      { quiz: "Les fleuves du Sénégal", score: 88, date: "Hier", subject: "Géographie" },
      { quiz: "La Constitution sénégalaise", score: 74, date: "Il y a 3j", subject: "Instr. civique" },
    ],
  },
  {
    id: "3", firstName: "Fatou", lastName: "Diallo", class: "CM1-A",
    xp: 1920, streak: 3, avgScore: 72, lastActivity: "Il y a 2j",
    subjects: { Histoire: 75, Géographie: 68, Sciences: 71, "Instr. civique": 77, Conjugaison: 70, "Calcul mental": 69 },
    recentQuizzes: [
      { quiz: "La colonisation de l'Afrique", score: 72, date: "Il y a 2j", subject: "Histoire" },
      { quiz: "Les nombres entiers", score: 65, date: "Il y a 5j", subject: "Calcul mental" },
    ],
  },
  {
    id: "4", firstName: "Ibrahim", lastName: "Koné", class: "6ème-C",
    xp: 3200, streak: 21, avgScore: 91, lastActivity: "Aujourd'hui",
    subjects: { Histoire: 94, Géographie: 89, Sciences: 91, "Instr. civique": 95, Conjugaison: 88, "Calcul mental": 90 },
    recentQuizzes: [
      { quiz: "Droits et devoirs du citoyen", score: 95, date: "Aujourd'hui", subject: "Instr. civique" },
      { quiz: "La colonisation de l'Afrique", score: 92, date: "Il y a 2j", subject: "Histoire" },
      { quiz: "Le système solaire", score: 89, date: "Il y a 4j", subject: "Sciences" },
    ],
  },
  {
    id: "5", firstName: "Aïssatou", lastName: "Ba", class: "CM2-B",
    xp: 1340, streak: 1, avgScore: 65, lastActivity: "Il y a 2j",
    subjects: { Histoire: 62, Géographie: 70, Sciences: 58, "Instr. civique": 65, Conjugaison: 68, "Calcul mental": 61 },
    recentQuizzes: [
      { quiz: "Géographie physique du Sénégal", score: 65, date: "Il y a 2j", subject: "Géographie" },
    ],
  },
  {
    id: "6", firstName: "Seydou", lastName: "Gaye", class: "6ème-C",
    xp: 980, streak: 0, avgScore: 54, lastActivity: "Il y a 5j",
    subjects: { Histoire: 55, Géographie: 52, Sciences: 50, "Instr. civique": 58, Conjugaison: 56, "Calcul mental": 53 },
    recentQuizzes: [
      { quiz: "Droits et devoirs du citoyen", score: 58, date: "Il y a 5j", subject: "Instr. civique" },
    ],
  },
  {
    id: "7", firstName: "Rokhaya", lastName: "Ndiaye", class: "CM1-A",
    xp: 2680, streak: 9, avgScore: 84, lastActivity: "Hier",
    subjects: { Histoire: 88, Géographie: 82, Sciences: 80, "Instr. civique": 85, Conjugaison: 87, "Calcul mental": 78 },
    recentQuizzes: [
      { quiz: "Les temps du présent", score: 90, date: "Hier", subject: "Conjugaison" },
      { quiz: "La colonisation de l'Afrique", score: 82, date: "Il y a 3j", subject: "Histoire" },
    ],
  },
  {
    id: "8", firstName: "Cheikh", lastName: "Fall", class: "CM2-B",
    xp: 1760, streak: 5, avgScore: 76, lastActivity: "Hier",
    subjects: { Histoire: 79, Géographie: 74, Sciences: 76, "Instr. civique": 78, Conjugaison: 73, "Calcul mental": 77 },
    recentQuizzes: [
      { quiz: "Les nombres décimaux", score: 78, date: "Hier", subject: "Calcul mental" },
      { quiz: "Les fleuves du Sénégal", score: 74, date: "Il y a 4j", subject: "Géographie" },
    ],
  },
  {
    id: "9", firstName: "Ndéye", lastName: "Mbaye", class: "6ème-C",
    xp: 2320, streak: 14, avgScore: 89, lastActivity: "Aujourd'hui",
    subjects: { Histoire: 91, Géographie: 87, Sciences: 90, "Instr. civique": 88, Conjugaison: 92, "Calcul mental": 85 },
    recentQuizzes: [
      { quiz: "La photosynthèse", score: 94, date: "Aujourd'hui", subject: "Sciences" },
      { quiz: "Accord du participe passé", score: 91, date: "Hier", subject: "Conjugaison" },
    ],
  },
  {
    id: "10", firstName: "Babacar", lastName: "Sow", class: "CM2-B",
    xp: 1540, streak: 4, avgScore: 69, lastActivity: "Il y a 3j",
    subjects: { Histoire: 72, Géographie: 65, Sciences: 68, "Instr. civique": 71, Conjugaison: 66, "Calcul mental": 70 },
    recentQuizzes: [
      { quiz: "Les fractions", score: 70, date: "Il y a 3j", subject: "Calcul mental" },
      { quiz: "La Constitution sénégalaise", score: 68, date: "Il y a 6j", subject: "Instr. civique" },
    ],
  },
];

const CLASSES = ["Toutes", "CM1-A", "CM2-B", "6ème-C"];

const SUBJECT_BAR_COLORS: Record<SubjectKey, string> = {
  Histoire: "bg-amber-400",
  Géographie: "bg-emerald-400",
  Sciences: "bg-red-400",
  "Instr. civique": "bg-violet-400",
  Conjugaison: "bg-cyan-400",
  "Calcul mental": "bg-orange-400",
};

function scoreColor(v: number) {
  if (v >= 85) return "text-emerald-600";
  if (v >= 70) return "text-indigo-600";
  if (v >= 55) return "text-amber-600";
  return "text-red-600";
}

function scoreBarColor(v: number) {
  if (v >= 85) return "bg-emerald-500";
  if (v >= 70) return "bg-indigo-500";
  if (v >= 55) return "bg-amber-500";
  return "bg-red-400";
}

function statusBadge(avgScore: number) {
  if (avgScore >= 85) return { label: "Excellent",     cls: "bg-emerald-100 text-emerald-700" };
  if (avgScore >= 70) return { label: "Bien",          cls: "bg-indigo-100 text-indigo-700"   };
  if (avgScore >= 55) return { label: "À suivre",      cls: "bg-amber-100 text-amber-700"     };
  return               { label: "En difficulté", cls: "bg-red-100 text-red-700"         };
}

const TEACHER = { firstName: "Ousmane", lastName: "Ndiaye", subject: "Histoire-Géographie", school: "Lycée Lamine Guèye" };

const NAV = [
  { href: "/dashboard/teacher",           label: "Accueil",    icon: "🏠"  },
  { href: "/dashboard/teacher/students",  label: "Mes élèves", icon: "👨‍🎓", active: true },
  { href: "/dashboard/teacher/questions", label: "Questions",  icon: "✏️"  },
  { href: "/dashboard/teacher/sessions",  label: "Sessions",   icon: "🎯"  },
  { href: "/quiz",                         label: "Quiz",       icon: "📝"  },
  { href: "/results",                      label: "Résultats",  icon: "📊"  },
  { href: "/messages",                     label: "Messages",   icon: "💬"  },
  { href: "/settings",                     label: "Paramètres", icon: "⚙️"  },
];

export default function StudentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"name" | "score" | "xp" | "streak">("score");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = STUDENTS
    .filter((s) =>
      (selectedClass === "Toutes" || s.class === selectedClass) &&
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name")   return a.lastName.localeCompare(b.lastName);
      if (sortBy === "score")  return b.avgScore - a.avgScore;
      if (sortBy === "xp")     return b.xp - a.xp;
      if (sortBy === "streak") return b.streak - a.streak;
      return 0;
    });

  const avgAll  = Math.round(STUDENTS.reduce((s, e) => s + e.avgScore, 0) / STUDENTS.length);
  const maxStreak = Math.max(...STUDENTS.map((s) => s.streak));
  const top = STUDENTS.reduce((a, b) => (a.avgScore > b.avgScore ? a : b));
  const struggling = STUDENTS.filter((s) => s.avgScore < 55).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-emerald-700 to-teal-800 flex flex-col fixed h-full z-20 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-emerald-300 text-xs mt-0.5">Espace enseignant</p>
        </div>
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-lg font-black text-amber-900">
              {TEACHER.firstName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{TEACHER.firstName} {TEACHER.lastName}</p>
              <p className="text-xs text-emerald-300">{TEACHER.subject}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-white/20 text-white" : "text-emerald-200 hover:bg-white/10 hover:text-white"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black text-emerald-600">NEKH XËL</span>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">{TEACHER.firstName[0]}</div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
            {/* Breadcrumb + title */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/dashboard/teacher" className="hover:text-gray-600 transition-colors">Tableau de bord</Link>
                <span>›</span>
                <span className="text-gray-700 font-semibold">Mes élèves</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">👨‍🎓 Mes élèves</h1>
              <p className="text-sm text-gray-500 mt-1">{STUDENTS.length} élèves · {CLASSES.length - 1} classes · Lycée Lamine Guèye</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total élèves",      value: STUDENTS.length,                     icon: "👨‍🎓", color: "bg-indigo-50 text-indigo-700"   },
                { label: "Score moyen",        value: `${avgAll}%`,                         icon: "🎯",  color: "bg-emerald-50 text-emerald-700" },
                { label: "Meilleur streak",    value: `${maxStreak} 🔥`,                    icon: "🏆",  color: "bg-amber-50 text-amber-700"     },
                { label: "En difficulté",      value: `${struggling} élève${struggling !== 1 ? "s" : ""}`, icon: "⚠️", color: "bg-red-50 text-red-700" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Top performer highlight */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                {top.firstName[0]}{top.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-200 font-medium">🏆 Meilleur élève du mois</p>
                <p className="text-lg font-black">{top.firstName} {top.lastName}</p>
                <p className="text-sm text-emerald-200">{top.class} · {top.avgScore}% de moyenne · {top.xp.toLocaleString()} XP</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-3xl">🥇</p>
                <p className="text-xs text-emerald-200 mt-1">Streak {top.streak} jours</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Rechercher un élève…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {CLASSES.map((c) => (
                  <button key={c} onClick={() => setSelectedClass(c)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedClass === c ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="score">Score ↓</option>
                <option value="name">Nom A→Z</option>
                <option value="xp">XP ↓</option>
                <option value="streak">Streak ↓</option>
              </select>
            </div>

            {/* Student table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                      <th className="text-left px-5 py-3.5">Élève</th>
                      <th className="text-left px-3 py-3.5">Classe</th>
                      <th className="text-left px-3 py-3.5 hidden md:table-cell">XP</th>
                      <th className="text-left px-3 py-3.5 hidden sm:table-cell">Streak</th>
                      <th className="text-left px-3 py-3.5">Moyenne</th>
                      <th className="text-left px-3 py-3.5 hidden lg:table-cell">Activité</th>
                      <th className="text-left px-3 py-3.5">Statut</th>
                      <th className="px-5 py-3.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((s) => {
                      const badge = statusBadge(s.avgScore);
                      const isSelected = selectedStudent?.id === s.id;
                      return (
                        <tr key={s.id}
                          className={`transition-colors cursor-pointer ${isSelected ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                          onClick={() => setSelectedStudent(isSelected ? null : s)}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                {s.firstName[0]}{s.lastName[0]}
                              </div>
                              <p className="font-bold text-gray-900 whitespace-nowrap">{s.firstName} {s.lastName}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{s.class}</span>
                          </td>
                          <td className="px-3 py-3.5 hidden md:table-cell">
                            <span className="text-xs font-bold text-indigo-600">{s.xp.toLocaleString()}</span>
                          </td>
                          <td className="px-3 py-3.5 hidden sm:table-cell">
                            <span className={`text-xs font-bold ${s.streak > 0 ? "text-orange-500" : "text-gray-300"}`}>
                              {s.streak > 0 ? `🔥 ${s.streak}j` : "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                                <div className={`h-1.5 rounded-full ${scoreBarColor(s.avgScore)}`} style={{ width: `${s.avgScore}%` }} />
                              </div>
                              <span className={`text-xs font-black ${scoreColor(s.avgScore)}`}>{s.avgScore}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 hidden lg:table-cell">
                            <span className="text-xs text-gray-400">{s.lastActivity}</span>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${badge.cls}`}>{badge.label}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${isSelected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>
                              {isSelected ? "Fermer" : "Voir →"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-gray-500 font-semibold">Aucun élève trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selectedStudent && (
            <div className="w-80 xl:w-96 bg-white border-l border-gray-100 flex flex-col overflow-hidden flex-shrink-0 hidden lg:flex">
              {/* Panel header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-black">
                      {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-base">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                      <p className="text-sm text-gray-500">{selectedStudent.class}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Key stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-indigo-50 rounded-xl py-2.5 px-1">
                    <p className="text-base font-black text-indigo-700">{selectedStudent.xp.toLocaleString()}</p>
                    <p className="text-xs text-indigo-500 font-medium">XP</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl py-2.5 px-1">
                    <p className="text-base font-black text-orange-600">{selectedStudent.streak}🔥</p>
                    <p className="text-xs text-orange-400 font-medium">Streak</p>
                  </div>
                  <div className={`rounded-xl py-2.5 px-1 ${selectedStudent.avgScore >= 85 ? "bg-emerald-50" : selectedStudent.avgScore >= 70 ? "bg-indigo-50" : "bg-amber-50"}`}>
                    <p className={`text-base font-black ${scoreColor(selectedStudent.avgScore)}`}>{selectedStudent.avgScore}%</p>
                    <p className="text-xs text-gray-400 font-medium">Moyenne</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Subject breakdown */}
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-3">📊 Résultats par matière</h3>
                  <div className="space-y-3">
                    {(Object.entries(selectedStudent.subjects) as [SubjectKey, number][])
                      .sort((a, b) => b[1] - a[1])
                      .map(([subject, score]) => (
                        <div key={subject}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-600">{subject}</p>
                            <span className={`text-xs font-black ${scoreColor(score)}`}>{score}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${SUBJECT_BAR_COLORS[subject]}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent quizzes */}
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-3">📝 Quiz récents</h3>
                  <div className="space-y-2">
                    {selectedStudent.recentQuizzes.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Aucun quiz récent</p>
                    ) : selectedStudent.recentQuizzes.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 leading-tight truncate">{q.quiz}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{q.subject} · {q.date}</p>
                        </div>
                        <span className={`text-sm font-black flex-shrink-0 ${scoreColor(q.score)}`}>
                          {q.score >= 90 ? "🥇" : q.score >= 80 ? "🥈" : q.score >= 70 ? "🥉" : ""} {q.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {selectedStudent.avgScore < 70 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-black text-amber-800 mb-2">⚠️ Points à renforcer</p>
                    <ul className="space-y-1">
                      {(Object.entries(selectedStudent.subjects) as [SubjectKey, number][])
                        .filter(([, s]) => s < 65)
                        .map(([subject]) => (
                          <li key={subject} className="text-xs text-amber-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            {subject}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Actions</h3>
                  {[
                    { icon: "📩", label: "Envoyer un message",         href: "/messages" },
                    { icon: "📊", label: "Rapport complet PDF",         href: "/results"  },
                    { icon: "🎯", label: "Créer une session personnalisée", href: "/dashboard/teacher/sessions" },
                  ].map(({ icon, label, href }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                      <span>{icon}</span>
                      <span className="flex-1">{label}</span>
                      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
