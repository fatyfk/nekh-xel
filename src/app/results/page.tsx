"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/courses", label: "Mes cours", icon: "📚" },
  { href: "/exercises", label: "Exercices", icon: "✏️" },
  { href: "/results", label: "Résultats", icon: "📊", active: true },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "#", label: "Paramètres", icon: "⚙️" },
];

const history = [
  {
    id: 1,
    title: "Résoudre des équations du 2ème degré",
    category: "Mathématiques",
    type: "QCM",
    score: 90,
    total: 10,
    correct: 9,
    duration: "12 min",
    date: "22 mai 2026",
    icon: "📐",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    id: 2,
    title: "La Révolution française – Quiz",
    category: "Histoire-Géo",
    type: "QCM",
    score: 100,
    total: 8,
    correct: 8,
    duration: "8 min",
    date: "21 mai 2026",
    icon: "🏛️",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 3,
    title: "Accords du participe passé",
    category: "Français",
    type: "Rédaction",
    score: 75,
    total: 6,
    correct: 5,
    duration: "18 min",
    date: "20 mai 2026",
    icon: "✍️",
    color: "from-green-500 to-emerald-700",
  },
  {
    id: 4,
    title: "Résoudre des équations du 2ème degré",
    category: "Mathématiques",
    type: "QCM",
    score: 70,
    total: 10,
    correct: 7,
    duration: "14 min",
    date: "18 mai 2026",
    icon: "📐",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    id: 5,
    title: "La Révolution française – Quiz",
    category: "Histoire-Géo",
    type: "QCM",
    score: 87,
    total: 8,
    correct: 7,
    duration: "9 min",
    date: "15 mai 2026",
    icon: "🏛️",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 6,
    title: "Accords du participe passé",
    category: "Français",
    type: "Rédaction",
    score: 60,
    total: 6,
    correct: 4,
    duration: "22 min",
    date: "12 mai 2026",
    icon: "✍️",
    color: "from-green-500 to-emerald-700",
  },
];

const weeklyData = [
  { day: "Lun", score: 70, exercises: 1 },
  { day: "Mar", score: 87, exercises: 2 },
  { day: "Mer", score: 0, exercises: 0 },
  { day: "Jeu", score: 75, exercises: 1 },
  { day: "Ven", score: 100, exercises: 1 },
  { day: "Sam", score: 90, exercises: 1 },
  { day: "Dim", score: 0, exercises: 0 },
];

const byCategory = [
  { label: "Mathématiques", avg: 80, count: 2, color: "bg-indigo-500" },
  { label: "Histoire-Géo", avg: 93, count: 2, color: "bg-yellow-400" },
  { label: "Français", avg: 67, count: 2, color: "bg-green-500" },
];

const filters = ["Tous", "Mathématiques", "Français", "Histoire-Géo", "Sciences", "Anglais"];

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">{score}%</span>;
  if (score >= 60) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">{score}%</span>;
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">{score}%</span>;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "bg-green-500" : score >= 60 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function ResultsPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered = history.filter(
    (r) => activeFilter === "Tous" || r.category === activeFilter
  );

  const avgScore = Math.round(history.reduce((a, r) => a + r.score, 0) / history.length);
  const bestScore = Math.max(...history.map((r) => r.score));
  const totalExercises = history.length;
  const perfectScores = history.filter((r) => r.score === 100).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">F</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Contenu */}
      <div className="ml-64 flex-1 p-8">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes résultats</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi de vos performances sur l&apos;ensemble des exercices.</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: "Score moyen", value: `${avgScore}%`, icon: "🎯", sub: "sur tous les quiz", color: "text-indigo-600" },
            { label: "Meilleur score", value: `${bestScore}%`, icon: "🏆", sub: "score maximum atteint", color: "text-yellow-500" },
            { label: "Exercices faits", value: totalExercises, icon: "✅", sub: "au total", color: "text-green-600" },
            { label: "Scores parfaits", value: perfectScores, icon: "⭐", sub: "100% obtenus", color: "text-pink-500" },
          ].map(({ label, value, icon, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
              </div>
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Graphique scores hebdo */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900">Scores cette semaine</h2>
              <span className="text-xs text-gray-400">7 derniers jours</span>
            </div>
            <div className="flex items-end gap-4 h-36">
              {weeklyData.map(({ day, score, exercises }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">{score > 0 ? `${score}%` : ""}</span>
                  <div className="w-full relative flex flex-col justify-end" style={{ height: "100px" }}>
                    <div
                      className={`w-full rounded-xl transition-all ${
                        score >= 85 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : score > 0 ? "bg-red-400" : "bg-gray-100"
                      }`}
                      style={{ height: score > 0 ? `${score}%` : "8px" }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">{day}</p>
                    {exercises > 0 && <p className="text-xs text-gray-400">{exercises} ex.</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Par matière */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Moyenne par matière</h2>
            <div className="space-y-5">
              {byCategory.map(({ label, avg, count, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{count} exercices</span>
                      <ScoreBadge score={avg} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${avg}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Légende */}
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
              {[
                { label: "Excellent (≥ 85%)", color: "bg-green-400" },
                { label: "Correct (60–84%)", color: "bg-yellow-400" },
                { label: "À revoir (< 60%)", color: "bg-red-400" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Historique des résultats</h2>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">Aucun résultat pour cette matière</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((result) => (
                <div key={`${result.id}-${result.date}`} className="px-6 py-4 flex items-center gap-5 hover:bg-gray-50 transition-colors">
                  {/* Icône */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${result.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {result.icon}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{result.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-indigo-600 font-medium">{result.category}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{result.type}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">🕐 {result.duration}</span>
                    </div>
                  </div>

                  {/* Barre score */}
                  <div className="w-32 hidden sm:block">
                    <ScoreBar score={result.score} />
                    <p className="text-xs text-gray-400 mt-1">{result.correct}/{result.total} correctes</p>
                  </div>

                  {/* Score + date */}
                  <div className="text-right flex-shrink-0">
                    <ScoreBadge score={result.score} />
                    <p className="text-xs text-gray-400 mt-1">{result.date}</p>
                  </div>

                  {/* Action */}
                  <Link
                    href="/exercises"
                    className="flex-shrink-0 text-xs text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Refaire
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
