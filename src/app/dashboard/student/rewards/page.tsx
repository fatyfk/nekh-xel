"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
  loadState, BADGES, buildLeaderboard, computeLevel, xpForNextLevel,
  getStreakMessage, type GamificationState, type WeeklyEntry,
} from "@/lib/gamification";

// ── Nav ───────────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/dashboard/student",          label: "Accueil",    icon: "🏠"  },
  { href: "/quiz",                        label: "Quiz",       icon: "📝"  },
  { href: "/competition",                 label: "Compétition",icon: "🏆"  },
  { href: "/dashboard/student/rewards",   label: "Récompenses",icon: "⭐", active: true },
  { href: "/quiz/history",                label: "Historique", icon: "📊"  },
  { href: "/settings",                    label: "Paramètres", icon: "⚙️"  },
];

// ── Streak flame component ────────────────────────────────────────────────────
function StreakFlame({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <div className={`relative flex items-center justify-center w-20 h-20 ${active ? "animate-pulse" : ""}`}
      style={{ filter: active ? `drop-shadow(0 0 ${Math.min(streak * 2, 24)}px #f97316)` : "none" }}>
      <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
        {/* Outer flame */}
        <path d="M50 10 C30 30 10 50 15 75 C18 90 30 110 50 110 C70 110 82 90 85 75 C90 50 70 30 50 10Z"
          fill={active ? "url(#flameGrad)" : "#d1d5db"} />
        {/* Inner highlight */}
        <path d="M50 45 C40 57 35 68 38 80 C40 88 45 96 50 96 C55 96 60 88 62 80 C65 68 60 57 50 45Z"
          fill={active ? "#fde68a" : "#e5e7eb"} opacity="0.8" />
        <defs>
          <linearGradient id="flameGrad" x1="50" y1="10" x2="50" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute bottom-1 text-lg font-black text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
        {streak}
      </span>
    </div>
  );
}

// ── Animated XP bar ───────────────────────────────────────────────────────────
function XPBar({ xp, level }: { xp: number; level: number }) {
  const { current, next, pct } = xpForNextLevel(xp);
  const [displayed, setDisplayed] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (started.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        started.current = true;
        let v = 0;
        const step = Math.max(1, Math.ceil(pct / 40));
        const id = setInterval(() => {
          v = Math.min(v + step, pct);
          setDisplayed(v);
          if (v >= pct) clearInterval(id);
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold text-indigo-700">Niveau {level}</span>
        <span className="text-gray-500">{xp.toLocaleString("fr-FR")} / {next.toLocaleString("fr-FR")} XP</span>
        <span className="font-bold text-indigo-700">Niveau {level + 1}</span>
      </div>
      <div className="h-5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-700 relative"
          style={{ width: `${displayed}%` }}>
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700">{displayed}%</span>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">
        Encore {(next - xp).toLocaleString("fr-FR")} XP pour le niveau {level + 1}
      </p>
    </div>
  );
}

// ── Badge card ────────────────────────────────────────────────────────────────
function BadgeCard({ badge, unlocked }: { badge: typeof BADGES[number]; unlocked: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className={`relative rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer select-none
        ${unlocked
          ? "bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 shadow-md hover:shadow-lg hover:scale-105"
          : "bg-gray-50 border-2 border-gray-100 opacity-50 grayscale"
        }`}
      onClick={() => setShowTooltip((v) => !v)}
    >
      <div className={`text-4xl mb-2 ${unlocked ? "" : "grayscale"}`}>{badge.icon}</div>
      <p className={`text-xs font-black truncate ${unlocked ? "text-gray-800" : "text-gray-400"}`}>{badge.name}</p>
      {unlocked && <p className="text-xs text-indigo-600 font-semibold mt-0.5">{badge.nameWo}</p>}
      {unlocked && (
        <span className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
          +{badge.xpReward}
        </span>
      )}
      {!unlocked && <div className="absolute inset-0 flex items-end justify-center pb-2"><span className="text-xs text-gray-400">🔒</span></div>}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl text-left">
          <p className="font-bold mb-1">{badge.name} — {badge.nameWo}</p>
          <p className="text-gray-300">{badge.description}</p>
          <p className="text-gray-400 italic mt-1">{badge.descWo}</p>
          {!unlocked && <p className="text-amber-400 mt-1 font-semibold">Pas encore débloqué</p>}
        </div>
      )}
    </div>
  );
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
function LeaderRow({ entry, rank }: { entry: WeeklyEntry; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${entry.isCurrentUser ? "bg-indigo-50 border-2 border-indigo-200" : "hover:bg-gray-50"}`}>
      <div className="w-7 text-center">
        {medal ? <span className="text-xl">{medal}</span> : <span className="text-sm font-black text-gray-400">#{rank}</span>}
      </div>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-lg flex-shrink-0">
        {entry.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${entry.isCurrentUser ? "text-indigo-700" : "text-gray-800"}`}>
          {entry.name} {entry.isCurrentUser && <span className="text-xs font-normal text-indigo-400">(toi)</span>}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
            style={{ width: `${Math.min(100, (entry.xp / 1500) * 100)}%` }} />
        </div>
        <span className={`text-sm font-black tabular-nums ${entry.isCurrentUser ? "text-indigo-700" : "text-gray-700"}`}>
          {entry.xp.toLocaleString("fr-FR")} XP
        </span>
      </div>
    </div>
  );
}

// ── Streak calendar ───────────────────────────────────────────────────────────
function StreakCalendar({ weeklyXP }: { weeklyXP: { date: string; xp: number }[] }) {
  const days: { label: string; date: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = weeklyXP.find((e) => e.date === dateStr);
    const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    days.push({ label: labels[d.getDay()], date: dateStr, xp: entry?.xp ?? 0 });
  }

  const maxXP = Math.max(...days.map((d) => d.xp), 1);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex gap-2 items-end justify-between">
      {days.map((day) => {
        const pct = Math.max(8, (day.xp / maxXP) * 100);
        const isToday = day.date === today;
        const active = day.xp > 0;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${active ? "bg-gradient-to-t from-orange-400 to-yellow-300" : "bg-gray-100"} ${isToday ? "ring-2 ring-orange-400" : ""}`}
                style={{ height: `${pct}%` }}
                title={`${day.xp} XP`}
              />
            </div>
            <p className={`text-xs font-bold ${isToday ? "text-orange-600" : active ? "text-gray-700" : "text-gray-300"}`}>{day.label}</p>
            {day.xp > 0 && <p className="text-xs text-orange-500 font-semibold">{day.xp}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = "profil" | "badges" | "classement" | "streak";
type BadgeFilter = "all" | "subject" | "streak" | "score" | "milestone";

export default function RewardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab]                 = useState<Tab>("profil");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [state, setState]             = useState<GamificationState | null>(null);
  const [leaderboard, setLeaderboard] = useState<WeeklyEntry[]>([]);

  // Load from localStorage (client only)
  useEffect(() => {
    const s = loadState();
    setState(s);
    const weeklyXP = s.weeklyXP.reduce((sum, e) => sum + e.xp, 0);
    setLeaderboard(buildLeaderboard(weeklyXP, "Moi"));
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 font-semibold">Chargement…</div>
      </div>
    );
  }

  const { streak, longestStreak } = state;
  const streakMsg = getStreakMessage(streak);
  const level = computeLevel(state.xp);
  const weeklyXP = state.weeklyXP.reduce((sum, e) => sum + e.xp, 0);

  const unlockedCount = state.unlockedBadges.length;
  const totalBadges   = BADGES.length;

  const filteredBadges = badgeFilter === "all" ? BADGES : BADGES.filter((b) => b.category === badgeFilter);

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: "profil",     icon: "⭐", label: "Mon XP"      },
    { key: "badges",     icon: "🏅", label: "Badges"       },
    { key: "classement", icon: "🏆", label: "Classement"   },
    { key: "streak",     icon: "🔥", label: "Série"        },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 flex flex-col fixed h-full z-20 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-indigo-300 text-xs mt-0.5">Mes récompenses</p>
        </div>

        {/* Mini XP card */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-gray-900 font-black text-lg shadow-md">
              {level}
            </div>
            <div>
              <p className="text-sm font-black text-white">Niveau {level}</p>
              <p className="text-indigo-300 text-xs">{state.xp.toLocaleString("fr-FR")} XP total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full"
                style={{ width: `${xpForNextLevel(state.xp).pct}%` }} />
            </div>
            <span className="text-xs text-indigo-300 font-bold">{xpForNextLevel(state.xp).pct}%</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-white/20 text-white" : "text-indigo-300 hover:bg-white/10 hover:text-white"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-black text-gray-900 text-lg">Mes récompenses</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
              <span>🔥</span>
              <span className="text-sm font-black text-orange-700">{streak} jours</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              <span>⚡</span>
              <span className="text-sm font-black text-amber-700">{state.xp.toLocaleString("fr-FR")} XP</span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${tab === key ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"}`}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Mon XP ──────────────────────────────────── */}
          {tab === "profil" && (
            <div className="space-y-5">
              {/* Level hero */}
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-indigo-200 text-sm font-semibold">Niveau actuel</p>
                    <p className="text-6xl font-black">{level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-200 text-sm font-semibold">XP total</p>
                    <p className="text-3xl font-black">{state.xp.toLocaleString("fr-FR")}</p>
                    <p className="text-indigo-200 text-xs">{unlockedCount}/{totalBadges} badges</p>
                  </div>
                </div>
                <XPBar xp={state.xp} level={level} />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: "📝", label: "Quiz complétés", value: state.totalQuizzes, color: "text-indigo-700 bg-indigo-50" },
                  { icon: "🎯", label: "Scores parfaits", value: state.totalPerfect, color: "text-emerald-700 bg-emerald-50" },
                  { icon: "🔥", label: "Série actuelle", value: `${streak}j`, color: "text-orange-700 bg-orange-50" },
                  { icon: "📅", label: "XP cette semaine", value: weeklyXP, color: "text-violet-700 bg-violet-50" },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className={`rounded-2xl p-4 ${color.split(" ")[1]} border border-${color.split(" ")[1].replace("bg-", "")}`}>
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className={`text-2xl font-black ${color.split(" ")[0]}`}>{value}</p>
                    <p className={`text-xs font-semibold ${color.split(" ")[0]} opacity-70`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* XP by subject */}
              {Object.keys(state.subjectXP).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-black text-gray-900 mb-4">XP par matière</h3>
                  <div className="space-y-3">
                    {Object.entries(state.subjectXP)
                      .sort((a, b) => b[1] - a[1])
                      .map(([subj, xp]) => {
                        const max = Math.max(...Object.values(state.subjectXP));
                        const pct = Math.round((xp / max) * 100);
                        const icons: Record<string, string> = { maths: "🔢", francais: "📖", histoire: "🏛️", geo: "🌍", sciences: "🔬" };
                        return (
                          <div key={subj} className="flex items-center gap-3">
                            <span className="text-xl w-7">{icons[subj] ?? "📚"}</span>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold capitalize text-gray-700">{subj}</span>
                                <span className="text-gray-500 font-bold">{xp} XP</span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Encouragement card */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-sm font-black text-amber-800 mb-1">💬 Message du jour</p>
                <p className="text-base font-bold text-gray-900">
                  {state.xp === 0
                    ? "Commence ton premier quiz pour gagner des XP !"
                    : state.totalPerfect > 0
                    ? "Jëf ak jàmm ! Tu progresses vite — continue !"
                    : "Maa ngi dem ! Chaque quiz te rapproche de ton prochain niveau !"}
                </p>
                <p className="text-sm text-amber-700 mt-1 font-semibold italic">
                  {state.xp === 0 ? "Tàmbalee ci kanam !" : "Waaw waaw ! Ligéeyal !"}
                </p>
              </div>
            </div>
          )}

          {/* ── Tab: Badges ───────────────────────────────────── */}
          {tab === "badges" && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-5">
                <div className="text-5xl">🏅</div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{unlockedCount} <span className="text-xl text-gray-400">/ {totalBadges}</span></p>
                  <p className="text-gray-500 font-semibold">badges débloqués</p>
                  <div className="h-2 bg-gray-100 rounded-full w-48 mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all"
                      style={{ width: `${Math.round((unlockedCount / totalBadges) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {(["all", "milestone", "subject", "streak", "score"] as const).map((f) => {
                  const labels: Record<string, string> = { all: "Tous", milestone: "🚀 Jalons", subject: "📚 Matières", streak: "🔥 Séries", score: "🎯 Scores" };
                  return (
                    <button key={f} onClick={() => setBadgeFilter(f)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${badgeFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {labels[f]}
                    </button>
                  );
                })}
              </div>

              {/* Badge grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filteredBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} unlocked={state.unlockedBadges.includes(badge.id)} />
                ))}
              </div>

              {unlockedCount === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">🔒</p>
                  <p className="font-bold">Aucun badge débloqué pour l'instant</p>
                  <p className="text-sm mt-1">Complète un quiz pour débloquer ton premier badge !</p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Classement ───────────────────────────────── */}
          {tab === "classement" && (
            <div className="space-y-5">
              {/* Podium */}
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 shadow-xl">
                <p className="text-white font-black text-lg mb-4 text-center">🏆 Classement de la semaine</p>
                <div className="flex items-end justify-center gap-4">
                  {[1, 0, 2].map((rank) => {
                    const entry = leaderboard[rank];
                    if (!entry) return null;
                    const heights = ["h-20", "h-28", "h-16"];
                    const displayRank = rank + 1;
                    const podiumOrder = [2, 1, 3];
                    const podiumRank  = podiumOrder[[1, 0, 2].indexOf(rank)];
                    const medal = ["🥇", "🥈", "🥉"][[1, 0, 2].indexOf(rank)];
                    return (
                      <div key={rank} className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{entry.avatar}</span>
                        <p className="text-white text-xs font-bold text-center truncate w-16">{entry.name.split(" ")[0]}</p>
                        <div className={`${heights[[1, 0, 2].indexOf(rank)]} w-16 bg-white/20 rounded-t-xl flex items-start justify-center pt-2 border-t-2 border-white/40`}>
                          <span className="text-xl">{medal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <p className="font-black text-gray-900 text-sm">Top 10 — Cette semaine</p>
                  <span className="text-xs text-gray-400 font-semibold">XP cette semaine</span>
                </div>
                <div className="divide-y divide-gray-50 p-2 space-y-1">
                  {leaderboard.map((entry, i) => (
                    <LeaderRow key={entry.name} entry={entry} rank={i + 1} />
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-center py-8 text-gray-400 text-sm">Complète un quiz cette semaine pour apparaître ici !</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">Le classement se réinitialise chaque lundi. Les données réelles seront synchronisées avec Supabase.</p>
            </div>
          )}

          {/* ── Tab: Streak ───────────────────────────────────── */}
          {tab === "streak" && (
            <div className="space-y-5">
              {/* Flame hero */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl text-center">
                <div className="flex justify-center mb-4">
                  <StreakFlame streak={streak} />
                </div>
                <p className="text-4xl font-black">{streak} jour{streak > 1 ? "s" : ""} de suite !</p>
                <p className="text-orange-100 font-semibold mt-1">{streakMsg.fr}</p>
                <p className="text-orange-200 text-sm italic mt-0.5">{streakMsg.wo}</p>
                {longestStreak > 0 && (
                  <p className="text-orange-200 text-xs mt-3">🏆 Meilleure série : {longestStreak} jours</p>
                )}
              </div>

              {/* Weekly XP chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="font-black text-gray-900 mb-4">📅 Activité des 7 derniers jours</p>
                <StreakCalendar weeklyXP={state.weeklyXP} />
              </div>

              {/* Streak badges progress */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="font-black text-gray-900 mb-4">🎯 Objectifs de série</p>
                <div className="space-y-3">
                  {[3, 7, 14, 30].map((target) => {
                    const reached = streak >= target;
                    const pct = Math.min(100, Math.round((streak / target) * 100));
                    return (
                      <div key={target} className={`flex items-center gap-4 p-3 rounded-xl ${reached ? "bg-orange-50 border border-orange-200" : "bg-gray-50"}`}>
                        <span className="text-2xl">{reached ? "✅" : "🔒"}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={`font-bold ${reached ? "text-orange-700" : "text-gray-500"}`}>{target} jours de suite</span>
                            <span className={`font-bold ${reached ? "text-orange-700" : "text-gray-400"}`}>{streak}/{target}j</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${reached ? "bg-orange-400" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">+{[75, 150, 300, 750][[3,7,14,30].indexOf(target)]} XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wolof proverb */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
                <p className="text-sm font-black text-indigo-800 mb-2">💬 Proverbe du jour</p>
                <p className="text-base font-bold text-gray-900 italic">« Ndank ndank mooy jàpp golo ci ñaay »</p>
                <p className="text-sm text-indigo-600 mt-1">Petit à petit, on attrape le singe dans la forêt. — Proverbe wolof</p>
                <p className="text-xs text-indigo-400 mt-1">Chaque jour de travail te rapproche de ton objectif.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
