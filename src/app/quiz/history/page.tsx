"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  date: string;
  subject: string;
  subjectLabel: string;
  difficulty: "facile" | "moyen" | "difficile";
  pct: number;
  correct: number;
  total: number;
  xp: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const DIFF_COLORS = {
  facile:    "bg-emerald-100 text-emerald-700",
  moyen:     "bg-amber-100 text-amber-700",
  difficile: "bg-red-100 text-red-700",
} as const;

const DIFF_LABELS = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" } as const;

function scoreBg(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(pct: number) {
  if (pct >= 90) return "Excellent 🌟";
  if (pct >= 75) return "Très bien 👍";
  if (pct >= 60) return "Bien 👌";
  if (pct >= 50) return "Passable 😊";
  return "À revoir 💪";
}

// ─── Per-subject stats ────────────────────────────────────────────────────────

interface SubjectStat {
  id: string;
  label: string;
  quizzes: number;
  avgPct: number;
  totalXp: number;
  bestPct: number;
}

function buildSubjectStats(entries: HistoryEntry[]): SubjectStat[] {
  const map: Record<string, { label: string; pcts: number[]; xp: number }> = {};
  for (const e of entries) {
    if (!map[e.subject]) map[e.subject] = { label: e.subjectLabel, pcts: [], xp: 0 };
    map[e.subject].pcts.push(e.pct);
    map[e.subject].xp += e.xp;
  }
  return Object.entries(map)
    .map(([id, { label, pcts, xp }]) => ({
      id, label,
      quizzes: pcts.length,
      avgPct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
      bestPct: Math.max(...pcts),
      totalXp: xp,
    }))
    .sort((a, b) => b.avgPct - a.avgPct);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-6xl mb-4">📭</p>
      <h3 className="text-xl font-black text-gray-800 mb-2">Aucun quiz joué pour l'instant</h3>
      <p className="text-gray-500 mb-6">Lance ton premier quiz pour voir tes statistiques ici !</p>
      <Link href="/quiz"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
        🚀 Commencer un quiz
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [tab, setTab]           = useState<"historique" | "stats">("historique");
  const [filter, setFilter]     = useState<string>("tous");
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nekh_history");
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch (_) { /* ignore */ }
    setLoaded(true);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("nekh_history");
    setHistory([]);
    setShowClear(false);
  };

  const subjects = ["tous", ...Array.from(new Set(history.map((e) => e.subject)))];
  const filtered = filter === "tous" ? history : history.filter((e) => e.subject === filter);

  const totalXp       = history.reduce((a, e) => a + e.xp, 0);
  const totalQuizzes  = history.length;
  const avgScore      = history.length ? Math.round(history.reduce((a, e) => a + e.pct, 0) / history.length) : 0;
  const bestScore     = history.length ? Math.max(...history.map((e) => e.pct)) : 0;
  const subjectStats  = buildSubjectStats(history);

  // Streak : jours consécutifs
  const streak = (() => {
    if (!history.length) return 0;
    const days = new Set(history.map((e) => new Date(e.date).toDateString()));
    let s = 0, d = new Date();
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/quiz" className="text-indigo-200 hover:text-white text-sm font-semibold">← Retour aux quiz</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">📊 Mon historique</h1>
          <p className="text-indigo-200">Tous tes quiz et tes statistiques personnelles</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* KPI banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                ["⚡", `${totalXp}`, "XP Total",       "bg-amber-50 border-amber-200"],
                ["🎯", `${totalQuizzes}`, "Quiz joués",   "bg-indigo-50 border-indigo-200"],
                ["📈", `${avgScore}%`,  "Score moyen",   "bg-emerald-50 border-emerald-200"],
                ["🔥", `${streak}j`,    "Série en cours","bg-rose-50 border-rose-200"],
              ].map(([icon, val, lbl, cls]) => (
                <div key={lbl} className={`rounded-2xl border p-4 text-center ${cls}`}>
                  <p className="text-2xl">{icon}</p>
                  <p className="font-black text-gray-900 text-xl">{val}</p>
                  <p className="text-gray-500 text-xs font-medium">{lbl}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {([["historique", "📋 Historique"], ["stats", "📊 Par matière"]] as const).map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${tab === t ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── Tab : Historique ── */}
            {tab === "historique" && (
              <>
                {/* Filtres matière */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
                  {subjects.map((s) => {
                    const label = s === "tous" ? "Toutes" : history.find((e) => e.subject === s)?.subjectLabel ?? s;
                    return (
                      <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === s ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {filtered.map((entry, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                      {/* Score circle */}
                      <div className={`w-14 h-14 rounded-2xl ${scoreBg(entry.pct)} flex flex-col items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-black text-lg leading-none">{entry.pct}</span>
                        <span className="text-white/70 text-xs">%</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-black text-gray-900 text-sm">{entry.subjectLabel}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[entry.difficulty]}`}>
                            {DIFF_LABELS[entry.difficulty]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {entry.correct}/{entry.total} bonnes réponses · +{entry.xp} XP · {scoreLabel(entry.pct)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(entry.date)} à {formatTime(entry.date)}
                        </p>
                      </div>
                      {/* Best badge */}
                      {entry.pct === bestScore && (
                        <span className="text-xl flex-shrink-0">🏆</span>
                      )}
                    </div>
                  ))}
                </div>

                {filtered.length === 0 && (
                  <p className="text-center text-gray-400 py-10 font-medium">Aucun quiz pour cette matière.</p>
                )}

                {/* Clear history */}
                <div className="mt-8 text-center">
                  {!showClear ? (
                    <button onClick={() => setShowClear(true)} className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors">
                      🗑 Effacer l'historique
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 inline-flex flex-col items-center gap-3">
                      <p className="text-red-700 font-bold text-sm">Confirmer la suppression de tout l'historique ?</p>
                      <div className="flex gap-3">
                        <button onClick={clearHistory} className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-700">
                          Oui, effacer
                        </button>
                        <button onClick={() => setShowClear(false)} className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-300">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Tab : Stats par matière ── */}
            {tab === "stats" && (
              <div className="space-y-4">
                {subjectStats.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-black text-gray-900">{s.label}</h3>
                        <p className="text-xs text-gray-500">{s.quizzes} quiz · +{s.totalXp} XP total</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl text-gray-900">{s.avgPct}%</p>
                        <p className="text-xs text-gray-500">score moyen</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all ${scoreBg(s.avgPct)}`} style={{ width: `${s.avgPct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Meilleur score : {s.bestPct}%</span>
                      <span>{scoreLabel(s.avgPct)}</span>
                    </div>
                  </div>
                ))}

                {/* XP total visual */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white text-center">
                  <p className="text-5xl font-black mb-1">⚡ {totalXp}</p>
                  <p className="font-bold text-white/90">XP accumulés au total</p>
                  <p className="text-white/70 text-sm mt-1">
                    {totalXp < 100 ? "Continue, tu démarres !" :
                     totalXp < 500 ? "Tu progresses bien !" :
                     totalXp < 1000 ? "Excellent travail !" : "Tu es un champion NEKH XËL ! 🏆"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA bas */}
        <div className="mt-8 text-center">
          <Link href="/quiz"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            🚀 Nouveau quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
