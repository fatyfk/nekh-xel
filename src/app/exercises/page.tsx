"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["Tous", "Mathématiques", "Français", "Histoire-Géo", "Sciences", "Anglais"];
const difficulties = ["Tous les niveaux", "Débutant", "Intermédiaire", "Avancé"];

const exercises = [
  {
    id: 1,
    title: "Résoudre des équations du 2ème degré",
    category: "Mathématiques",
    difficulty: "Intermédiaire",
    type: "QCM",
    questions: 10,
    duration: "15 min",
    xp: 120,
    done: true,
    score: 90,
    icon: "📐",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    id: 2,
    title: "Accords du participe passé",
    category: "Français",
    difficulty: "Avancé",
    type: "Rédaction",
    questions: 6,
    duration: "20 min",
    xp: 150,
    done: true,
    score: 75,
    icon: "✍️",
    color: "from-green-500 to-emerald-700",
  },
  {
    id: 3,
    title: "La Révolution française – Quiz",
    category: "Histoire-Géo",
    difficulty: "Débutant",
    type: "QCM",
    questions: 8,
    duration: "10 min",
    xp: 80,
    done: true,
    score: 100,
    icon: "🏛️",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 4,
    title: "Les forces et les mouvements",
    category: "Sciences",
    difficulty: "Intermédiaire",
    type: "Vrai / Faux",
    questions: 12,
    duration: "12 min",
    xp: 100,
    done: false,
    score: null,
    icon: "⚗️",
    color: "from-red-400 to-rose-600",
  },
  {
    id: 5,
    title: "Present Perfect vs Simple Past",
    category: "Anglais",
    difficulty: "Intermédiaire",
    type: "Complétion",
    questions: 15,
    duration: "18 min",
    xp: 130,
    done: false,
    score: null,
    icon: "🇬🇧",
    color: "from-sky-400 to-blue-600",
  },
  {
    id: 6,
    title: "Trigonométrie – Angles et cercle",
    category: "Mathématiques",
    difficulty: "Avancé",
    type: "Calcul",
    questions: 8,
    duration: "25 min",
    xp: 200,
    done: false,
    score: null,
    icon: "📏",
    color: "from-violet-500 to-purple-700",
  },
  {
    id: 7,
    title: "Réactions chimiques – Équilibrage",
    category: "Sciences",
    difficulty: "Débutant",
    type: "QCM",
    questions: 10,
    duration: "12 min",
    xp: 90,
    done: false,
    score: null,
    icon: "🧪",
    color: "from-teal-400 to-cyan-600",
  },
  {
    id: 8,
    title: "Analyse de texte littéraire",
    category: "Français",
    difficulty: "Avancé",
    type: "Rédaction",
    questions: 4,
    duration: "30 min",
    xp: 180,
    done: false,
    score: null,
    icon: "📖",
    color: "from-pink-400 to-rose-500",
  },
];

const diffColor: Record<string, string> = {
  Débutant: "bg-green-100 text-green-700",
  Intermédiaire: "bg-yellow-100 text-yellow-700",
  Avancé: "bg-red-100 text-red-700",
};

const typeColor: Record<string, string> = {
  QCM: "bg-indigo-100 text-indigo-700",
  Rédaction: "bg-pink-100 text-pink-700",
  "Vrai / Faux": "bg-orange-100 text-orange-700",
  Complétion: "bg-sky-100 text-sky-700",
  Calcul: "bg-violet-100 text-violet-700",
};

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/courses", label: "Mes cours", icon: "📚" },
  { href: "/exercises", label: "Exercices", icon: "✏️", active: true },
  { href: "#", label: "Résultats", icon: "📊" },
  { href: "#", label: "Messages", icon: "💬" },
  { href: "#", label: "Paramètres", icon: "⚙️" },
];

export default function ExercisesPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [activeDifficulty, setActiveDifficulty] = useState("Tous les niveaux");
  const [search, setSearch] = useState("");
  const [activeExercise, setActiveExercise] = useState<(typeof exercises)[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const filtered = exercises.filter((e) => {
    const matchCat = activeCategory === "Tous" || e.category === activeCategory;
    const matchDiff = activeDifficulty === "Tous les niveaux" || e.difficulty === activeDifficulty;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchSearch;
  });

  const done = exercises.filter((e) => e.done).length;
  const pending = exercises.filter((e) => !e.done).length;
  const avgScore = Math.round(
    exercises.filter((e) => e.done && e.score !== null).reduce((a, e) => a + (e.score ?? 0), 0) /
      exercises.filter((e) => e.done).length
  );

  // Mini quiz mock
  const mockQuestions = [
    { q: "Quelle est la formule du discriminant ?", choices: ["b² - 4ac", "b² + 4ac", "-b / 2a", "4ac - b²"], correct: 0 },
    { q: "Combien de racines réelles si Δ > 0 ?", choices: ["0", "1", "2", "Infini"], correct: 2 },
    { q: "Si Δ = 0, la racine est :", choices: ["-b/a", "-b/2a", "b/2a", "b/a"], correct: 1 },
  ];

  const startExercise = (ex: (typeof exercises)[0]) => {
    setActiveExercise(ex);
    setCurrentQuestion(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === mockQuestions[currentQuestion].correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= mockQuestions.length) {
      setFinished(true);
    } else {
      setCurrentQuestion((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (activeExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
          <div className="px-6 py-5 border-b border-gray-100">
            <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map(({ href, label, icon, active }) => (
              <Link key={label} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">F</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
                <p className="text-xs text-gray-400 truncate">Étudiante</p>
              </div>
            </Link>
          </div>
        </aside>

        <div className="ml-64 flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            {/* Header quiz */}
            <div className={`bg-gradient-to-r ${activeExercise.color} rounded-2xl p-6 mb-6 text-white`}>
              <button onClick={() => setActiveExercise(null)} className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1">
                ← Retour aux exercices
              </button>
              <h2 className="text-xl font-extrabold">{activeExercise.icon} {activeExercise.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                <span>{activeExercise.type}</span>
                <span>·</span>
                <span>{activeExercise.duration}</span>
                <span>·</span>
                <span>+{activeExercise.xp} XP</span>
              </div>
            </div>

            {finished ? (
              /* Résultat final */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">{score === mockQuestions.length ? "🎉" : score >= mockQuestions.length / 2 ? "👍" : "💪"}</div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Exercice terminé !</h3>
                <p className="text-gray-500 text-sm mb-6">Vous avez obtenu</p>
                <div className="text-5xl font-extrabold text-indigo-600 mb-2">{Math.round((score / mockQuestions.length) * 100)}%</div>
                <p className="text-sm text-gray-400 mb-8">{score} / {mockQuestions.length} bonnes réponses · +{activeExercise.xp} XP</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => startExercise(activeExercise)} className="px-6 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl transition-colors">
                    Recommencer
                  </button>
                  <button onClick={() => setActiveExercise(null)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Retour aux exercices
                  </button>
                </div>
              </div>
            ) : (
              /* Question */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Progression */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400 font-medium">Question {currentQuestion + 1} / {mockQuestions.length}</span>
                  <span className="text-xs text-indigo-600 font-semibold">{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentQuestion) / mockQuestions.length) * 100}%` }} />
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-6">{mockQuestions[currentQuestion].q}</h3>

                <div className="space-y-3 mb-6">
                  {mockQuestions[currentQuestion].choices.map((choice, idx) => {
                    const isCorrect = idx === mockQuestions[currentQuestion].correct;
                    const isSelected = idx === selected;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          !answered
                            ? "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700"
                            : isCorrect
                            ? "border-green-400 bg-green-50 text-green-700"
                            : isSelected
                            ? "border-red-400 bg-red-50 text-red-600"
                            : "border-gray-100 text-gray-400"
                        }`}
                      >
                        <span className="mr-3 inline-flex w-6 h-6 rounded-full border border-current items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {choice}
                        {answered && isCorrect && <span className="float-right">✅</span>}
                        {answered && isSelected && !isCorrect && <span className="float-right">❌</span>}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <button onClick={nextQuestion} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    {currentQuestion + 1 >= mockQuestions.length ? "Voir les résultats →" : "Question suivante →"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon, active }) => (
            <Link key={label} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
            <p className="text-sm text-gray-500 mt-1">{exercises.length} exercices disponibles</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total", value: exercises.length, icon: "📋", sub: "exercices" },
            { label: "Complétés", value: done, icon: "✅", sub: "exercices" },
            { label: "À faire", value: pending, icon: "⏳", sub: "exercices" },
            { label: "Score moyen", value: `${avgScore}%`, icon: "🎯", sub: "sur les quiz" },
          ].map(({ label, value, icon, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-3xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label} · {sub}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un exercice…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>
            <select
              value={activeDifficulty}
              onChange={(e) => setActiveDifficulty(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {difficulties.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === cat ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Liste exercices */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Aucun exercice trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((ex) => (
              <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Bandeau */}
                <div className={`bg-gradient-to-r ${ex.color} h-20 flex items-center px-5 gap-4`}>
                  <span className="text-4xl">{ex.icon}</span>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[ex.type]} bg-white/90`}>{ex.type}</span>
                  </div>
                  {ex.done && (
                    <div className="ml-auto w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                      <span className="text-lg">✅</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{ex.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor[ex.difficulty]}`}>{ex.difficulty}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug">{ex.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>❓ {ex.questions} questions</span>
                    <span>🕐 {ex.duration}</span>
                    <span className="text-yellow-500 font-semibold">+{ex.xp} XP</span>
                  </div>

                  {ex.done && ex.score !== null ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Dernier score</span>
                        <span className={`text-xs font-bold ${ex.score >= 80 ? "text-green-600" : ex.score >= 50 ? "text-yellow-600" : "text-red-500"}`}>{ex.score}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${ex.score >= 80 ? "bg-green-500" : ex.score >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ width: `${ex.score}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={() => startExercise(ex)}
                    className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      ex.done
                        ? "border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    }`}
                  >
                    {ex.done ? "Recommencer" : "Commencer l'exercice →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
