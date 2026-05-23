"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const teacher = {
  firstName: "Ousmane", lastName: "Ndiaye",
  subject: "Histoire-Géographie", school: "Lycée Lamine Guèye",
  classes: 3, students: 87,
};

const stats = [
  { label: "Élèves",        value: "87",  icon: "👨‍🎓", color: "bg-indigo-50 text-indigo-700",  sub: "+3 ce mois"      },
  { label: "Classes",       value: "3",   icon: "🏫",  color: "bg-emerald-50 text-emerald-700", sub: "CM1, CM2, 6ème"  },
  { label: "Quiz créés",    value: "24",  icon: "📝",  color: "bg-violet-50 text-violet-700",   sub: "8 actifs"        },
  { label: "Score moyen",   value: "78%", icon: "🎯",  color: "bg-amber-50 text-amber-700",    sub: "+5% ce mois"     },
];

const classes = [
  { name: "CM1 – A",  students: 28, avgScore: 82, topSubject: "Histoire",    color: "from-indigo-500 to-violet-600",  activity: "Actif" },
  { name: "CM2 – B",  students: 31, avgScore: 74, topSubject: "Géographie",  color: "from-emerald-500 to-teal-600",   activity: "Actif" },
  { name: "6ème – C", students: 28, avgScore: 79, topSubject: "Instr. civ.", color: "from-rose-500 to-pink-600",      activity: "Actif" },
];

const recentResults = [
  { student: "Aminata Sarr",  class: "CM1",  quiz: "La colonisation de l'Afrique",      score: 95, date: "Aujourd'hui",    badge: "🥇" },
  { student: "Moussa Diop",   class: "CM2",  quiz: "Les fleuves du Sénégal",             score: 88, date: "Aujourd'hui",    badge: "🥈" },
  { student: "Fatou Diallo",  class: "CM1",  quiz: "La colonisation de l'Afrique",      score: 72, date: "Hier",            badge: null  },
  { student: "Ibrahim Koné",  class: "6ème", quiz: "Droits et devoirs du citoyen",       score: 91, date: "Hier",            badge: "🥇" },
  { student: "Aïssatou Ba",   class: "CM2",  quiz: "Géographie physique du Sénégal",    score: 65, date: "Il y a 2j",       badge: null  },
  { student: "Seydou Gaye",   class: "6ème", quiz: "Droits et devoirs du citoyen",       score: 58, date: "Il y a 2j",       badge: null  },
];

const competitions = [
  { name: "Génie en Herbe – Phase Régionale", date: "15 Juin 2026",   level: "Régional", status: "Inscrit",    color: "bg-indigo-100 text-indigo-700" },
  { name: "Quiz Inter-Lycées Dakar",           date: "2 Juil. 2026",   level: "Local",    status: "En prépa.",  color: "bg-amber-100 text-amber-700"   },
  { name: "Olympiades Scolaires Nationales",   date: "20 Oct. 2026",   level: "National", status: "Ouvert",     color: "bg-emerald-100 text-emerald-700"},
];

const quickQuizzes = [
  { title: "Empires africains précoloniaux", subject: "Histoire",     questions: 10, difficulty: "Moyen",  plays: 42 },
  { title: "Carte du Sénégal (régions)",    subject: "Géographie",   questions: 8,  difficulty: "Facile", plays: 67 },
  { title: "La Constitution sénégalaise",  subject: "Instr. civique", questions: 12, difficulty: "Difficile", plays: 23 },
];

const navItems = [
  { href: "/dashboard/teacher",           label: "Accueil",    icon: "🏠",  active: true  },
  { href: "/dashboard/teacher/students",  label: "Mes élèves", icon: "👨‍🎓", active: false },
  { href: "/dashboard/teacher/questions", label: "Questions",  icon: "✏️",  active: false },
  { href: "/dashboard/teacher/sessions",  label: "Sessions",   icon: "🎯",  active: false },
  { href: "/quiz",                         label: "Quiz",       icon: "📝",  active: false },
  { href: "/results",                      label: "Résultats",  icon: "📊",  active: false },
  { href: "/messages",                     label: "Messages",   icon: "💬",  active: false },
  { href: "/settings",                     label: "Paramètres", icon: "⚙️",  active: false },
];

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-emerald-700 to-teal-800 flex flex-col fixed h-full z-20 transition-transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-emerald-300 text-xs mt-0.5">Espace enseignant</p>
        </div>

        {/* Profil rapide */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-lg font-black text-amber-900">
              {teacher.firstName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{teacher.firstName} {teacher.lastName}</p>
              <p className="text-xs text-emerald-300">{teacher.subject}</p>
              <p className="text-xs text-emerald-400">{teacher.school}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${active ? "bg-white/20 text-white" : "text-emerald-200 hover:bg-white/10 hover:text-white"}`}>
              <span className="text-base">{icon}</span>{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-64 flex-1 flex flex-col">
        {/* Topbar mobile */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black text-emerald-600">NEKH XËL</span>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {teacher.firstName[0]}
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-auto">
          {/* Hero */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-emerald-200 text-sm font-medium">Bonjour 👋</p>
                <h1 className="text-2xl font-black">{teacher.firstName} {teacher.lastName}</h1>
                <p className="text-emerald-200 text-sm mt-1">{teacher.subject} · {teacher.school}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/dashboard/teacher/questions"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                  ✏️ Créer une question
                </Link>
                <Link href="/dashboard/teacher/sessions"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                  🎯 Nouvelle session
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon, color, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Outils enseignant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/dashboard/teacher/students",  icon: "👨‍🎓", label: "Mes élèves",          desc: "Résultats et statistiques par élève",     color: "from-indigo-500 to-violet-600",  stat: `${teacher.students} élèves`    },
              { href: "/dashboard/teacher/questions", icon: "✏️",  label: "Banque de questions",  desc: "Créez et importez vos questions (CSV)",  color: "from-emerald-500 to-teal-600",  stat: "4 questions"                   },
              { href: "/dashboard/teacher/sessions",  icon: "🎯",  label: "Sessions",             desc: "Planifiez des entraînements et évals",   color: "from-amber-500 to-orange-600",  stat: "5 sessions"                    },
            ].map(({ href, icon, label, desc, color, stat }) => (
              <Link key={label} href={href}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                <div className={`bg-gradient-to-br ${color} h-16 flex items-center px-5 gap-3`}>
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-white font-black text-sm">{label}</p>
                    <p className="text-white/70 text-xs">{stat}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{desc}</p>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="xl:col-span-2 space-y-6">
              {/* Classes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black text-gray-900">🏫 Mes classes</h2>
                  <button className="text-xs text-emerald-600 font-semibold hover:underline">Gérer →</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classes.map((c) => (
                    <div key={c.name} className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all group">
                      <div className={`bg-gradient-to-br ${c.color} h-16 flex items-center justify-center`}>
                        <span className="text-2xl font-black text-white">{c.name.split(" – ")[0]}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-black text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.students} élèves</p>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <div className="w-24 bg-gray-100 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${c.avgScore}%` }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">Moy. {c.avgScore}%</p>
                          </div>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{c.activity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résultats récents */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-gray-900">📊 Derniers résultats</h2>
                  <Link href="/results" className="text-xs text-emerald-600 font-semibold hover:underline">Voir tout →</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 font-semibold border-b border-gray-100">
                        <th className="text-left pb-3 pl-1">Élève</th>
                        <th className="text-left pb-3">Classe</th>
                        <th className="text-left pb-3 hidden sm:table-cell">Quiz</th>
                        <th className="text-center pb-3">Score</th>
                        <th className="text-right pb-3 pr-1">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentResults.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                                {r.student[0]}
                              </div>
                              <span className="font-semibold text-gray-800 truncate max-w-[80px]">{r.student}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.class}</span>
                          </td>
                          <td className="py-3 hidden sm:table-cell">
                            <span className="text-gray-600 text-xs truncate max-w-[150px] block">{r.quiz}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-sm font-black ${r.score >= 85 ? "text-emerald-600" : r.score >= 70 ? "text-amber-600" : "text-red-500"}`}>
                              {r.badge} {r.score}%
                            </span>
                          </td>
                          <td className="py-3 pr-1 text-right text-xs text-gray-400">{r.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-5">
              {/* Compétitions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-gray-900 mb-4">🏆 Compétitions à venir</h3>
                <div className="space-y-3">
                  {competitions.map((c) => (
                    <div key={c.name} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-bold text-gray-800 leading-tight">{c.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">📅 {c.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz rapides */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900">📝 Mes quiz</h3>
                  <Link href="/quiz" className="text-xs text-emerald-600 font-semibold hover:underline">Voir tout</Link>
                </div>
                <div className="space-y-3">
                  {quickQuizzes.map((q) => (
                    <Link key={q.title} href="/quiz"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-tight truncate">{q.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{q.questions} questions · {q.difficulty}</p>
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">▶ {q.plays} parties</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/quiz/create"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-emerald-200 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-colors">
                  + Créer un nouveau quiz
                </Link>
              </div>

              {/* Actions rapides */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
                <h3 className="text-sm font-black text-gray-900 mb-3">⚡ Actions rapides</h3>
                <div className="space-y-2">
                  {[
                    { icon: "📤", label: "Envoyer un devoir", href: "/exercises/create" },
                    { icon: "📊", label: "Rapport de classe",  href: "/results"          },
                    { icon: "👤", label: "Ajouter un élève",   href: "/students/add"     },
                    { icon: "📅", label: "Planifier un cours", href: "/courses/schedule" },
                  ].map(({ icon, label, href }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors text-sm font-semibold text-gray-700">
                      <span>{icon}</span>{label}
                      <svg className="w-3.5 h-3.5 text-gray-400 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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
