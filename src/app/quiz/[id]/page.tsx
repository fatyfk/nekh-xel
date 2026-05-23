"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────

type QCMQuestion = {
  type: "qcm";
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  xp: number;
};

type TrueFalseQuestion = {
  type: "trueFalse";
  id: number;
  question: string;
  answer: boolean;
  explanation: string;
  xp: number;
};

type MatchingQuestion = {
  type: "matching";
  id: number;
  question: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  xp: number;
};

type IdentificationQuestion = {
  type: "identification";
  id: number;
  question: string;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
};

type CrosswordQuestion = {
  type: "crossword";
  id: number;
  question: string;
  grid: (string | null)[][];
  words: { id: number; direction: "across" | "down"; row: number; col: number; length: number; clue: string }[];
  explanation: string;
  xp: number;
};

type Question = QCMQuestion | TrueFalseQuestion | MatchingQuestion | IdentificationQuestion | CrosswordQuestion;

// ── Données du quiz de démonstration ──────────────────────────

const DEMO_QUIZ = {
  id: "quiz-complet",
  title: "Quiz complet – Démo tous types",
  subject: "Génie en Herbe",
  icon: "🏆",
  color: "from-indigo-500 to-violet-600",
};

const QUESTIONS: Question[] = [
  {
    type: "qcm",
    id: 1,
    question: "Quel est le fleuve le plus long d'Afrique de l'Ouest qui traverse le Sénégal ?",
    options: ["Le Congo", "Le Sénégal", "Le Niger", "Le Nil"],
    answer: 1,
    explanation: "Le fleuve Sénégal prend sa source en Guinée et forme la frontière nord du pays.",
    xp: 100,
  },
  {
    type: "trueFalse",
    id: 2,
    question: "L'Empire du Mali a été fondé par Sundiata Keïta au XIIIe siècle.",
    answer: true,
    explanation: "Sundiata Keïta a fondé l'Empire du Mali en 1235 après la bataille de Kirina.",
    xp: 80,
  },
  {
    type: "matching",
    id: 3,
    question: "Associe chaque capitale à son pays :",
    pairs: [
      { left: "Dakar",       right: "Sénégal"      },
      { left: "Bamako",      right: "Mali"          },
      { left: "Conakry",     right: "Guinée"        },
      { left: "Ouagadougou", right: "Burkina Faso"  },
    ],
    explanation: "Ces capitales se trouvent toutes en Afrique de l'Ouest.",
    xp: 120,
  },
  {
    type: "identification",
    id: 4,
    question: "Qui suis-je ?",
    answer: "LÉOPOLD SÉDAR SENGHOR",
    hints: [
      "Je suis né en 1906 à Joal, au Sénégal.",
      "Je suis poète et homme d'État.",
      "J'ai co-fondé le mouvement de la Négritude avec Aimé Césaire.",
      "J'ai été le premier président du Sénégal indépendant (1960–1980).",
      "Je suis le premier Africain à avoir intégré l'Académie française.",
    ],
    explanation: "Léopold Sédar Senghor est une figure majeure de la culture et de la politique africaine du XXe siècle.",
    xp: 150,
  },
  {
    type: "crossword",
    id: 5,
    question: "Complète la grille de mots croisés sur le Sénégal :",
    grid: [
      [null, "D",  null, null, null],
      ["S",  "A",  "L",  "U",  "M"],
      [null, "K",  null, null, null],
      [null, "A",  null, null, null],
      [null, "R",  null, null, null],
    ],
    words: [
      { id: 1, direction: "across", row: 1, col: 0, length: 5, clue: "Fleuve qui donne son nom à un delta (5 lettres)" },
      { id: 2, direction: "down",   row: 0, col: 1, length: 5, clue: "Capitale du Sénégal (5 lettres)" },
    ],
    explanation: "SALOUM est un fleuve du Sénégal formant un delta. DAKAR est la capitale.",
    xp: 130,
  },
];

// ── Composant QCM ─────────────────────────────────────────────

function QCMView({
  q, onAnswer,
}: {
  q: QCMQuestion;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    onAnswer(i === q.answer, i === q.answer ? q.xp : 0);
  };

  return (
    <div className="space-y-3">
      {q.options.map((opt, i) => {
        let cls = "bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
        if (revealed) {
          if (i === q.answer) cls = "bg-emerald-50 border-emerald-400 text-emerald-800";
          else if (i === selected) cls = "bg-red-50 border-red-400 text-red-800";
          else cls = "bg-gray-50 border-gray-200 text-gray-400 cursor-default";
        }
        return (
          <button key={i} onClick={() => handleSelect(i)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left font-semibold text-sm transition-all ${cls}`}>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0
              ${revealed && i === q.answer ? "bg-emerald-500 text-white"
                : revealed && i === selected ? "bg-red-400 text-white"
                : "bg-gray-100 text-gray-600"}`}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
            {revealed && i === q.answer && <span className="ml-auto text-emerald-500 text-lg flex-shrink-0">✓</span>}
            {revealed && i === selected && i !== q.answer && <span className="ml-auto text-red-400 text-lg flex-shrink-0">✗</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Composant Vrai/Faux ───────────────────────────────────────

function TrueFalseView({
  q, onAnswer,
}: {
  q: TrueFalseQuestion;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  const [chosen, setChosen] = useState<boolean | null>(null);
  const revealed = chosen !== null;

  const choose = (v: boolean) => {
    if (revealed) return;
    setChosen(v);
    onAnswer(v === q.answer, v === q.answer ? q.xp : 0);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {[{ val: true, label: "VRAI", emoji: "✅", colors: { base: "from-emerald-400 to-green-500", wrong: "from-gray-200 to-gray-300" } },
        { val: false, label: "FAUX", emoji: "❌", colors: { base: "from-red-400 to-rose-500", wrong: "from-gray-200 to-gray-300" } }
      ].map(({ val, label, emoji, colors }) => {
        const isCorrect = val === q.answer;
        const isChosen  = chosen === val;
        let gradient    = `from-gray-100 to-gray-200`;
        if (revealed) {
          if (isCorrect) gradient = colors.base;
          else gradient = colors.wrong;
        } else {
          gradient = val ? "from-emerald-400 to-green-500" : "from-red-400 to-rose-500";
        }
        return (
          <button key={label} onClick={() => choose(val)}
            className={`flex-1 flex flex-col items-center justify-center gap-3 py-8 rounded-3xl bg-gradient-to-br ${gradient}
              ${!revealed ? "hover:scale-[1.02] cursor-pointer shadow-lg text-white" : isCorrect ? "text-white shadow-lg" : "text-gray-400 opacity-60"}
              transition-all border-2 ${isChosen && !isCorrect ? "border-red-300" : "border-transparent"}`}>
            <span className="text-5xl">{emoji}</span>
            <span className="text-2xl font-black">{label}</span>
            {revealed && isChosen && (
              <span className="text-sm font-bold">{isCorrect ? "Bonne réponse ! 🎉" : "Mauvaise réponse"}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Composant Association de colonnes ─────────────────────────

function MatchingView({
  q, onAnswer,
}: {
  q: MatchingQuestion;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  const n = q.pairs.length;
  const shuffledRight = [...q.pairs.map((p, i) => ({ text: p.right, idx: i }))]
    .sort(() => 0.5 - Math.random());

  const [userMatches, setUserMatches] = useState<Record<number, number | null>>(
    Object.fromEntries(q.pairs.map((_, i) => [i, null]))
  );
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleLeft = (i: number) => {
    if (revealed) return;
    setSelectedLeft(i === selectedLeft ? null : i);
  };

  const handleRight = (rightIdx: number) => {
    if (revealed || selectedLeft === null) return;
    const prev = { ...userMatches };
    // Annuler l'ancienne paire pour ce droit
    const existingLeft = Object.entries(prev).find(([, v]) => v === rightIdx)?.[0];
    if (existingLeft !== undefined) prev[+existingLeft] = null;
    prev[selectedLeft] = rightIdx;
    setUserMatches(prev);
    setSelectedLeft(null);
    if (Object.values(prev).filter((v) => v !== null).length === n) {
      let correct = 0;
      q.pairs.forEach((_, li) => {
        const ri = shuffledRight.findIndex((r) => r.idx === li);
        if (prev[li] === ri) correct++;
      });
      setRevealed(true);
      onAnswer(correct === n, correct === n ? q.xp : Math.round((correct / n) * q.xp * 0.5));
    }
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 text-center font-medium">
        Clique sur un élément à gauche puis sur sa correspondance à droite
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {q.pairs.map((p, li) => {
            const matched = userMatches[li] !== null;
            const correct = revealed && userMatches[li] === shuffledRight.findIndex((r) => r.idx === li);
            return (
              <button key={li} onClick={() => handleLeft(li)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold text-left border-2 transition-all
                  ${selectedLeft === li ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : revealed && correct ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : revealed && matched ? "border-red-400 bg-red-50 text-red-700"
                    : matched ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"}`}>
                {p.left}
                {revealed && (correct ? " ✓" : " ✗")}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((r, ri) => {
            const isMatched = Object.values(userMatches).includes(ri);
            const leftIdx   = Object.entries(userMatches).find(([, v]) => v === ri)?.[0];
            const correct   = revealed && leftIdx !== undefined && +leftIdx === r.idx;
            return (
              <button key={ri} onClick={() => handleRight(ri)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-bold text-left border-2 transition-all
                  ${revealed && isMatched && correct ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : revealed && isMatched ? "border-red-400 bg-red-50 text-red-700"
                    : isMatched ? "border-amber-300 bg-amber-50 text-amber-700"
                    : selectedLeft !== null ? "border-indigo-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer"
                    : "border-gray-200 bg-white text-gray-500 cursor-default"}`}>
                {r.text}
                {revealed && isMatched && (correct ? " ✓" : " ✗")}
              </button>
            );
          })}
        </div>
      </div>
      {!revealed && (
        <p className="text-xs text-center text-gray-400 mt-3">
          {Object.values(userMatches).filter((v) => v !== null).length}/{n} paires associées
        </p>
      )}
    </div>
  );
}

// ── Composant Identification avec indices ─────────────────────

function IdentificationView({
  q, onAnswer,
}: {
  q: IdentificationQuestion;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  const [hintsShown, setHintsShown] = useState(1);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const check = () => {
    if (revealed) return;
    const norm = (s: string) => s.toUpperCase().trim().replace(/[ÉÈÊË]/g, "E").replace(/[ÀÂÄ]/g, "A");
    const correct = norm(input) === norm(q.answer);
    setIsCorrect(correct);
    setRevealed(true);
    const xpEarned = correct ? Math.max(q.xp - (hintsShown - 1) * 20, 30) : 0;
    onAnswer(correct, xpEarned);
  };

  return (
    <div className="space-y-5">
      {/* Indices */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black text-indigo-900">🔍 Indices</h4>
          <span className="text-xs text-indigo-500 font-medium">{hintsShown}/{q.hints.length} révélés</span>
        </div>
        <div className="space-y-2">
          {q.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-indigo-200 rounded-full text-xs font-black text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-indigo-800 font-medium">{hint}</p>
            </div>
          ))}
        </div>
        {hintsShown < q.hints.length && !revealed && (
          <button onClick={() => setHintsShown((h) => h + 1)}
            className="mt-3 w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">
            Révéler l&apos;indice suivant (−20 XP)
          </button>
        )}
      </div>

      {/* Réponse */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Votre réponse :</label>
        <div className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") check(); }}
            disabled={revealed}
            placeholder="Entrez votre réponse…"
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold outline-none transition-all
              ${revealed
                ? isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : "border-red-400 bg-red-50 text-red-800"
                : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white text-gray-900"}`}
          />
          {!revealed && (
            <button onClick={check}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm">
              Valider
            </button>
          )}
        </div>
        {revealed && (
          <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
            {isCorrect ? "✅ Bravo !" : `❌ La réponse était : ${q.answer}`}
          </div>
        )}
      </div>

      {revealed && (
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-gray-600 font-medium">
          💡 XP gagnés : +{Math.max(q.xp - (hintsShown - 1) * 20, 30)} XP (selon le nombre d&apos;indices utilisés)
        </div>
      )}
    </div>
  );
}

// ── Composant Mots croisés ────────────────────────────────────

function CrosswordView({
  q, onAnswer,
}: {
  q: CrosswordQuestion;
  onAnswer: (correct: boolean, xp: number) => void;
}) {
  type CellState = string;
  const rows = q.grid.length;
  const cols = q.grid[0].length;

  const [cells, setCells] = useState<CellState[][]>(
    q.grid.map((row) => row.map((c) => (c === null ? "" : "")))
  );
  const [revealed, setRevealed] = useState(false);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);

  const getCellNumber = (r: number, c: number) => {
    const word = q.words.find((w) => w.row === r && w.col === c);
    return word?.id ?? null;
  };

  const handleInput = (r: number, c: number, val: string) => {
    if (revealed || q.grid[r][c] === null) return;
    const ch = val.replace(/[^a-zA-ZÀ-ÿ]/g, "").toUpperCase().slice(-1);
    const next = cells.map((row) => [...row]);
    next[r][c] = ch;
    setCells(next);
    // Avancer automatiquement
    if (ch) {
      const acrossWord = q.words.find((w) => w.direction === "across" && w.row === r && c >= w.col && c < w.col + w.length);
      if (acrossWord && c + 1 < acrossWord.col + acrossWord.length) {
        setActiveCell([r, c + 1]);
      }
    }
  };

  const check = () => {
    let correct = 0; let total = 0;
    q.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell !== null) {
        total++;
        if ((cells[r][c] || "").toUpperCase() === cell.toUpperCase()) correct++;
      }
    }));
    const allCorrect = correct === total;
    setRevealed(true);
    onAnswer(allCorrect, allCorrect ? q.xp : Math.round((correct / total) * q.xp * 0.5));
  };

  const reveal = () => {
    const solved = q.grid.map((row) => row.map((c) => (c === null ? "" : c)));
    setCells(solved);
    setRevealed(true);
    onAnswer(false, 0);
  };

  return (
    <div className="space-y-6">
      {/* Grille */}
      <div className="flex flex-col items-center">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 2.75rem)` }}>
          {q.grid.map((row, r) => row.map((cell, c) => {
            const num = getCellNumber(r, c);
            const isActive = activeCell?.[0] === r && activeCell?.[1] === c;
            const isBlack = cell === null;
            const userLetter = cells[r][c] ?? "";
            const correctLetter = cell ?? "";
            const isCorrectCell = revealed && !isBlack && userLetter.toUpperCase() === correctLetter.toUpperCase();
            const isWrongCell   = revealed && !isBlack && !isCorrectCell;

            return (
              <div key={`${r}-${c}`} onClick={() => { if (!isBlack) setActiveCell([r, c]); }}
                className={`relative w-11 h-11 border ${isBlack ? "bg-gray-800 border-gray-800"
                  : isActive ? "bg-indigo-100 border-indigo-400"
                  : revealed && isCorrectCell ? "bg-emerald-50 border-emerald-300"
                  : revealed && isWrongCell ? "bg-red-50 border-red-300"
                  : "bg-white border-gray-300 hover:bg-indigo-50 cursor-text"}`}>
                {num && !isBlack && (
                  <span className="absolute top-0.5 left-0.5 text-[8px] font-black text-gray-500 leading-none">{num}</span>
                )}
                {!isBlack && (
                  <input
                    type="text" maxLength={1} value={userLetter}
                    onChange={(e) => handleInput(r, c, e.target.value)}
                    onFocus={() => setActiveCell([r, c])}
                    disabled={revealed}
                    className="absolute inset-0 w-full h-full text-center text-sm font-black text-gray-800 bg-transparent outline-none uppercase cursor-text"
                  />
                )}
                {revealed && !isBlack && (
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-black
                    ${isCorrectCell ? "text-emerald-600" : "text-red-500"}`}>
                    {cell}
                  </span>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      {/* Définitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["across", "down"].map((dir) => {
          const dirWords = q.words.filter((w) => w.direction === dir);
          if (!dirWords.length) return null;
          return (
            <div key={dir} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
                {dir === "across" ? "→ Horizontal" : "↓ Vertical"}
              </h4>
              <div className="space-y-1.5">
                {dirWords.map((w) => (
                  <div key={w.id} className="flex gap-2 text-xs text-gray-600">
                    <span className="font-black text-indigo-600 flex-shrink-0">{w.id}.</span>
                    <span>{w.clue}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && (
        <div className="flex gap-3">
          <button onClick={check}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm">
            Vérifier mes réponses
          </button>
          <button onClick={reveal}
            className="px-5 py-3 border-2 border-gray-200 text-gray-500 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
            Révéler
          </button>
        </div>
      )}
    </div>
  );
}

// ── Écran résultats ───────────────────────────────────────────

function ResultsScreen({
  answers, totalXp, onRestart,
}: {
  answers: { correct: boolean; xp: number }[];
  totalXp: number;
  onRestart: () => void;
}) {
  const correct = answers.filter((a) => a.correct).length;
  const pct = Math.round((correct / answers.length) * 100);
  const medal = pct === 100 ? "🥇" : pct >= 80 ? "🥈" : pct >= 60 ? "🥉" : "📝";
  const msg = pct === 100 ? "Score parfait ! Extraordinaire !" : pct >= 80 ? "Excellent travail !" : pct >= 60 ? "Bon travail, continue !" : "Tu peux faire mieux !";

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-6xl mb-4">{medal}</div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">{msg}</h2>
        <p className="text-gray-500 text-sm mb-6">Quiz terminé !</p>

        {/* Score */}
        <div className={`rounded-2xl p-6 mb-6 ${pct === 100 ? "bg-emerald-50 border-2 border-emerald-200" : pct >= 60 ? "bg-indigo-50 border border-indigo-100" : "bg-gray-50 border border-gray-100"}`}>
          <div className="text-5xl font-black mb-1" style={{ color: pct >= 80 ? "#059669" : pct >= 60 ? "#4f46e5" : "#9ca3af" }}>
            {pct}%
          </div>
          <p className="text-sm text-gray-600">{correct}/{answers.length} bonnes réponses</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-indigo-500" : "bg-gray-400"}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-amber-50 border border-amber-100 rounded-2xl py-4">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-2xl font-black text-amber-600">+{totalXp} XP</p>
            <p className="text-xs text-amber-500">Points d&apos;expérience gagnés</p>
          </div>
        </div>

        {/* Détail questions */}
        <div className="text-left space-y-2 mb-6">
          {answers.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${a.correct ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
              <span className="text-lg">{a.correct ? "✅" : "❌"}</span>
              <span className="text-sm font-semibold text-gray-700 flex-1">Question {i + 1}</span>
              <span className={`text-xs font-bold ${a.correct ? "text-emerald-600" : "text-red-500"}`}>
                {a.correct ? `+${a.xp} XP` : "0 XP"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onRestart}
            className="flex-1 py-3 border-2 border-indigo-200 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors">
            Réessayer
          </button>
          <Link href="/quiz"
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all text-center shadow-sm">
            Autres quiz →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Runner principal ─────────────────────────────────────

export default function QuizRunner() {
  const [currentIdx, setCurrentIdx]   = useState(-1); // -1 = intro
  const [answers, setAnswers]          = useState<{ correct: boolean; xp: number }[]>([]);
  const [questionKey, setQuestionKey]  = useState(0);
  const [waitingNext, setWaitingNext]  = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; xp: number } | null>(null);

  const totalXp    = answers.reduce((s, a) => s + a.xp, 0);
  const isIntro    = currentIdx === -1;
  const isDone     = currentIdx >= QUESTIONS.length;
  const q          = !isIntro && !isDone ? QUESTIONS[currentIdx] : null;
  const progress   = isDone ? 100 : Math.round(((currentIdx + 1) / QUESTIONS.length) * 100);

  const handleAnswer = useCallback((correct: boolean, xp: number) => {
    setAnswerResult({ correct, xp });
    setQuestionAnswered(true);
    setWaitingNext(true);
  }, []);

  const nextQuestion = () => {
    if (answerResult) setAnswers((prev) => [...prev, answerResult]);
    setAnswerResult(null);
    setQuestionAnswered(false);
    setWaitingNext(false);
    setCurrentIdx((i) => i + 1);
    setQuestionKey((k) => k + 1);
  };

  const restart = () => {
    setCurrentIdx(-1);
    setAnswers([]);
    setQuestionKey((k) => k + 1);
    setWaitingNext(false);
    setQuestionAnswered(false);
    setAnswerResult(null);
  };

  const typeBadge: Record<string, string> = {
    qcm:            "🔘 QCM",
    trueFalse:      "✅ Vrai / Faux",
    matching:       "🔗 Association",
    identification: "🔍 Identification",
    crossword:      "🔲 Mots croisés",
  };

  // ── Écran intro ──
  if (isIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-br ${DEMO_QUIZ.color} h-32 flex items-center justify-center relative`}>
              <div className="absolute inset-0 bg-black/10" />
              <span className="relative text-7xl">{DEMO_QUIZ.icon}</span>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{DEMO_QUIZ.subject}</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">{DEMO_QUIZ.title}</h1>
              <p className="text-sm text-gray-500 mb-5">Ce quiz démontre les 5 types de questions disponibles sur NEKH XËL.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ["📝", `${QUESTIONS.length} questions`],
                  ["⏱", "~10 min"],
                  ["⭐", `${QUESTIONS.reduce((s, q) => s + q.xp, 0)} XP max`],
                  ["🎯", "5 types diff."],
                ].map(([icon, txt]) => (
                  <div key={txt} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span>{icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{txt}</span>
                  </div>
                ))}
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Types de questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {["QCM", "Vrai/Faux", "Association", "Identification", "Mots croisés"].map((t) => (
                    <span key={t} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setCurrentIdx(0)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base rounded-2xl transition-all shadow-lg hover:shadow-xl">
                Commencer le quiz 🚀
              </button>
              <Link href="/quiz" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3 font-medium">
                ← Retour aux quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Écran résultats ──
  if (isDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-4">
        <ResultsScreen answers={answers} totalXp={totalXp} onRestart={restart} />
      </div>
    );
  }

  // ── Question active ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${DEMO_QUIZ.color} text-white`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/quiz" className="text-white/70 hover:text-white text-sm font-semibold">← Quitter</Link>
            <span className="text-sm font-bold">{currentIdx + 1} / {QUESTIONS.length}</span>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <span className="text-yellow-300">⭐</span>
              <span className="text-sm font-black">{totalXp} XP</span>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Type badge + XP */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full">
            {q && typeBadge[q.type]}
          </span>
          <span className="text-xs text-gray-400 font-medium">+{q?.xp} XP si correct</span>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-lg font-black text-gray-900 mb-6 leading-snug">{q?.question}</h2>

          {/* Rendu selon type */}
          {q?.type === "qcm" && (
            <QCMView key={questionKey} q={q} onAnswer={handleAnswer} />
          )}
          {q?.type === "trueFalse" && (
            <TrueFalseView key={questionKey} q={q} onAnswer={handleAnswer} />
          )}
          {q?.type === "matching" && (
            <MatchingView key={questionKey} q={q} onAnswer={handleAnswer} />
          )}
          {q?.type === "identification" && (
            <IdentificationView key={questionKey} q={q} onAnswer={handleAnswer} />
          )}
          {q?.type === "crossword" && (
            <CrosswordView key={questionKey} q={q} onAnswer={handleAnswer} />
          )}

          {/* Explication */}
          {questionAnswered && q && (
            <div className={`mt-5 p-4 rounded-xl border text-sm ${answerResult?.correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              <div className="flex items-center gap-2 font-black mb-1">
                {answerResult?.correct ? "✅ Correct !" : "❌ Incorrect"}
                {answerResult?.xp ? <span className="text-amber-600">+{answerResult.xp} XP</span> : null}
              </div>
              <p className="font-medium">{q.explanation}</p>
            </div>
          )}
        </div>

        {/* Bouton suivant */}
        {waitingNext && (
          <button onClick={nextQuestion}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base rounded-2xl transition-all shadow-lg hover:shadow-xl">
            {currentIdx < QUESTIONS.length - 1 ? "Question suivante →" : "Voir mes résultats 🏆"}
          </button>
        )}
      </div>
    </div>
  );
}
