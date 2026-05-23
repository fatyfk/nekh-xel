"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { logoutAction } from "@/app/actions/auth";

const SUBJECTS = [
  "Histoire", "Géographie", "Sciences", "Instruction civique",
  "Orthographe", "Conjugaison", "Grammaire", "Calcul mental", "Culture générale",
];
const LEVELS = ["CI", "CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"];
const DIFFICULTIES = ["Facile", "Moyen", "Difficile"];
const QUESTION_TYPES = ["QCM", "Vrai/Faux", "Identification", "Association"] as const;
type QuestionType = (typeof QUESTION_TYPES)[number];

type Question = {
  id: string;
  subject: string;
  theme: string;
  level: string;
  type: QuestionType;
  enonce: string;
  choixA: string;
  choixB: string;
  choixC: string;
  choixD: string;
  bonneReponse: string;
  explication: string;
  difficulte: string;
  xpPoints: number;
  createdAt: string;
};

const MOCK_QUESTIONS: Question[] = [
  {
    id: "1", subject: "Histoire", theme: "Empires africains", level: "CM1", type: "QCM",
    enonce: "Quel empire africain a connu son apogée au XVe siècle sous Askia Mohammed ?",
    choixA: "Empire du Mali", choixB: "Empire Songhaï", choixC: "Empire du Ghana", choixD: "Empire du Bénin",
    bonneReponse: "B",
    explication: "L'Empire Songhaï a atteint son apogée sous Askia Mohammed (1493-1528), s'étendant sur toute l'Afrique de l'Ouest.",
    difficulte: "Moyen", xpPoints: 20, createdAt: "Il y a 3 jours",
  },
  {
    id: "2", subject: "Géographie", theme: "Fleuves du Sénégal", level: "CM2", type: "QCM",
    enonce: "Quel est le fleuve qui forme la frontière entre le Sénégal et la Mauritanie ?",
    choixA: "Le Casamance", choixB: "La Gambie", choixC: "Le Sénégal", choixD: "Le Sine",
    bonneReponse: "C",
    explication: "Le fleuve Sénégal (1 790 km) marque la frontière naturelle entre le Sénégal et la Mauritanie avant de se jeter dans l'Atlantique à Saint-Louis.",
    difficulte: "Facile", xpPoints: 10, createdAt: "Il y a 1 semaine",
  },
  {
    id: "3", subject: "Instruction civique", theme: "Constitution sénégalaise", level: "6ème", type: "Vrai/Faux",
    enonce: "Le Sénégal est une République présidentielle avec un Parlement bicaméral.",
    choixA: "", choixB: "", choixC: "", choixD: "",
    bonneReponse: "Faux",
    explication: "Le Sénégal est une République présidentielle, mais son Parlement est monocaméral depuis 2012 (Assemblée nationale uniquement).",
    difficulte: "Difficile", xpPoints: 30, createdAt: "Il y a 2 semaines",
  },
  {
    id: "4", subject: "Géographie", theme: "Régions du Sénégal", level: "CM1", type: "Identification",
    enonce: "Nommez la capitale de la région de Ziguinchor, au cœur de la Casamance.",
    choixA: "", choixB: "", choixC: "", choixD: "",
    bonneReponse: "Ziguinchor",
    explication: "Ziguinchor est à la fois le nom de la région et de sa capitale, situés en Casamance, dans le sud du Sénégal.",
    difficulte: "Moyen", xpPoints: 20, createdAt: "Il y a 3 semaines",
  },
];

type FormState = {
  subject: string; theme: string; level: string; type: QuestionType;
  enonce: string; choixA: string; choixB: string; choixC: string; choixD: string;
  bonneReponse: string; explication: string; difficulte: string; xpPoints: number;
};

const EMPTY_FORM: FormState = {
  subject: "Histoire", theme: "", level: "CM1", type: "QCM",
  enonce: "", choixA: "", choixB: "", choixC: "", choixD: "",
  bonneReponse: "A", explication: "", difficulte: "Moyen", xpPoints: 20,
};

const CSV_TEMPLATE = `matiere,theme,niveau,type,enonce,choix_a,choix_b,choix_c,choix_d,bonne_reponse,explication,difficulte
Histoire,Empires africains,CM1,QCM,"Quel empire africain a connu son apogée au XVe siècle ?","Empire du Mali","Empire Songhaï","Empire du Ghana","Empire du Bénin",B,"L'Empire Songhaï a atteint son apogée sous Askia Mohammed.",Moyen
Géographie,Fleuves du Sénégal,CM2,Vrai/Faux,"Le fleuve Sénégal se jette dans l'Atlantique.",,,,,Vrai,"Le fleuve Sénégal se jette dans l'océan Atlantique à Saint-Louis.",Facile`;

function parseCSV(text: string): string[][] {
  return text.trim().split("\n").map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
      else current += ch;
    }
    result.push(current.trim());
    return result;
  });
}

const DIFF_COLORS: Record<string, string> = {
  Facile: "bg-emerald-100 text-emerald-700",
  Moyen: "bg-amber-100 text-amber-700",
  Difficile: "bg-red-100 text-red-700",
};

const TYPE_COLORS: Record<string, string> = {
  QCM: "bg-indigo-100 text-indigo-700",
  "Vrai/Faux": "bg-emerald-100 text-emerald-700",
  Identification: "bg-cyan-100 text-cyan-700",
  Association: "bg-violet-100 text-violet-700",
};

const TEACHER = { firstName: "Ousmane", lastName: "Ndiaye", subject: "Histoire-Géographie" };

const NAV = [
  { href: "/dashboard/teacher",           label: "Accueil",    icon: "🏠"  },
  { href: "/dashboard/teacher/students",  label: "Mes élèves", icon: "👨‍🎓" },
  { href: "/dashboard/teacher/questions", label: "Questions",  icon: "✏️", active: true },
  { href: "/dashboard/teacher/sessions",  label: "Sessions",   icon: "🎯"  },
  { href: "/quiz",                         label: "Quiz",       icon: "📝"  },
  { href: "/results",                      label: "Résultats",  icon: "📊"  },
  { href: "/messages",                     label: "Messages",   icon: "💬"  },
  { href: "/settings",                     label: "Paramètres", icon: "⚙️"  },
];

export default function QuestionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "list" | "import">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [formSuccess, setFormSuccess] = useState(false);
  const [filterSubject, setFilterSubject] = useState("Toutes");
  const [filterType, setFilterType] = useState("Tous");
  const [listSearch, setListSearch] = useState("");
  const [csvRows, setCsvRows] = useState<string[][] | null>(null);
  const [csvError, setCsvError] = useState("");
  const [csvImported, setCsvImported] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "type") {
        if (value === "Vrai/Faux") next.bonneReponse = "Vrai";
        else if (value === "QCM") next.bonneReponse = "A";
        else next.bonneReponse = "";
      }
      return next;
    });
  };

  const isFormValid =
    form.subject.trim() &&
    form.enonce.trim() &&
    form.bonneReponse.trim() &&
    form.explication.trim() &&
    (form.type !== "QCM" || (form.choixA.trim() && form.choixB.trim()));

  const handleSave = () => {
    if (!isFormValid) return;
    const newQ: Question = { id: Date.now().toString(), ...form, createdAt: "À l'instant" };
    setQuestions((prev) => [newQ, ...prev]);
    setFormSuccess(true);
    setForm(EMPTY_FORM);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleFileRead = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Format non supporté. Utilisez un fichier .csv");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) { setCsvError("Le fichier est vide ou ne contient que l'en-tête."); return; }
        setCsvRows(rows);
        setCsvError("");
      } catch {
        setCsvError("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  };

  const handleConfirmImport = () => {
    if (!csvRows) return;
    const [, ...rows] = csvRows;
    const imported: Question[] = rows.map((r, i) => ({
      id: `csv-${Date.now()}-${i}`,
      subject: r[0] ?? "", theme: r[1] ?? "", level: r[2] ?? "CM1",
      type: (r[3] as QuestionType) ?? "QCM",
      enonce: r[4] ?? "",
      choixA: r[5] ?? "", choixB: r[6] ?? "", choixC: r[7] ?? "", choixD: r[8] ?? "",
      bonneReponse: r[9] ?? "", explication: r[10] ?? "", difficulte: r[11] ?? "Moyen",
      xpPoints: 20, createdAt: "À l'instant",
    }));
    setQuestions((prev) => [...imported, ...prev]);
    setCsvImported(true);
    setCsvRows(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => { setCsvImported(false); setActiveTab("list"); }, 2500);
  };

  const filteredQuestions = questions.filter((q) =>
    (filterSubject === "Toutes" || q.subject === filterSubject) &&
    (filterType === "Tous" || q.type === filterType) &&
    (q.enonce.toLowerCase().includes(listSearch.toLowerCase()) || q.theme.toLowerCase().includes(listSearch.toLowerCase()))
  );

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
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/dashboard/teacher" className="hover:text-gray-600 transition-colors">Tableau de bord</Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">Banque de questions</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">✏️ Banque de questions</h1>
              <p className="text-sm text-gray-500 mt-1">{questions.length} questions · Créez, importez et gérez votre contenu pédagogique</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total questions", value: questions.length,                                                        icon: "📚", color: "bg-indigo-50 text-indigo-700"   },
            { label: "QCM",             value: questions.filter((q) => q.type === "QCM").length,                        icon: "✏️", color: "bg-emerald-50 text-emerald-700" },
            { label: "Vrai/Faux",       value: questions.filter((q) => q.type === "Vrai/Faux").length,                  icon: "✅", color: "bg-amber-50 text-amber-700"     },
            { label: "Autres types",    value: questions.filter((q) => q.type !== "QCM" && q.type !== "Vrai/Faux").length, icon: "🔤", color: "bg-violet-50 text-violet-700" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-lg mb-2`}>{icon}</div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tab container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {([
              { key: "create", label: "✏️ Créer une question" },
              { key: "list",   label: `📋 Mes questions (${questions.length})` },
              { key: "import", label: "📤 Import CSV" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 py-3.5 text-sm font-bold transition-colors ${activeTab === key ? "text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB: Créer ────────────────────────────────────────── */}
          {activeTab === "create" && (
            <div className="p-6 max-w-3xl">
              {formSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <span className="text-emerald-500 text-xl">✅</span>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Question ajoutée avec succès !</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Elle est maintenant disponible dans votre banque.</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Row 1: Subject + Theme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Matière <span className="text-red-500">*</span></label>
                    <select value={form.subject} onChange={(e) => setField("subject", e.target.value)} className={inputCls}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Thème / Chapitre <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Ex : Les empires africains" value={form.theme}
                      onChange={(e) => setField("theme", e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Row 2: Level + Type + Difficulty */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Niveau</label>
                    <select value={form.level} onChange={(e) => setField("level", e.target.value)} className={inputCls}>
                      {LEVELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Type de question</label>
                    <select value={form.type} onChange={(e) => setField("type", e.target.value as QuestionType)} className={inputCls}>
                      {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Difficulté</label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button key={d} type="button" onClick={() => setField("difficulte", d)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${form.difficulte === d ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Énoncé */}
                <div>
                  <label className={labelCls}>Énoncé de la question <span className="text-red-500">*</span></label>
                  <textarea rows={3} placeholder="Rédigez la question ici…" value={form.enonce}
                    onChange={(e) => setField("enonce", e.target.value)}
                    className={`${inputCls} resize-none`} />
                </div>

                {/* QCM choices */}
                {form.type === "QCM" && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                    <p className="text-sm font-black text-indigo-800 mb-4">Choix de réponses</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["A", "B", "C", "D"] as const).map((letter) => {
                        const field = `choix${letter}` as keyof FormState;
                        return (
                          <div key={letter} className="relative">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
                              ${form.bonneReponse === letter ? "bg-emerald-500 text-white" : "bg-indigo-200 text-indigo-700"}`}>
                              {letter}
                            </div>
                            <input type="text" placeholder={`Choix ${letter}${letter === "A" || letter === "B" ? " (requis)" : ""}`}
                              value={form[field] as string}
                              onChange={(e) => setField(field, e.target.value)}
                              className={`${inputCls} pl-11`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-indigo-800 mb-2 block">Bonne réponse <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        {["A", "B", "C", "D"].map((l) => (
                          <button key={l} type="button" onClick={() => setField("bonneReponse", l)}
                            className={`w-12 h-12 rounded-xl font-black text-sm border-2 transition-all ${form.bonneReponse === l ? "bg-emerald-500 border-emerald-500 text-white shadow-md" : "border-gray-200 text-gray-500 hover:border-emerald-300"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vrai/Faux answer */}
                {form.type === "Vrai/Faux" && (
                  <div>
                    <label className={labelCls}>Bonne réponse <span className="text-red-500">*</span></label>
                    <div className="flex gap-3">
                      {["Vrai", "Faux"].map((v) => (
                        <button key={v} type="button" onClick={() => setField("bonneReponse", v)}
                          className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all ${form.bonneReponse === v ? (v === "Vrai" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-red-500 border-red-500 text-white") : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          {v === "Vrai" ? "✓ Vrai" : "✗ Faux"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identification / Association answer */}
                {(form.type === "Identification" || form.type === "Association") && (
                  <div>
                    <label className={labelCls}>
                      {form.type === "Identification" ? "Réponse attendue" : "Paires à associer (séparées par |)"}
                      <span className="text-red-500">*</span>
                    </label>
                    <input type="text"
                      placeholder={form.type === "Identification" ? "Ex : Dakar, Saint-Louis, Thiès…" : "Ex : Mali→Bamako|Sénégal→Dakar"}
                      value={form.bonneReponse} onChange={(e) => setField("bonneReponse", e.target.value)}
                      className={inputCls} />
                    {form.type === "Identification" && (
                      <p className="text-xs text-gray-400 mt-1">Séparez plusieurs réponses valides par une virgule</p>
                    )}
                  </div>
                )}

                {/* Explication pédagogique */}
                <div>
                  <label className={labelCls}>
                    Explication pédagogique <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">(affichée après la réponse)</span>
                  </label>
                  <textarea rows={3} placeholder="Expliquez pourquoi c'est la bonne réponse, donnez du contexte…" value={form.explication}
                    onChange={(e) => setField("explication", e.target.value)}
                    className={`${inputCls} resize-none`} />
                </div>

                {/* XP Points */}
                <div>
                  <label className={labelCls}>Points XP attribués</label>
                  <div className="flex gap-3">
                    {[10, 20, 30, 50].map((pts) => (
                      <button key={pts} type="button" onClick={() => setField("xpPoints", pts)}
                        className={`px-4 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${form.xpPoints === pts ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}>
                        {pts} XP
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {form.enonce && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Aperçu</p>
                    <p className="text-sm font-semibold text-gray-800 mb-3">{form.enonce}</p>
                    {form.type === "QCM" && (
                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((l) => {
                          const val = form[`choix${l}` as keyof FormState] as string;
                          if (!val) return null;
                          return (
                            <div key={l} className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border ${form.bonneReponse === l ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-gray-200 text-gray-700"}`}>
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black ${form.bonneReponse === l ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>{l}</span>
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {form.type === "Vrai/Faux" && (
                      <div className="flex gap-2">
                        {["Vrai", "Faux"].map((v) => (
                          <div key={v} className={`px-4 py-2 rounded-xl text-xs font-bold ${form.bonneReponse === v ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>{v}</div>
                        ))}
                      </div>
                    )}
                    {form.explication && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">💡 {form.explication}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Save button */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleSave} disabled={!isFormValid}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-sm text-sm">
                    💾 Enregistrer la question
                  </button>
                  <button type="button" onClick={() => setForm(EMPTY_FORM)}
                    className="px-5 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Mes questions ─────────────────────────────────── */}
          {activeTab === "list" && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Rechercher dans vos questions…" value={listSearch} onChange={(e) => setListSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white" />
                </div>
                <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  <option value="Toutes">Toutes les matières</option>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  <option value="Tous">Tous les types</option>
                  {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Question list */}
              <div className="space-y-3">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all bg-white">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type] ?? "bg-gray-100 text-gray-600"}`}>{q.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{q.subject}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{q.level}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[q.difficulte] ?? "bg-gray-100 text-gray-600"}`}>{q.difficulte}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600">{q.xpPoints} XP</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 font-semibold rounded-lg transition-colors">
                          Modifier
                        </button>
                        <button onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-semibold rounded-lg transition-colors">
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{q.enonce}</p>
                    {q.theme && <p className="text-xs text-gray-400">📌 {q.theme}</p>}
                    {q.type === "QCM" && (
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {["A", "B", "C", "D"].map((l) => {
                          const val = q[`choix${l}` as keyof Question] as string;
                          if (!val) return null;
                          return (
                            <div key={l} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${q.bonneReponse === l ? "bg-emerald-50 text-emerald-700 font-bold" : "bg-gray-50 text-gray-600"}`}>
                              <span className={`w-4 h-4 rounded text-xs font-black flex items-center justify-center ${q.bonneReponse === l ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>{l}</span>
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.type === "Vrai/Faux" && (
                      <p className="mt-2 text-xs font-bold text-emerald-600">✓ Réponse : {q.bonneReponse}</p>
                    )}
                    {(q.type === "Identification" || q.type === "Association") && (
                      <p className="mt-2 text-xs font-bold text-emerald-600">✓ {q.bonneReponse}</p>
                    )}
                    {q.explication && (
                      <p className="mt-2 text-xs text-gray-400 italic">💡 {q.explication.slice(0, 100)}{q.explication.length > 100 ? "…" : ""}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">Créée {q.createdAt}</p>
                  </div>
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-gray-500 font-semibold">Aucune question trouvée</p>
                    <button onClick={() => setActiveTab("create")} className="mt-4 px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                      Créer une question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Import CSV ────────────────────────────────────── */}
          {activeTab === "import" && (
            <div className="p-6 max-w-3xl">
              {csvImported && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <span className="text-emerald-500 text-xl">✅</span>
                  <p className="font-bold text-emerald-800 text-sm">Questions importées ! Redirection vers vos questions…</p>
                </div>
              )}

              {/* Template download */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📄</div>
                  <div className="flex-1">
                    <h3 className="font-black text-indigo-900 text-sm mb-1">Modèle de fichier CSV</h3>
                    <p className="text-xs text-indigo-700 mb-3">
                      Téléchargez le modèle pour structurer correctement vos questions. Colonnes requises :
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {["matiere", "theme", "niveau", "type", "enonce", "choix_a", "choix_b", "choix_c", "choix_d", "bonne_reponse", "explication", "difficulte"].map((col) => (
                        <code key={col} className="text-xs bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded font-mono">{col}</code>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "modele_questions_nekh_xel.csv"; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                      ⬇ Télécharger le modèle CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Drop zone */}
              {!csvRows && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"}`}>
                  <p className="text-5xl mb-4">📂</p>
                  <p className="font-black text-gray-800 mb-1">Glissez-déposez votre fichier CSV ici</p>
                  <p className="text-sm text-gray-400 mb-4">ou cliquez pour parcourir vos fichiers</p>
                  <span className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                    Choisir un fichier
                  </span>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileRead(f); }} />
                  {csvError && <p className="mt-4 text-sm text-red-600 font-semibold">⚠ {csvError}</p>}
                </div>
              )}

              {/* Preview */}
              {csvRows && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-gray-900">Aperçu du fichier</h3>
                      <p className="text-sm text-gray-500">{csvRows.length - 1} question(s) détectée(s)</p>
                    </div>
                    <button onClick={() => { setCsvRows(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-sm text-gray-400 hover:text-gray-600 font-semibold">
                      Changer de fichier
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {csvRows[0].map((h, i) => (
                            <th key={i} className="text-left px-3 py-2.5 text-gray-500 font-bold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {csvRows.slice(1, 6).map((row, ri) => (
                          <tr key={ri} className="hover:bg-gray-50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{cell || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvRows.length > 6 && (
                      <p className="text-xs text-gray-400 text-center py-2">+{csvRows.length - 6} lignes non affichées</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleConfirmImport}
                      className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl transition-all shadow-sm text-sm">
                      ✅ Importer {csvRows.length - 1} question(s)
                    </button>
                    <button onClick={() => { setCsvRows(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="px-5 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Format guide */}
              <div className="mt-8 bg-gray-50 rounded-2xl p-5">
                <h3 className="text-sm font-black text-gray-700 mb-3">📌 Guide du format CSV</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <p><strong>Types supportés :</strong> QCM, Vrai/Faux, Identification, Association</p>
                  <p><strong>Pour QCM :</strong> remplissez choix_a, choix_b (min.), choix_c, choix_d, puis bonne_reponse = A / B / C / D</p>
                  <p><strong>Pour Vrai/Faux :</strong> laissez les colonnes choix vides, bonne_reponse = Vrai ou Faux</p>
                  <p><strong>Pour Identification :</strong> bonne_reponse = la réponse attendue (séparée par virgule si plusieurs)</p>
                  <p><strong>Difficulté :</strong> Facile, Moyen ou Difficile</p>
                  <p><strong>Encodage :</strong> UTF-8 pour les accents (é, à, ê…)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
