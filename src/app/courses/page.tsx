"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["Tous", "Mathématiques", "Français", "Histoire-Géo", "Sciences", "Anglais"];

const courses = [
  {
    id: 1,
    title: "Algèbre – Équations et inéquations",
    category: "Mathématiques",
    level: "Intermédiaire",
    duration: "6h30",
    lessons: 14,
    progress: 75,
    color: "from-indigo-500 to-indigo-700",
    icon: "📐",
    enrolled: true,
  },
  {
    id: 2,
    title: "Grammaire française avancée",
    category: "Français",
    level: "Avancé",
    duration: "4h00",
    lessons: 10,
    progress: 100,
    color: "from-green-500 to-emerald-700",
    icon: "✍️",
    enrolled: true,
  },
  {
    id: 3,
    title: "La Révolution française",
    category: "Histoire-Géo",
    level: "Débutant",
    duration: "3h15",
    lessons: 8,
    progress: 40,
    color: "from-yellow-400 to-orange-500",
    icon: "🏛️",
    enrolled: true,
  },
  {
    id: 4,
    title: "Physique – Les forces et mouvements",
    category: "Sciences",
    level: "Intermédiaire",
    duration: "5h00",
    lessons: 12,
    progress: 10,
    color: "from-red-400 to-rose-600",
    icon: "⚗️",
    enrolled: true,
  },
  {
    id: 5,
    title: "English Grammar – Tenses",
    category: "Anglais",
    level: "Intermédiaire",
    duration: "4h45",
    lessons: 11,
    progress: 0,
    color: "from-sky-400 to-blue-600",
    icon: "🇬🇧",
    enrolled: false,
  },
  {
    id: 6,
    title: "Géométrie – Trigonométrie",
    category: "Mathématiques",
    level: "Avancé",
    duration: "7h00",
    lessons: 16,
    progress: 0,
    color: "from-violet-500 to-purple-700",
    icon: "📏",
    enrolled: false,
  },
  {
    id: 7,
    title: "Chimie – Réactions et molécules",
    category: "Sciences",
    level: "Débutant",
    duration: "3h30",
    lessons: 9,
    progress: 0,
    color: "from-teal-400 to-cyan-600",
    icon: "🧪",
    enrolled: false,
  },
  {
    id: 8,
    title: "Littérature – Analyse de textes",
    category: "Français",
    level: "Avancé",
    duration: "5h30",
    lessons: 13,
    progress: 0,
    color: "from-pink-400 to-rose-500",
    icon: "📖",
    enrolled: false,
  },
];

const levelColor: Record<string, string> = {
  Débutant: "bg-green-100 text-green-700",
  Intermédiaire: "bg-yellow-100 text-yellow-700",
  Avancé: "bg-red-100 text-red-700",
};

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) => {
    const matchCat = activeCategory === "Tous" || c.category === activeCategory;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { href: "/dashboard", label: "Tableau de bord", icon: "🏠", active: false },
            { href: "/courses", label: "Mes cours", icon: "📚", active: true },
            { href: "/exercises", label: "Exercices", icon: "✏️", active: false },
            { href: "#", label: "Résultats", icon: "📊", active: false },
            { href: "/messages", label: "Messages", icon: "💬", active: false },
            { href: "#", label: "Paramètres", icon: "⚙️", active: false },
          ].map(({ href, label, icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
            <Link href="/login" className="text-xs text-gray-400 hover:text-red-500 transition-colors">↩</Link>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="ml-64 flex-1 p-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes cours</h1>
            <p className="text-sm text-gray-500 mt-1">{courses.length} cours disponibles</p>
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            + Explorer le catalogue
          </button>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un cours…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de cours */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Aucun cours trouvé pour &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group block">
                {/* Bandeau coloré */}
                <div className={`bg-gradient-to-r ${course.color} h-28 flex items-center justify-center`}>
                  <span className="text-5xl">{course.icon}</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColor[course.level]}`}>
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mt-2 mb-3 leading-snug">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>🕐 {course.duration}</span>
                    <span>📄 {course.lessons} leçons</span>
                  </div>

                  {course.enrolled ? (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Progression</span>
                        <span className="text-xs font-semibold text-gray-700">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                        <div
                          className={`bg-gradient-to-r ${course.color} h-1.5 rounded-full`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <button className="w-full py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                        {course.progress === 100 ? "Revoir le cours" : "Continuer"}
                      </button>
                    </>
                  ) : (
                    <button className="w-full py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                      S&apos;inscrire au cours
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
