"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  COMPETITION_QUESTIONS,
  type CompQuestion,
} from "@/lib/data/competition-questions";

// ── Constants ─────────────────────────────────────────────────────────────────
const QUESTION_TIME = 30; // seconds per question
const REPLIQUE_TIME = 15; // seconds for right of reply
const POINTS_FAST   = 3;  // answered in first half of timer
const POINTS_SLOW   = 2;  // answered in second half
const POINTS_REPLIQUE = 1; // opponent scores on réplique

const SUBJECTS = ["Toutes", "Histoire", "Géographie", "Mathématiques", "Français", "Sciences"];

// ── Types ─────────────────────────────────────────────────────────────────────
type GamePhase =
  | "setup"       // player name entry
  | "countdown"   // 3-2-1 GO!
  | "question"    // main question phase
  | "replique"    // opponent gets to answer
  | "feedback"    // show correct answer + explanation
  | "finished";   // game over screen

type Player = { name: string; score: number; streak: number; correct: number; repliques: number };

type AssocSlot = { left: string; right: string; matched: boolean };

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSlots(pairs: [string, string][]): { lefts: string[]; rights: string[] } {
  return {
    lefts:  pairs.map(([l]) => l),
    rights: shuffle(pairs.map(([, r]) => r)),
  };
}

function typeBadge(type: CompQuestion["type"]) {
  const cfg: Record<string, { label: string; bg: string }> = {
    qcm:           { label: "QCM",          bg: "bg-indigo-100 text-indigo-700"  },
    vrai_faux:     { label: "Vrai / Faux",  bg: "bg-violet-100 text-violet-700"  },
    association:   { label: "Association",  bg: "bg-emerald-100 text-emerald-700" },
    identification:{ label: "Qui suis-je ?", bg: "bg-amber-100 text-amber-700"   },
  };
  const c = cfg[type];
  return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.bg}`}>{c.label}</span>;
}

// ── Timer ring SVG ────────────────────────────────────────────────────────────
function TimerRing({ seconds, max, danger }: { seconds: number; max: number; danger: boolean }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, seconds / max);
  const color = seconds <= 5 ? "#ef4444" : seconds <= max / 2 ? "#f59e0b" : "#10b981";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span className={`relative text-2xl font-black tabular-nums transition-colors ${danger ? "text-red-500 animate-pulse" : "text-gray-800"}`}>{seconds}</span>
    </div>
  );
}

// ── Score panel ───────────────────────────────────────────────────────────────
function ScorePanel({ p1, p2, active }: { p1: Player; p2: Player; active: 0 | 1 }) {
  const renderSide = (p: Player, idx: number) => {
    const isActive = active === idx;
    const colors = idx === 0
      ? { ring: "ring-indigo-400", bg: "from-indigo-500 to-indigo-700", text: "text-indigo-700", bar: "bg-indigo-400" }
      : { ring: "ring-rose-400",   bg: "from-rose-500 to-rose-700",     text: "text-rose-700",   bar: "bg-rose-400"   };
    return (
      <div className={`flex-1 rounded-2xl p-2 sm:p-4 border-2 transition-all duration-300 ${isActive ? `ring-4 ${colors.ring} border-transparent scale-105 shadow-xl` : "border-gray-100 shadow-sm"} bg-white`}>
        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-xl sm:text-2xl font-black mb-1.5 mx-auto`}>
          {p.name[0]?.toUpperCase()}
        </div>
        <p className="font-black text-center text-gray-900 truncate text-xs sm:text-sm">{p.name}</p>
        {isActive && <div className="flex justify-center mt-1 mb-1 sm:mb-2"><span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-full">⚡ Actif</span></div>}
        <p className={`text-3xl sm:text-4xl font-black text-center ${colors.text} my-0.5 sm:my-1`}>{p.score}</p>
        <p className="text-xs text-center text-gray-500 font-semibold">pts</p>
        <div className="mt-2 space-y-0.5 text-xs text-gray-500 hidden sm:block">
          <div className="flex justify-between"><span>✅ Correctes</span><strong>{p.correct}</strong></div>
          <div className="flex justify-between"><span>🔄 Répliques</span><strong>{p.repliques}</strong></div>
          {p.streak >= 2 && <div className="text-center text-orange-600 font-bold">🔥 ×{p.streak}</div>}
        </div>
        <div className="mt-1 sm:hidden">
          {p.streak >= 2 && <p className="text-center text-orange-600 font-bold text-xs">🔥{p.streak}</p>}
        </div>
      </div>
    );
  };
  return (
    <div className="flex gap-1.5 sm:gap-4">
      {renderSide(p1, 0)}
      <div className="flex items-center justify-center w-6 sm:w-8 flex-shrink-0">
        <span className="text-base sm:text-2xl font-black text-gray-400">VS</span>
      </div>
      {renderSide(p2, 1)}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CompetitionPage() {
  // Setup state
  const [names, setNames]           = useState(["", ""]);
  const [subjectFilter, setFilter]  = useState("Toutes");
  const [questionCount, setCount]   = useState(10);
  const [error, setError]           = useState("");

  // Game state
  const [phase, setPhase]           = useState<GamePhase>("setup");
  const [countdown, setCountdown]   = useState(3);
  const [questions, setQuestions]   = useState<CompQuestion[]>([]);
  const [qIndex, setQIndex]         = useState(0);
  const [active, setActive]         = useState<0 | 1>(0);  // whose turn
  const [players, setPlayers]       = useState<[Player, Player]>([
    { name: "", score: 0, streak: 0, correct: 0, repliques: 0 },
    { name: "", score: 0, streak: 0, correct: 0, repliques: 0 },
  ]);
  const [timeLeft, setTimeLeft]     = useState(QUESTION_TIME);
  const [isReplique, setIsReplique] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [hintsShown, setHintsShown] = useState(1);
  const [textInput, setTextInput]   = useState("");

  // Association state
  const [assocLefts, setAssocLefts]   = useState<string[]>([]);
  const [assocRights, setAssocRights] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft]  = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs]  = useState<Map<string, string>>(new Map());
  const [wrongPair, setWrongPair]        = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(QUESTION_TIME);

  // ── Timer ───────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback((seconds: number, onEnd: () => void) => {
    clearTimer();
    setTimeLeft(seconds);
    startTimeRef.current = seconds;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearTimer(); onEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Countdown ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("question"); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // ── Question timer ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "question") return;
    const q = questions[qIndex];
    if (!q) return;

    if (q.type === "association") return; // association doesn't time out the same way

    const max = isReplique ? REPLIQUE_TIME : QUESTION_TIME;
    startTimer(max, () => {
      // Timed out — no answer
      if (isReplique) {
        // Both failed → no points, move on
        advanceQuestion(false, false);
      } else if (q.replique) {
        triggerReplique();
      } else {
        advanceQuestion(false, false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, isReplique]);

  // ── Start game ──────────────────────────────────────────
  const startGame = () => {
    if (!names[0].trim() || !names[1].trim()) { setError("Entrez les deux prénoms des joueurs !"); return; }
    if (names[0].trim().toLowerCase() === names[1].trim().toLowerCase()) { setError("Les deux joueurs doivent avoir des prénoms différents !"); return; }
    setError("");

    let pool = COMPETITION_QUESTIONS;
    if (subjectFilter !== "Toutes") pool = pool.filter((q) => q.subject === subjectFilter);
    if (pool.length === 0) { setError("Aucune question dans cette matière. Choisissez une autre."); return; }

    const picked = shuffle(pool).slice(0, Math.min(questionCount, pool.length));

    setPlayers([
      { name: names[0].trim(), score: 0, streak: 0, correct: 0, repliques: 0 },
      { name: names[1].trim(), score: 0, streak: 0, correct: 0, repliques: 0 },
    ]);
    setQuestions(picked);
    setQIndex(0);
    setActive(0);
    setIsReplique(false);
    setLastCorrect(null);
    setCountdown(3);
    setPhase("countdown");
    initQuestion(picked[0]);
  };

  const initQuestion = (q: CompQuestion) => {
    setHintsShown(1);
    setTextInput("");
    setSelectedLeft(null);
    setMatchedPairs(new Map());
    setWrongPair(null);
    if (q.type === "association" && q.pairs) {
      const { lefts, rights } = buildSlots(q.pairs);
      setAssocLefts(lefts);
      setAssocRights(rights);
    }
  };

  // ── Trigger réplique ────────────────────────────────────
  const triggerReplique = useCallback(() => {
    clearTimer();
    setIsReplique(true);
    setActive((a) => (a === 0 ? 1 : 0) as 0 | 1);
    setPhase("question");
  }, [clearTimer]);

  // ── Advance to next question ────────────────────────────
  const advanceQuestion = useCallback((correct: boolean, wasReplique: boolean) => {
    clearTimer();
    setLastCorrect(correct);
    setPhase("feedback");
  }, [clearTimer]);

  // ── Score + next question ────────────────────────────────
  const handleAnswer = useCallback((correct: boolean) => {
    const max = isReplique ? REPLIQUE_TIME : QUESTION_TIME;
    const fast = timeLeft > max / 2;
    const pts = correct ? (isReplique ? POINTS_REPLIQUE : fast ? POINTS_FAST : POINTS_SLOW) : 0;

    const q = questions[qIndex];

    setPlayers((prev) => {
      const next: [Player, Player] = [{ ...prev[0] }, { ...prev[1] }];
      if (correct) {
        next[active].score  += pts;
        next[active].correct += 1;
        next[active].streak += 1;
        // Streak bonus: every 3 in a row → extra point
        if (next[active].streak % 3 === 0) next[active].score += 1;
        if (isReplique) next[active].repliques += 1;
      } else {
        next[active].streak = 0;
        // Wrong on main turn → try réplique if available
        if (!isReplique && q?.replique) {
          return prev; // Don't update yet, wait for réplique phase
        }
      }
      return next;
    });

    if (!correct && !isReplique && q?.replique) {
      triggerReplique();
    } else {
      advanceQuestion(correct, isReplique);
    }
  }, [active, isReplique, timeLeft, questions, qIndex, triggerReplique, advanceQuestion]);

  // ── Next question ────────────────────────────────────────
  const nextQuestion = () => {
    const next = qIndex + 1;
    if (next >= questions.length) {
      setPhase("finished");
      return;
    }
    setQIndex(next);
    setActive((a) => (a === 0 ? 1 : 0) as 0 | 1); // alternate turns
    setIsReplique(false);
    setLastCorrect(null);
    initQuestion(questions[next]);
    setPhase("question");
  };

  // ── Association logic ────────────────────────────────────
  const handleAssocLeft = (left: string) => {
    if (matchedPairs.has(left)) return;
    setSelectedLeft(left);
  };

  const handleAssocRight = (right: string) => {
    if (!selectedLeft) return;
    const q = questions[qIndex];
    if (!q.pairs) return;

    const correct = q.pairs.find(([l]) => l === selectedLeft)?.[1] === right;
    if (correct) {
      setMatchedPairs((m) => new Map(m).set(selectedLeft, right));
      setSelectedLeft(null);
      setWrongPair(null);
      // Check if all matched
      if (matchedPairs.size + 1 === q.pairs.length) {
        setTimeout(() => handleAnswer(true), 600);
      }
    } else {
      setWrongPair(`${selectedLeft}→${right}`);
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null); }, 800);
    }
  };

  // ── Identification hint reveal ───────────────────────────
  const showNextHint = () => {
    const q = questions[qIndex];
    if (!q.hints) return;
    setHintsShown((h) => Math.min(h + 1, q.hints!.length));
  };

  // ── Text answer submit ───────────────────────────────────
  const submitText = () => {
    const q = questions[qIndex];
    if (!q.answer_text) return;
    const ok = textInput.trim().toLowerCase() === q.answer_text.toLowerCase();
    handleAnswer(ok);
  };

  const q = questions[qIndex];
  const danger = timeLeft <= 5;

  // ─────────────────────────────────────────────────────────
  // RENDER: Setup screen
  // ─────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <Link href="/quiz" className="text-sm font-semibold text-indigo-200 hover:text-white transition-colors">← Quiz solo</Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Title */}
            <div className="text-center mb-6 sm:mb-10">
              <div className="text-5xl sm:text-6xl mb-3">🏆</div>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">Mode Compétition</h1>
              <p className="text-indigo-200 text-base sm:text-lg">Génie en Herbe — Duel en temps réel !</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-3xl p-4 sm:p-8 border border-white/20 space-y-6 sm:space-y-8">
              {/* Player names */}
              <div>
                <h2 className="text-white font-black text-base sm:text-lg mb-4 flex items-center gap-2">👤 Noms des joueurs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[0, 1].map((i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 uppercase tracking-wide">
                        {i === 0 ? "🔵 Joueur 1" : "🔴 Joueur 2"}
                      </label>
                      <input
                        type="text"
                        placeholder={i === 0 ? "Ex: Aminata" : "Ex: Moussa"}
                        value={names[i]}
                        onChange={(e) => setNames((n) => { const c = [...n]; c[i] = e.target.value; return c; })}
                        onKeyDown={(e) => e.key === "Enter" && startGame()}
                        className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-300 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/30 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wide">📚 Matière</label>
                  <select value={subjectFilter} onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">
                    {SUBJECTS.map((s) => <option key={s} value={s} className="text-gray-900">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wide">🎯 Nombre de questions</label>
                  <select value={questionCount} onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition">
                    {[5, 10, 15, 20].map((n) => <option key={n} value={n} className="text-gray-900">{n} questions</option>)}
                  </select>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-white/10 rounded-2xl p-4 space-y-2">
                <p className="text-white font-bold text-sm mb-2">📋 Règles du duel :</p>
                {[
                  `⏱️ ${QUESTION_TIME}s pour répondre à chaque question`,
                  `🔄 Droit de réplique : si le joueur actif se trompe, l'adversaire peut répondre (${REPLIQUE_TIME}s, ${POINTS_REPLIQUE} pt)`,
                  `⚡ Répondre vite rapporte ${POINTS_FAST} pts, lentement ${POINTS_SLOW} pt`,
                  "🔥 Séries de bonnes réponses donnent un point bonus tous les 3",
                  "🏆 Le joueur avec le plus de points gagne !",
                ].map((rule, i) => (
                  <p key={i} className="text-indigo-200 text-xs">{rule}</p>
                ))}
              </div>

              {error && <p className="text-red-300 font-bold text-sm text-center">{error}</p>}

              <button onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black text-xl py-4 rounded-2xl shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:scale-105 active:scale-95">
                🎮 Lancer le duel !
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER: Countdown 3-2-1
  // ─────────────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-indigo-200 text-2xl font-bold mb-4">Prêts ?</p>
          <div className="text-[10rem] font-black text-white leading-none animate-pulse">
            {countdown > 0 ? countdown : "GO !"}
          </div>
          <p className="text-indigo-200 mt-4 font-semibold">
            {players[0].name} <span className="text-white font-black">VS</span> {players[1].name}
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER: Finished
  // ─────────────────────────────────────────────────────────
  if (phase === "finished") {
    const [p1, p2] = players;
    const tie = p1.score === p2.score;
    const winner = tie ? null : p1.score > p2.score ? p1 : p2;
    const loser  = tie ? null : p1.score > p2.score ? p2 : p1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-8">
          {/* Fireworks emoji banner */}
          <div className="text-5xl space-x-3">🎉🏆🎊</div>

          {tie ? (
            <>
              <h1 className="text-4xl font-black text-white">Égalité !</h1>
              <p className="text-indigo-200 text-lg">Excellente partie ! Vous êtes à égalité avec {p1.score} points chacun.</p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-black text-yellow-300">{winner!.name}</h1>
              <p className="text-white text-2xl font-bold">remporte le duel !</p>
              <p className="text-indigo-200">{winner!.score} pts contre {loser!.score} pts</p>
            </>
          )}

          {/* Scoreboard */}
          <div className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <p className="text-white font-black mb-4 text-lg">Tableau final</p>
            <div className="grid grid-cols-2 gap-4">
              {players.map((p, i) => (
                <div key={i} className={`rounded-2xl p-4 ${winner?.name === p.name ? "bg-yellow-400/20 border-2 border-yellow-400" : "bg-white/10"}`}>
                  <p className="font-black text-white text-lg">{p.name}</p>
                  {winner?.name === p.name && <p className="text-yellow-300 text-xs font-bold mb-1">🏆 Vainqueur</p>}
                  <p className="text-4xl font-black text-white mt-1">{p.score}</p>
                  <p className="text-indigo-200 text-xs font-semibold">points</p>
                  <div className="mt-3 space-y-0.5 text-xs text-indigo-200">
                    <p>✅ {p.correct} bonnes réponses</p>
                    <p>🔄 {p.repliques} répliques réussies</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={startGame}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black py-3 rounded-2xl hover:scale-105 transition-transform">
              🔄 Rejouer !
            </button>
            <button onClick={() => { setPhase("setup"); }}
              className="flex-1 bg-white/20 text-white font-bold py-3 rounded-2xl hover:bg-white/30 transition-colors">
              ⚙️ Modifier
            </button>
          </div>
          <Link href="/" className="block text-indigo-300 hover:text-white text-sm font-semibold transition-colors">← Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER: Question / Réplique / Feedback
  // ─────────────────────────────────────────────────────────
  if (!q) return null;
  const currentPlayer = players[active];
  const otherPlayer   = players[active === 0 ? 1 : 0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="text-lg font-black text-white">NEKH XËL</Link>
        <div className="text-sm text-indigo-200 font-semibold">
          Question {qIndex + 1}/{questions.length}
        </div>
        <div className="text-xs text-indigo-300 font-semibold">{q.subject} {q.subjectIcon}</div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-5xl mx-auto w-full">
        {/* Score panel (left on desktop, top on mobile) */}
        <div className="lg:w-64 shrink-0">
          <ScorePanel p1={players[0]} p2={players[1]} active={active} />
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Réplique banner */}
          {isReplique && phase !== "feedback" && (
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="text-yellow-200 font-black text-sm">Droit de réplique !</p>
                <p className="text-yellow-300 text-xs">
                  {otherPlayer.name} s'est trompé{otherPlayer.name.endsWith("a") || otherPlayer.name.endsWith("ou") ? "e" : ""}.
                  À toi de jouer, <strong>{currentPlayer.name}</strong> !
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-yellow-300 font-black">+{POINTS_REPLIQUE} pt si correct</span>
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {phase === "feedback" && (
            <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${lastCorrect ? "bg-emerald-400/20 border border-emerald-400/50" : "bg-red-400/20 border border-red-400/50"}`}>
              <span className="text-2xl">{lastCorrect ? "🎉" : "❌"}</span>
              <div className="flex-1">
                <p className={`font-black text-sm ${lastCorrect ? "text-emerald-200" : "text-red-200"}`}>
                  {lastCorrect ? `Bravo ${currentPlayer.name} !` : "Pas tout à fait..."}
                </p>
                {q.type !== "association" && (
                  <p className="text-white/80 text-xs mt-0.5">
                    {q.type === "qcm" && q.choices && <><strong>Réponse :</strong> {q.choices[q.answer_index!]}</>}
                    {q.type === "vrai_faux" && <><strong>Réponse :</strong> {q.answer_bool ? "VRAI" : "FAUX"}</>}
                    {q.type === "identification" && <><strong>Réponse :</strong> {q.answer_text}</>}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-1 line-clamp-2">{q.explanation}</p>
              </div>
              <button onClick={nextQuestion}
                className="shrink-0 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors">
                {qIndex + 1 >= questions.length ? "Résultats →" : "Suivant →"}
              </button>
            </div>
          )}

          {/* Question card */}
          <div className="bg-white/10 backdrop-blur rounded-3xl border border-white/20 flex-1 flex flex-col p-6">
            {/* Question header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {typeBadge(q.type)}
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    q.difficulty === "facile" ? "bg-emerald-100 text-emerald-700" :
                    q.difficulty === "moyen"  ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>{q.difficulty}</span>
                </div>
                <p className="text-white font-bold text-lg leading-relaxed">{q.enonce}</p>
              </div>
              {/* Timer — not shown in feedback or association */}
              {phase !== "feedback" && q.type !== "association" && (
                <div className="shrink-0">
                  <TimerRing
                    seconds={timeLeft}
                    max={isReplique ? REPLIQUE_TIME : QUESTION_TIME}
                    danger={danger}
                  />
                </div>
              )}
            </div>

            {/* ── QCM choices ── */}
            {q.type === "qcm" && q.choices && phase !== "feedback" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                {q.choices.map((choice, i) => {
                  const letters = ["A", "B", "C", "D"];
                  return (
                    <button key={i} onClick={() => handleAnswer(i === q.answer_index)}
                      className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 hover:border-white/50 transition-all duration-150 text-left group active:scale-95">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white font-black text-sm">{letters[i]}</span>
                      <span className="text-white text-sm font-semibold leading-snug pt-1">{choice}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Vrai/Faux ── */}
            {q.type === "vrai_faux" && phase !== "feedback" && (
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button onClick={() => handleAnswer(q.answer_bool === true)}
                  className="flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/40 border-2 border-emerald-400/40 hover:border-emerald-400 text-white font-black text-xl transition-all duration-150 hover:scale-105 active:scale-95">
                  <span className="text-4xl">✅</span> VRAI
                </button>
                <button onClick={() => handleAnswer(q.answer_bool === false)}
                  className="flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-red-500/20 hover:bg-red-500/40 border-2 border-red-400/40 hover:border-red-400 text-white font-black text-xl transition-all duration-150 hover:scale-105 active:scale-95">
                  <span className="text-4xl">❌</span> FAUX
                </button>
              </div>
            )}

            {/* ── Association / Matching ── */}
            {q.type === "association" && q.pairs && phase !== "feedback" && (
              <div className="flex-1 flex flex-col">
                <p className="text-indigo-200 text-xs mb-4 font-semibold">
                  Clique sur un élément à gauche puis sur son correspondant à droite.
                  {q.type === "association" && (
                    <span className="ml-2 text-yellow-300">⏱️ Pas de limite de temps sur ce type !</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {/* Left column */}
                  <div className="space-y-2">
                    {assocLefts.map((left) => {
                      const isMatched = matchedPairs.has(left);
                      const isSelected = selectedLeft === left;
                      return (
                        <button key={left}
                          onClick={() => !isMatched && handleAssocLeft(left)}
                          disabled={isMatched}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                            isMatched   ? "bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 cursor-default" :
                            isSelected  ? "bg-yellow-400/30 border-2 border-yellow-400 text-yellow-100 scale-105 shadow-lg" :
                            "bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                          }`}>
                          {isMatched && "✅ "}{left}
                        </button>
                      );
                    })}
                  </div>
                  {/* Right column */}
                  <div className="space-y-2">
                    {assocRights.map((right) => {
                      const isMatched = [...matchedPairs.values()].includes(right);
                      const isWrong   = wrongPair?.endsWith(`→${right}`) && selectedLeft !== null;
                      return (
                        <button key={right}
                          onClick={() => !isMatched && handleAssocRight(right)}
                          disabled={isMatched}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                            isMatched ? "bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 cursor-default" :
                            isWrong   ? "bg-red-500/40 border-2 border-red-400 text-red-200 animate-pulse" :
                            selectedLeft ? "bg-white/15 border-2 border-indigo-400/60 text-white hover:bg-indigo-400/30 hover:border-indigo-300" :
                            "bg-white/10 border-2 border-white/20 text-white opacity-60 cursor-default"
                          }`}>
                          {isMatched && "✅ "}{right}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-center text-indigo-300 text-xs mt-3 font-semibold">
                  {matchedPairs.size}/{q.pairs.length} paires trouvées
                </p>
              </div>
            )}

            {/* ── Association feedback ── */}
            {q.type === "association" && phase === "feedback" && q.pairs && (
              <div className="flex-1 space-y-2">
                {q.pairs.map(([left, right]) => (
                  <div key={left} className="flex items-center gap-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl px-4 py-2.5 text-sm text-emerald-100 font-semibold">
                    <span>{left}</span>
                    <span className="text-emerald-400 font-black">→</span>
                    <span>{right}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Identification / Qui suis-je ? ── */}
            {q.type === "identification" && q.hints && phase !== "feedback" && (
              <div className="flex-1 flex flex-col gap-4">
                {/* Progressive hints */}
                <div className="space-y-2">
                  {q.hints.slice(0, hintsShown).map((hint, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${i === 0 ? "bg-indigo-500/20 border-indigo-400/40" : i === 1 ? "bg-violet-500/20 border-violet-400/40" : "bg-amber-500/20 border-amber-400/40"}`}>
                      <span className="text-lg shrink-0">{["💡", "🔍", "🎯"][i]}</span>
                      <p className="text-white text-sm font-semibold leading-relaxed">{hint}</p>
                    </div>
                  ))}
                </div>
                {hintsShown < q.hints.length && (
                  <button onClick={showNextHint}
                    className="self-start flex items-center gap-2 text-xs font-bold text-indigo-200 hover:text-yellow-300 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                    <span>💡</span> Afficher l'indice suivant
                  </button>
                )}
                {/* Text input */}
                <div className="mt-auto flex gap-3">
                  <input
                    type="text"
                    placeholder="Ta réponse..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && textInput.trim() && submitText()}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-300 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  />
                  <button onClick={submitText} disabled={!textInput.trim()}
                    className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-gray-900 font-black rounded-xl transition-all hover:scale-105 active:scale-95">
                    Valider
                  </button>
                </div>
                <div className="flex justify-center">
                  <TimerRing seconds={timeLeft} max={isReplique ? REPLIQUE_TIME : QUESTION_TIME} danger={danger} />
                </div>
              </div>
            )}

            {/* Identification feedback */}
            {q.type === "identification" && phase === "feedback" && q.hints && (
              <div className="space-y-2 mt-2">
                {q.hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-white/10 border border-white/20">
                    <span className="text-lg shrink-0">{["💡", "🔍", "🎯"][i]}</span>
                    <p className="text-white/80 text-sm">{hint}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Réplique question (shown during feedback, before next) */}
          {phase === "feedback" && isReplique && q.replique && (
            <div className="bg-violet-400/10 border border-violet-400/30 rounded-2xl px-4 py-3 text-xs text-violet-200">
              <strong>Question de réplique :</strong> {q.replique}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
