"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { logoutAction } from "@/app/actions/auth";

// ── Constants ────────────────────────────────────────────────
const ADMIN = { firstName: "Abdoulaye", lastName: "Sow" };

const VALID_MATIERES = ["francais", "maths", "histoire", "geo", "sciences", "instruction_civique", "orthographe", "conjugaison", "grammaire", "calcul_mental", "culture_generale"];
const VALID_DIFFICULTES = ["facile", "moyen", "difficile"];
const VALID_TYPES = ["qcm", "vrai_faux", "identification", "association"];
const VALID_QCM_REPONSES = ["A", "B", "C", "D"];
const VALID_VRAI_FAUX_REPONSES = ["VRAI", "FAUX"];

const CSV_COLS = ["matiere", "theme", "sous_theme", "competence", "difficulte", "type_question", "enonce", "choix_a", "choix_b", "choix_c", "choix_d", "bonne_reponse", "explication", "source"];

// Mock existing question enoncs to detect duplicates vs the DB
const EXISTING_ENONCS = new Set([
  "Quel est le résultat de 7 × 8 ?",
  "Quel fleuve forme la frontière nord du Sénégal avec la Mauritanie ?",
  "Le Sénégal a obtenu son indépendance le 4 avril 1960.",
]);

// ── Types ────────────────────────────────────────────────────
type RowStatus = "valid" | "error" | "warning" | "duplicate";

type ValidationError = { field: string; message: string };

type ParsedRow = {
  index: number;
  raw: string[];
  data: Record<string, string>;
  status: RowStatus;
  errors: ValidationError[];
  warnings: ValidationError[];
};

type ImportStep = "upload" | "preview" | "report";

type ImportReport = {
  imported: number;
  errors: number;
  duplicates: number;
  errorDetails: { row: number; errors: ValidationError[] }[];
};

// ── CSV Parser ───────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .map((line) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    });
}

// ── Validator ────────────────────────────────────────────────
function validateRow(data: Record<string, string>, allEnoncs: string[], currentIndex: number): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!data.matiere) errors.push({ field: "matiere", message: "Matière obligatoire" });
  else if (!VALID_MATIERES.includes(data.matiere.toLowerCase())) errors.push({ field: "matiere", message: `Matière "${data.matiere}" inconnue. Valeurs : ${VALID_MATIERES.join(", ")}` });

  if (!data.theme) errors.push({ field: "theme", message: "Thème obligatoire" });
  if (!data.enonce) errors.push({ field: "enonce", message: "Énoncé obligatoire" });
  if (!data.explication) errors.push({ field: "explication", message: "Explication obligatoire" });

  if (!data.difficulte) errors.push({ field: "difficulte", message: "Difficulté obligatoire" });
  else if (!VALID_DIFFICULTES.includes(data.difficulte.toLowerCase())) errors.push({ field: "difficulte", message: `Difficulté "${data.difficulte}" invalide. Valeurs : facile, moyen, difficile` });

  if (!data.type_question) errors.push({ field: "type_question", message: "Type de question obligatoire" });
  else if (!VALID_TYPES.includes(data.type_question.toLowerCase())) errors.push({ field: "type_question", message: `Type "${data.type_question}" invalide. Valeurs : qcm, vrai_faux, identification, association` });

  if (!data.bonne_reponse) errors.push({ field: "bonne_reponse", message: "Bonne réponse obligatoire" });

  // Type-specific validation
  const type = data.type_question?.toLowerCase();
  const reponse = data.bonne_reponse?.toUpperCase();

  if (type === "qcm") {
    if (!data.choix_a) errors.push({ field: "choix_a", message: "Le choix A est obligatoire pour un QCM" });
    if (!data.choix_b) errors.push({ field: "choix_b", message: "Le choix B est obligatoire pour un QCM" });
    if (reponse && !VALID_QCM_REPONSES.includes(reponse)) errors.push({ field: "bonne_reponse", message: `Pour un QCM, la réponse doit être A, B, C ou D (reçu : "${data.bonne_reponse}")` });
    if (reponse === "C" && !data.choix_c) errors.push({ field: "choix_c", message: "La réponse est C mais le choix C est vide" });
    if (reponse === "D" && !data.choix_d) errors.push({ field: "choix_d", message: "La réponse est D mais le choix D est vide" });
  }

  if (type === "vrai_faux") {
    if (reponse && !VALID_VRAI_FAUX_REPONSES.includes(reponse)) errors.push({ field: "bonne_reponse", message: `Pour Vrai/Faux, la réponse doit être VRAI ou FAUX (reçu : "${data.bonne_reponse}")` });
  }

  if (type === "identification" || type === "association") {
    if (!data.bonne_reponse) errors.push({ field: "bonne_reponse", message: `La bonne réponse est obligatoire pour le type ${data.type_question}` });
  }

  // Optional warnings
  if (!data.source) warnings.push({ field: "source", message: "Source non renseignée (recommandé)" });
  if (!data.competence) warnings.push({ field: "competence", message: "Compétence non renseignée" });

  // Duplicate within file (same enonce appeared earlier in file)
  const dupeInFile = allEnoncs.slice(0, currentIndex).some((e) => e.trim().toLowerCase() === data.enonce?.trim().toLowerCase());
  if (dupeInFile) errors.push({ field: "enonce", message: "Doublon dans le fichier : cet énoncé apparaît déjà" });

  return { errors, warnings };
}

function computeStatus(errors: ValidationError[], warnings: ValidationError[], enonce: string): RowStatus {
  if (errors.some((e) => e.field === "enonce" && e.message.startsWith("Doublon"))) return "duplicate";
  if (EXISTING_ENONCS.has(enonce?.trim())) return "duplicate";
  if (errors.length > 0) return "error";
  if (warnings.length > 0) return "warning";
  return "valid";
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: RowStatus }) {
  const cfg = {
    valid:     { bg: "bg-emerald-100 text-emerald-700", icon: "✅", label: "Valide"    },
    error:     { bg: "bg-red-100 text-red-700",         icon: "❌", label: "Erreur"    },
    warning:   { bg: "bg-amber-100 text-amber-700",     icon: "⚠️", label: "Attention" },
    duplicate: { bg: "bg-violet-100 text-violet-700",   icon: "🔄", label: "Doublon"  },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AdminImportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<RowStatus | "all">("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── CSV processing ──────────────────────────────────────────
  const processFile = useCallback((text: string, name: string) => {
    const lines = parseCSV(text);
    if (lines.length < 2) { alert("Le fichier CSV est vide ou ne contient pas d'en-tête."); return; }

    const header = lines[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const colCount = CSV_COLS.length;

    if (header.length < colCount) {
      alert(`Le fichier ne contient que ${header.length} colonnes. ${colCount} colonnes attendues.\n\nEn-tête reçu :\n${header.join(", ")}\n\nEn-tête attendu :\n${CSV_COLS.join(", ")}`);
      return;
    }

    const dataLines = lines.slice(1).filter((l) => l.some((c) => c.trim() !== ""));
    const allEnoncs = dataLines.map((l) => l[CSV_COLS.indexOf("enonce")] ?? "");

    const parsed: ParsedRow[] = dataLines.map((raw, i) => {
      const data: Record<string, string> = {};
      CSV_COLS.forEach((col, ci) => { data[col] = raw[ci] ?? ""; });

      const { errors, warnings } = validateRow(data, allEnoncs, i);
      const status = computeStatus(errors, warnings, data.enonce);

      return { index: i + 2, raw, data, status, errors, warnings };
    });

    setFileName(name);
    setRows(parsed);
    setFilterStatus("all");
    setExpandedRow(null);
    setStep("preview");
  }, []);

  const handleFileInput = (file: File) => {
    if (!file.name.endsWith(".csv")) { alert("Veuillez sélectionner un fichier .csv"); return; }
    const reader = new FileReader();
    reader.onload = (e) => processFile(e.target?.result as string, file.name);
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileInput(file);
  }, [processFile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Import ──────────────────────────────────────────────────
  const handleImport = () => {
    const importable = rows.filter((r) => r.status === "valid" || r.status === "warning");
    const errored    = rows.filter((r) => r.status === "error");
    const dupes      = rows.filter((r) => r.status === "duplicate");

    const result: ImportReport = {
      imported: importable.length,
      errors:   errored.length,
      duplicates: dupes.length,
      errorDetails: errored.map((r) => ({ row: r.index, errors: r.errors })),
    };
    setReport(result);
    setStep("report");
  };

  // ── Derived stats ───────────────────────────────────────────
  const counts = {
    valid:     rows.filter((r) => r.status === "valid").length,
    warning:   rows.filter((r) => r.status === "warning").length,
    error:     rows.filter((r) => r.status === "error").length,
    duplicate: rows.filter((r) => r.status === "duplicate").length,
  };
  const importable = counts.valid + counts.warning;
  const filteredRows = filterStatus === "all" ? rows : rows.filter((r) => r.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col fixed h-full z-20 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-6 py-5">
          <Link href="/" className="text-2xl font-black text-white tracking-tight">NEKH XËL</Link>
          <p className="text-slate-400 text-xs mt-0.5">Administration</p>
        </div>
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white font-black text-lg">
              {ADMIN.firstName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{ADMIN.firstName} {ADMIN.lastName}</p>
              <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {[
            { href: "/dashboard/admin", label: "Tableau de bord", icon: "🏠" },
            { href: "/dashboard/admin/import", label: "Import CSV", icon: "📥", active: true },
            { href: "/settings", label: "Paramètres", icon: "⚙️" },
          ].map(({ href, label, icon, active }) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-white/20 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/dashboard/admin" className="hover:text-gray-900 transition-colors">Admin</Link>
            <span>/</span>
            <span className="font-semibold text-gray-900">Import de questions</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="/questions_modele.csv" download className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger le modèle CSV
            </a>
          </div>
        </header>

        <div className="p-6 flex-1">
          {/* Progress stepper */}
          <div className="flex items-center gap-3 mb-8">
            {(["upload", "preview", "report"] as ImportStep[]).map((s, i) => {
              const labels = ["1. Chargement", "2. Prévisualisation", "3. Rapport"];
              const done = (step === "preview" && i === 0) || (step === "report" && i <= 1);
              const active = step === s;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${active ? "bg-slate-800 text-white" : done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    <span>{done ? "✓" : i + 1}</span>
                    <span className="hidden sm:inline">{labels[i]}</span>
                  </div>
                  {i < 2 && <div className={`h-px w-8 ${done || active ? "bg-slate-400" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Upload ─────────────────────────────────── */}
          {step === "upload" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-black text-gray-900 mb-1">Importer des questions</h2>
                <p className="text-sm text-gray-500 mb-6">Chargez un fichier CSV avec les 14 colonnes du modèle. Les questions seront validées avant l'import.</p>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${dragging ? "border-slate-400 bg-slate-50" : "border-gray-200 hover:border-slate-300 hover:bg-gray-50"}`}
                >
                  <div className="text-5xl mb-4">📂</div>
                  <p className="text-base font-bold text-gray-700 mb-1">Glissez votre fichier CSV ici</p>
                  <p className="text-sm text-gray-400 mb-4">ou cliquez pour parcourir vos fichiers</p>
                  <span className="inline-block bg-slate-800 text-white text-sm font-bold px-5 py-2 rounded-xl">Choisir un fichier</span>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileInput(f); }} />
                </div>

                {/* Format reminder */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 mb-2">Colonnes requises (dans cet ordre) :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CSV_COLS.map((col) => (
                      <span key={col} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-mono">{col}</span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    <strong>Types acceptés :</strong> qcm · vrai_faux · identification · association &nbsp;|&nbsp;
                    <strong>Difficultés :</strong> facile · moyen · difficile
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ────────────────────────────────── */}
          {step === "preview" && (
            <div className="space-y-6">
              {/* Summary bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">{fileName}</h2>
                    <p className="text-sm text-gray-500">{rows.length} ligne{rows.length > 1 ? "s" : ""} analysée{rows.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                      <span>✅</span> {counts.valid} valide{counts.valid > 1 ? "s" : ""}
                    </div>
                    {counts.warning > 0 && (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                        <span>⚠️</span> {counts.warning} avertissement{counts.warning > 1 ? "s" : ""}
                      </div>
                    )}
                    {counts.error > 0 && (
                      <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                        <span>❌</span> {counts.error} erreur{counts.error > 1 ? "s" : ""}
                      </div>
                    )}
                    {counts.duplicate > 0 && (
                      <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl text-sm font-bold">
                        <span>🔄</span> {counts.duplicate} doublon{counts.duplicate > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter + actions */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filtre :</span>
                  {(["all", "valid", "warning", "error", "duplicate"] as const).map((f) => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${filterStatus === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {f === "all" ? `Toutes (${rows.length})` : f === "valid" ? `Valides (${counts.valid})` : f === "warning" ? `Attention (${counts.warning})` : f === "error" ? `Erreurs (${counts.error})` : `Doublons (${counts.duplicate})`}
                    </button>
                  ))}
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => { setStep("upload"); setRows([]); setFileName(null); }}
                      className="text-sm font-bold text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                      Changer de fichier
                    </button>
                    <button onClick={handleImport} disabled={importable === 0}
                      className={`flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-xl transition-colors ${importable > 0 ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Importer {importable > 0 ? `${importable} question${importable > 1 ? "s" : ""}` : ""}
                    </button>
                  </div>
                </div>
              </div>

              {/* Rows table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 w-12">#</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Statut</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Matière</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Type</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Difficulté</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 min-w-[280px]">Énoncé</th>
                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 w-20">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRows.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Aucune ligne pour ce filtre.</td></tr>
                      )}
                      {filteredRows.map((row) => {
                        const isExpanded = expandedRow === row.index;
                        const rowBg = row.status === "valid" ? "" : row.status === "warning" ? "bg-amber-50/40" : row.status === "duplicate" ? "bg-violet-50/40" : "bg-red-50/40";
                        return (
                          <>
                            <tr key={row.index} className={`${rowBg} hover:bg-gray-50/60 transition-colors`}>
                              <td className="px-4 py-3 text-xs text-gray-400 font-mono">{row.index}</td>
                              <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                              <td className="px-4 py-3 text-gray-700 font-medium capitalize">{row.data.matiere || <span className="text-red-400 italic text-xs">vide</span>}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">{row.data.type_question || <span className="text-red-400 italic">vide</span>}</span>
                              </td>
                              <td className="px-4 py-3 capitalize text-gray-600 text-xs">{row.data.difficulte}</td>
                              <td className="px-4 py-3 text-gray-800 max-w-xs">
                                <p className="line-clamp-2 text-xs leading-relaxed">{row.data.enonce || <span className="text-red-400 italic">Énoncé manquant</span>}</p>
                              </td>
                              <td className="px-4 py-3">
                                {(row.errors.length > 0 || row.warnings.length > 0) && (
                                  <button onClick={() => setExpandedRow(isExpanded ? null : row.index)}
                                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors">
                                    {isExpanded ? "Masquer" : `Voir (${row.errors.length + row.warnings.length})`}
                                  </button>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${row.index}-detail`} className={rowBg}>
                                <td colSpan={7} className="px-6 pb-4 pt-0">
                                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                                    {row.errors.map((e, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                                        <span className="mt-0.5 shrink-0">❌</span>
                                        <span><strong className="font-bold">{e.field} :</strong> {e.message}</span>
                                      </div>
                                    ))}
                                    {row.warnings.map((w, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                                        <span className="mt-0.5 shrink-0">⚠️</span>
                                        <span><strong className="font-bold">{w.field} :</strong> {w.message}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Report ─────────────────────────────────── */}
          {step === "report" && report && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Hero result */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="text-6xl mb-4">{report.imported > 0 ? "🎉" : "😕"}</div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Import terminé</h2>
                <p className="text-gray-500 text-sm">Voici le récapitulatif de l'opération.</p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
                  <p className="text-4xl font-black text-emerald-700">{report.imported}</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">Question{report.imported > 1 ? "s" : ""} importée{report.imported > 1 ? "s" : ""}</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 text-center border border-red-100">
                  <p className="text-4xl font-black text-red-700">{report.errors}</p>
                  <p className="text-sm font-bold text-red-600 mt-1">Erreur{report.errors > 1 ? "s" : ""} ignorée{report.errors > 1 ? "s" : ""}</p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-5 text-center border border-violet-100">
                  <p className="text-4xl font-black text-violet-700">{report.duplicates}</p>
                  <p className="text-sm font-bold text-violet-600 mt-1">Doublon{report.duplicates > 1 ? "s" : ""} ignoré{report.duplicates > 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Error details */}
              {report.errorDetails.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 text-sm">Lignes en erreur — non importées</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Corrigez ces lignes dans votre fichier et relancez l'import.</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {report.errorDetails.map(({ row, errors }) => (
                      <div key={row} className="px-5 py-3">
                        <p className="text-xs font-bold text-gray-700 mb-1.5">Ligne {row}</p>
                        <div className="space-y-1">
                          {errors.map((e, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                              <span className="shrink-0 mt-0.5">•</span>
                              <span><strong>{e.field} :</strong> {e.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success message */}
              {report.imported > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                  <strong>{report.imported} question{report.imported > 1 ? "s" : ""}</strong> {report.imported > 1 ? "ont été ajoutées" : "a été ajoutée"} à la banque de questions avec le statut <strong>En attente de validation</strong>. Un admin peut les valider depuis le tableau de bord.
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setStep("upload"); setRows([]); setFileName(null); setReport(null); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Importer un autre fichier
                </button>
                <Link href="/dashboard/admin"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-3 rounded-xl transition-colors">
                  Retour au tableau de bord
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
