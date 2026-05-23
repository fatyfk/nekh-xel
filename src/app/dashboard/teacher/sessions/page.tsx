"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

const SUBJECTS = [
  "Toutes matières", "Histoire", "Géographie", "Sciences",
  "Instruction civique", "Orthographe", "Conjugaison", "Grammaire",
  "Calcul mental", "Culture générale",
];
const LEVELS = ["CM1", "CM2", "6ème", "5ème", "4ème", "3ème"];
const CLASSES_LIST = ["CM1-A", "CM2-B", "6ème-C"];

type SessionType  = "Entraînement" | "Évaluation" | "Compétition Génie en Herbe";
type SessionMode  = "Individuel" | "Équipes";
type SessionStatus = "Programmée" | "En cours" | "Terminée" | "Brouillon";

type Session = {
  id: string;
  name: string;
  class: string;
  subject: string;
  type: SessionType;
  mode: SessionMode;
  status: SessionStatus;
  date: string;
  duration: number;
  difficulty: string;
  questionsCount: number;
  participantsCount: number;
  avgScore: number | null;
};

const MOCK_SESSIONS: Session[] = [
  {
    id: "1", name: "Révision – Empires africains", class: "CM1-A", subject: "Histoire",
    type: "Entraînement", mode: "Individuel", status: "Terminée",
    date: "20 Mai 2026", duration: 20, difficulty: "Moyen",
    questionsCount: 10, participantsCount: 26, avgScore: 82,
  },
  {
    id: "2", name: "Éval. – Géographie physique Sénégal", class: "CM2-B", subject: "Géographie",
    type: "Évaluation", mode: "Individuel", status: "Terminée",
    date: "18 Mai 2026", duration: 30, difficulty: "Difficile",
    questionsCount: 15, participantsCount: 29, avgScore: 74,
  },
  {
    id: "3", name: "Génie en Herbe – Sélection CM1", class: "CM1-A", subject: "Toutes matières",
    type: "Compétition Génie en Herbe", mode: "Équipes", status: "Programmée",
    date: "28 Mai 2026", duration: 45, difficulty: "Difficile",
    questionsCount: 20, participantsCount: 0, avgScore: null,
  },
  {
    id: "4", name: "Entraînement – Constitution & droits", class: "6ème-C", subject: "Instruction civique",
    type: "Entraînement", mode: "Individuel", status: "En cours",
    date: "23 Mai 2026", duration: 25, difficulty: "Moyen",
    questionsCount: 12, participantsCount: 18, avgScore: null,
  },
  {
    id: "5", name: "Quiz flash – Calcul mental", class: "CM2-B", subject: "Calcul mental",
    type: "Entraînement", mode: "Individuel", status: "Brouillon",
    date: "—", duration: 15, difficulty: "Facile",
    questionsCount: 8, participantsCount: 0, avgScore: null,
  },
];

type FormState = {
  name: string; class: string; subject: string; level: string;
  type: SessionType; mode: SessionMode; date: string;
  duration: number; difficulty: string; questionsCount: number;
  questionSource: "bank" | "auto";
};

const EMPTY_FORM: FormState = {
  name: "", class: "CM1-A", subject: "Histoire", level: "CM1",
  type: "Entraînement", mode: "Individuel", date: "", duration: 20,
  difficulty: "Moyen", questionsCount: 10, questionSource: "auto",
};

const STATUS_STYLES: Record<SessionStatus, string> = {
  "Programmée":              "bg-indigo-100 text-indigo-700",
  "En cours":                "bg-emerald-100 text-emerald-700",
  "Terminée":                "bg-gray-100 text-gray-500",
  "Brouillon":               "bg-amber-100 text-amber-700",
};

const TYPE_ICONS: Record<SessionType, string> = {
  "Entraînement":              "🏋️",
  "Évaluation":                "📝",
  "Compétition Génie en Herbe": "🏆",
};

const MODE_ICONS: Record<SessionMode, string> = {
  Individuel: "👤",
  Équipes:    "👥",
};

const TEACHER = { firstName: "Ousmane", lastName: "Ndiaye", subject: "Histoire-Géographie" };

const NAV = [
  { href: "/dashboard/teacher",           label: "Accueil",    icon: "🏠"  },
  { href: "/dashboard/teacher/students",  label: "Mes élèves", icon: "👨‍🎓" },
  { href: "/dashboard/teacher/questions", label: "Questions",  icon: "✏️"  },
  { href: "/dashboard/teacher/sessions",  label: "Sessions",   icon: "🎯", active: true },
  { href: "/quiz",                         label: "Quiz",       icon: "📝"  },
  { href: "/results",                      label: "Résultats",  icon: "📊"  },
  { href: "/messages",                     label: "Messages",   icon: "💬"  },
  { href: "/settings",                     label: "Paramètres", icon: "⚙️"  },
];

export default function SessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "Toutes">("Toutes");
  const [formSuccess, setFormSuccess] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const newSession: Session = {
      id: Date.now().toString(),
      name: form.name,
      class: form.class,
      subject: form.subject,
      type: form.type,
      mode: form.mode,
      status: form.date ? "Programmée" : "Brouillon",
      date: form.date || "—",
      duration: form.duration,
      difficulty: form.difficulty,
      questionsCount: form.questionsCount,
      participantsCount: 0,
      avgScore: null,
    };
    setSessions((prev) => [newSession, ...prev]);
    setFormSuccess(true);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const filtered = sessions.filter((s) =>
    filterStatus === "Toutes" || s.status === filterStatus
  );

  const statuses: (SessionStatus | "Toutes")[] = ["Toutes", "En cours", "Programmée", "Terminée", "Brouillon"];

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white transition";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

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

      <div className="lg:ml-64 flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between mb-2">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white border border-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-black text-emerald-600">NEKH XËL</span>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">{TEACHER.firstName[0]}</div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Link href="/dashboard/teacher" className="hover:text-gray-600 transition-colors">Tableau de bord</Link>
              <span>›</span>
              <span className="text-gray-700 font-semibold">Sessions d'entraînement</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">🎯 Sessions d'entraînement</h1>
            <p className="text-sm text-gray-500 mt-1">Planifiez et gérez vos sessions de quiz pour vos classes</p>
          </div>
          <button onClick={() => { setShowForm(true); setFormSuccess(false); }}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm">
            + Nouvelle session
          </button>
        </div>

        {/* Success toast */}
        {formSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <span className="text-emerald-500 text-xl">✅</span>
            <p className="font-bold text-emerald-800 text-sm">Session créée avec succès !</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total sessions",  value: sessions.length,                                    icon: "📋", color: "bg-indigo-50 text-indigo-700"   },
            { label: "En cours",        value: sessions.filter((s) => s.status === "En cours").length,    icon: "▶️", color: "bg-emerald-50 text-emerald-700" },
            { label: "Programmées",     value: sessions.filter((s) => s.status === "Programmée").length,  icon: "📅", color: "bg-violet-50 text-violet-700"   },
            { label: "Terminées",       value: sessions.filter((s) => s.status === "Terminée").length,    icon: "✅", color: "bg-gray-50 text-gray-700"       },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-lg mb-2`}>{icon}</div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Create form panel */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-base font-black text-gray-900">🎯 Nouvelle session d'entraînement</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/80 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5 max-w-3xl">
              {/* Name */}
              <div>
                <label className={labelCls}>Nom de la session <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Ex : Révision – Empires africains CM1-A" value={form.name}
                  onChange={(e) => setField("name", e.target.value)} className={inputCls} />
              </div>

              {/* Class + Subject + Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Classe</label>
                  <select value={form.class} onChange={(e) => setField("class", e.target.value)} className={inputCls}>
                    {CLASSES_LIST.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Matière</label>
                  <select value={form.subject} onChange={(e) => setField("subject", e.target.value)} className={inputCls}>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Niveau visé</label>
                  <select value={form.level} onChange={(e) => setField("level", e.target.value)} className={inputCls}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Type + Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Type de session</label>
                  <div className="space-y-2">
                    {(["Entraînement", "Évaluation", "Compétition Génie en Herbe"] as SessionType[]).map((t) => (
                      <label key={t} className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-emerald-200">
                        <input type="radio" name="type" value={t} checked={form.type === t}
                          onChange={() => setField("type", t)} className="accent-emerald-600" />
                        <span className="text-lg">{TYPE_ICONS[t]}</span>
                        <span className="text-sm font-semibold text-gray-800">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Mode de jeu</label>
                  <div className="space-y-2">
                    {(["Individuel", "Équipes"] as SessionMode[]).map((m) => (
                      <label key={m} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${form.mode === m ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"}`}>
                        <input type="radio" name="mode" value={m} checked={form.mode === m}
                          onChange={() => setField("mode", m)} className="accent-emerald-600" />
                        <span className="text-xl">{MODE_ICONS[m]}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{m}</p>
                          <p className="text-xs text-gray-400">{m === "Individuel" ? "Chaque élève répond seul" : "Compétition en groupes"}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date + Duration + Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Date de la session</label>
                  <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Laisser vide → Brouillon</p>
                </div>
                <div>
                  <label className={labelCls}>Durée (minutes)</label>
                  <div className="flex gap-2">
                    {[15, 20, 30, 45].map((d) => (
                      <button key={d} type="button" onClick={() => setField("duration", d)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.duration === d ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 text-gray-500 hover:border-emerald-300"}`}>
                        {d}min
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Nombre de questions</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((n) => (
                      <button key={n} type="button" onClick={() => setField("questionsCount", n)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.questionsCount === n ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 text-gray-500 hover:border-emerald-300"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className={labelCls}>Niveau de difficulté</label>
                <div className="flex gap-3">
                  {["Facile", "Moyen", "Difficile", "Mixte"].map((d) => (
                    <button key={d} type="button" onClick={() => setField("difficulty", d)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.difficulty === d ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "border-gray-200 text-gray-500 hover:border-emerald-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question source */}
              <div>
                <label className={labelCls}>Source des questions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: "auto",  icon: "✨", title: "Automatique",       desc: "NEKH XËL sélectionne les meilleures questions selon vos critères"   },
                    { key: "bank",  icon: "📚", title: "Depuis ma banque",  desc: "Choisissez parmi les questions que vous avez créées ou importées" },
                  ] as const).map(({ key, icon, title, desc }) => (
                    <label key={key}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${form.questionSource === key ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"}`}>
                      <input type="radio" name="source" value={key} checked={form.questionSource === key}
                        onChange={() => setField("questionSource", key)} className="accent-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{icon} {title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              {form.name && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-wide mb-3">Résumé de la session</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Nom :</span> <span className="font-bold text-gray-800">{form.name}</span></div>
                    <div><span className="text-gray-500">Classe :</span> <span className="font-bold text-gray-800">{form.class}</span></div>
                    <div><span className="text-gray-500">Matière :</span> <span className="font-bold text-gray-800">{form.subject}</span></div>
                    <div><span className="text-gray-500">Type :</span> <span className="font-bold text-gray-800">{TYPE_ICONS[form.type]} {form.type}</span></div>
                    <div><span className="text-gray-500">Mode :</span> <span className="font-bold text-gray-800">{form.mode}</span></div>
                    <div><span className="text-gray-500">Durée :</span> <span className="font-bold text-gray-800">{form.duration} min · {form.questionsCount} questions</span></div>
                    <div><span className="text-gray-500">Difficulté :</span> <span className="font-bold text-gray-800">{form.difficulty}</span></div>
                    <div><span className="text-gray-500">Date :</span> <span className="font-bold text-gray-800">{form.date || "Brouillon"}</span></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCreate} disabled={!form.name.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-sm text-sm">
                  🎯 Créer la session
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="px-5 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filterStatus === s ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
              {s} {s !== "Toutes" && `(${sessions.filter((x) => x.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Session list */}
        <div className="space-y-4">
          {filtered.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl flex-shrink-0">
                      {TYPE_ICONS[session.type]}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base leading-tight">{session.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{session.class}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{session.subject}</span>
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{MODE_ICONS[session.mode]} {session.mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_STYLES[session.status]}`}>
                      {session.status === "En cours" ? "● " : ""}{session.status}
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Date",          value: session.date,                                       icon: "📅" },
                    { label: "Durée",         value: `${session.duration} min`,                          icon: "⏱" },
                    { label: "Questions",     value: session.questionsCount,                             icon: "❓" },
                    { label: "Participants",  value: session.participantsCount > 0 ? session.participantsCount : "—", icon: "👨‍🎓" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-base font-black text-gray-900">{icon} {value}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Score bar (completed sessions) */}
                {session.avgScore !== null && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-500">Score moyen de la classe</p>
                      <span className={`text-sm font-black ${session.avgScore >= 80 ? "text-emerald-600" : session.avgScore >= 65 ? "text-amber-600" : "text-red-600"}`}>
                        {session.avgScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${session.avgScore >= 80 ? "bg-emerald-500" : session.avgScore >= 65 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${session.avgScore}%` }} />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {session.status === "En cours" && (
                    <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors">
                      ▶ Rejoindre la session
                    </button>
                  )}
                  {session.status === "Programmée" && (
                    <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors">
                      ▶ Démarrer maintenant
                    </button>
                  )}
                  {session.status === "Brouillon" && (
                    <button className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors">
                      Planifier la session
                    </button>
                  )}
                  {session.status === "Terminée" && (
                    <button className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors">
                      📊 Voir les résultats
                    </button>
                  )}
                  <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => setSessions((prev) => prev.filter((x) => x.id !== session.id))}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-bold text-xs rounded-xl transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">🎯</p>
              <p className="text-gray-700 font-black text-lg mb-1">Aucune session trouvée</p>
              <p className="text-gray-400 text-sm mb-6">Créez votre première session d'entraînement</p>
              <button onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                + Créer une session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
