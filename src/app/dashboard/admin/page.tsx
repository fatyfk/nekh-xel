"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

// ── Types ────────────────────────────────────────────────────
type UserRole   = "student" | "teacher" | "parent" | "admin";
type UserStatus = "actif" | "suspendu" | "en_attente";

type User = {
  id: string; firstName: string; lastName: string;
  email: string; phone: string; role: UserRole;
  school: string; status: UserStatus; createdAt: string; lastLogin: string;
};

type Theme = { id: string; name: string; level: string; questionsCount: number };
type Subject = { id: string; name: string; icon: string; color: string; themes: Theme[] };

type PendingQ = {
  id: string; subject: string; theme: string; type: string;
  enonce: string; submittedBy: string; submittedAt: string;
  status: "pending" | "approved" | "rejected";
};

type LogEntry = {
  id: string; action: string; user: string; detail: string;
  timestamp: string; category: "user" | "question" | "session" | "system" | "security";
};

// ── Données ──────────────────────────────────────────────────
const ADMIN = { firstName: "Abdoulaye", lastName: "Sow" };

const KPI_STATS = [
  { label: "Élèves actifs",    value: "10 284", icon: "👨‍🎓", change: "+127 ce mois",    color: "bg-indigo-50 text-indigo-700"   },
  { label: "Enseignants",      value: "342",    icon: "👨‍🏫", change: "+8 ce mois",      color: "bg-emerald-50 text-emerald-700" },
  { label: "Parents inscrits", value: "7 891",  icon: "👪",  change: "+94 ce mois",     color: "bg-amber-50 text-amber-700"    },
  { label: "Quiz complétés",   value: "48 320", icon: "📝",  change: "cette semaine",   color: "bg-violet-50 text-violet-700"  },
  { label: "Écoles",           value: "156",    icon: "🏫",  change: "+2 ce trimestre", color: "bg-rose-50 text-rose-700"      },
  { label: "Score moyen",      value: "79%",    icon: "🎯",  change: "+2% ce mois",     color: "bg-cyan-50 text-cyan-700"      },
];

const INIT_USERS: User[] = [
  { id: "1", firstName: "Aminata",  lastName: "Sarr",    email: "aminata.sarr@nekh.sn",   phone: "+221 77 123 45 67", role: "student", school: "Lycée Lamine Guèye",      status: "actif",      createdAt: "23 Mai 2026", lastLogin: "Aujourd'hui"  },
  { id: "2", firstName: "Ibrahima", lastName: "Diop",    email: "i.diop@nekh.sn",          phone: "+221 76 234 56 78", role: "teacher", school: "École El Hadj Malick Sy", status: "actif",      createdAt: "22 Mai 2026", lastLogin: "Aujourd'hui"  },
  { id: "3", firstName: "Fatou",    lastName: "Seck",    email: "fatou.seck@gmail.com",    phone: "+221 78 345 67 89", role: "parent",  school: "CEM Blaise Diagne",       status: "actif",      createdAt: "21 Mai 2026", lastLogin: "Hier"         },
  { id: "4", firstName: "Moussa",   lastName: "Konaté",  email: "m.konate@nekh.sn",        phone: "+221 77 456 78 90", role: "student", school: "Lycée Lamine Guèye",      status: "actif",      createdAt: "20 Mai 2026", lastLogin: "Hier"         },
  { id: "5", firstName: "Aïssatou", lastName: "Fall",    email: "a.fall@nekh.sn",           phone: "+221 70 567 89 01", role: "teacher", school: "École Mariama Bâ",        status: "en_attente", createdAt: "19 Mai 2026", lastLogin: "Jamais"       },
  { id: "6", firstName: "Seydou",   lastName: "Gaye",    email: "s.gaye@nekh.sn",           phone: "+221 76 678 90 12", role: "student", school: "CEM Blaise Diagne",       status: "suspendu",   createdAt: "15 Mai 2026", lastLogin: "Il y a 8j"   },
  { id: "7", firstName: "Rokhaya",  lastName: "Ndiaye",  email: "r.ndiaye@nekh.sn",         phone: "+221 77 789 01 23", role: "teacher", school: "Lycée John F. Kennedy",   status: "en_attente", createdAt: "10 Mai 2026", lastLogin: "Jamais"       },
  { id: "8", firstName: "Cheikh",   lastName: "Ba",      email: "cheikh.ba@gmail.com",      phone: "+221 78 890 12 34", role: "parent",  school: "Lycée Lamine Guèye",      status: "actif",      createdAt: "8 Mai 2026",  lastLogin: "Il y a 2j"   },
];

const INIT_SUBJECTS: Subject[] = [
  { id: "1", name: "Histoire",          icon: "🏛️", color: "bg-amber-100 text-amber-700",
    themes: [
      { id: "t1", name: "Empires africains précoloniaux", level: "CM1", questionsCount: 24 },
      { id: "t2", name: "La colonisation",                level: "CM2", questionsCount: 18 },
      { id: "t3", name: "L'indépendance du Sénégal",      level: "6ème", questionsCount: 12 },
    ]},
  { id: "2", name: "Géographie",        icon: "🌍", color: "bg-emerald-100 text-emerald-700",
    themes: [
      { id: "t4", name: "Les régions du Sénégal",  level: "CM1", questionsCount: 20 },
      { id: "t5", name: "Les fleuves",              level: "CM2", questionsCount: 15 },
      { id: "t6", name: "Carte de l'Afrique",       level: "6ème", questionsCount: 10 },
    ]},
  { id: "3", name: "Instruction civique", icon: "⚖️", color: "bg-violet-100 text-violet-700",
    themes: [
      { id: "t7", name: "La Constitution sénégalaise", level: "6ème", questionsCount: 14 },
      { id: "t8", name: "Les droits de l'enfant",      level: "CM2", questionsCount: 11 },
    ]},
  { id: "4", name: "Calcul mental",    icon: "🔢", color: "bg-pink-100 text-pink-700",
    themes: [
      { id: "t9",  name: "Les tables de multiplication", level: "CM1", questionsCount: 30 },
      { id: "t10", name: "Les fractions",                level: "CM2", questionsCount: 22 },
    ]},
];

const PENDING_QUESTIONS: PendingQ[] = [
  { id: "q1", subject: "Histoire",          theme: "Empires africains", type: "QCM",        enonce: "Quelle ville était la capitale de l'Empire du Mali au XIVe siècle ?", submittedBy: "M. Ibrahima Diop", submittedAt: "Aujourd'hui 09:14", status: "pending" },
  { id: "q2", subject: "Géographie",        theme: "Fleuves du Sénégal", type: "Vrai/Faux", enonce: "Le fleuve Casamance se jette dans l'Atlantique.",                    submittedBy: "Mme Aïssatou Fall", submittedAt: "Hier 14:32",        status: "pending" },
  { id: "q3", subject: "Instruction civique", theme: "Constitution",    type: "QCM",         enonce: "En quelle année le Sénégal a-t-il obtenu son indépendance ?",         submittedBy: "M. Ousmane Ndiaye", submittedAt: "Il y a 2j",         status: "pending" },
  { id: "q4", subject: "Calcul mental",     theme: "Fractions",         type: "Identification", enonce: "Calculez : 3/4 + 1/4 = ?",                                       submittedBy: "Mme Rokhaya Ndiaye", submittedAt: "Il y a 2j",        status: "pending" },
  { id: "q5", subject: "Histoire",          theme: "La colonisation",   type: "QCM",         enonce: "Quel pays a colonisé le Sénégal ?",                                  submittedBy: "M. Ibrahima Diop", submittedAt: "Il y a 3j",         status: "pending" },
];

const ACTIVITY_LOG: LogEntry[] = [
  { id: "l1",  action: "Connexion admin",           user: "Abdoulaye Sow",    detail: "Connexion depuis Dakar",                category: "security", timestamp: "Aujourd'hui 08:00" },
  { id: "l2",  action: "Question approuvée",        user: "Abdoulaye Sow",    detail: "QCM – Empires africains (Histoire)",     category: "question", timestamp: "Aujourd'hui 08:32" },
  { id: "l3",  action: "Nouvel utilisateur",        user: "Système",          detail: "Aminata Sarr – Élève – Lycée Lamine",   category: "user",     timestamp: "Aujourd'hui 09:15" },
  { id: "l4",  action: "Compte suspendu",           user: "Abdoulaye Sow",    detail: "Seydou Gaye – violation des règles",    category: "security", timestamp: "Aujourd'hui 10:00" },
  { id: "l5",  action: "Matière modifiée",          user: "Abdoulaye Sow",    detail: "Ajout thème : Accord de l'adjectif",   category: "system",   timestamp: "Hier 16:45"        },
  { id: "l6",  action: "Sauvegarde réussie",        user: "Système",          detail: "Backup automatique 02:00",              category: "system",   timestamp: "Hier 02:00"        },
  { id: "l7",  action: "Session créée",             user: "M. Ousmane Ndiaye", detail: "Révision – Géographie CM1-A",          category: "session",  timestamp: "Il y a 2j 09:30"  },
  { id: "l8",  action: "Question rejetée",          user: "Abdoulaye Sow",    detail: "Vrai/Faux – Sciences (énoncé ambigu)",  category: "question", timestamp: "Il y a 2j 11:15"  },
  { id: "l9",  action: "Enseignant validé",         user: "Abdoulaye Sow",    detail: "Mme Rokhaya Ndiaye – compte activé",   category: "user",     timestamp: "Il y a 3j 14:20"  },
  { id: "l10", action: "Mise à jour plateforme",    user: "Système",          detail: "Version v2.4.1 installée",             category: "system",   timestamp: "Il y a 4j 02:00"  },
];

const ALERTS = [
  { type: "warning", msg: "6 comptes enseignants en attente de validation", action: "Valider" },
  { type: "info",    msg: "5 questions soumises attendent votre validation", action: "Voir"    },
  { type: "success", msg: "Sauvegarde automatique réussie (23/05 02:00)",   action: "OK"       },
];

const ROLE_CFG: Record<UserRole, { label: string; color: string }> = {
  student: { label: "Élève",      color: "bg-indigo-100 text-indigo-700"   },
  teacher: { label: "Enseignant", color: "bg-emerald-100 text-emerald-700" },
  parent:  { label: "Parent",     color: "bg-amber-100 text-amber-700"     },
  admin:   { label: "Admin",      color: "bg-red-100 text-red-700"         },
};

const STATUS_CFG: Record<UserStatus, { label: string; color: string }> = {
  actif:      { label: "Actif",       color: "bg-emerald-100 text-emerald-700" },
  suspendu:   { label: "Suspendu",    color: "bg-red-100 text-red-700"         },
  en_attente: { label: "En attente",  color: "bg-amber-100 text-amber-700"     },
};

const LOG_ICONS: Record<LogEntry["category"], string> = {
  user:     "👤", question: "📝", session: "🎯", system: "⚙️", security: "🔒",
};
const LOG_COLORS: Record<LogEntry["category"], string> = {
  user:     "bg-indigo-100 text-indigo-700",
  question: "bg-violet-100 text-violet-700",
  session:  "bg-emerald-100 text-emerald-700",
  system:   "bg-gray-100 text-gray-600",
  security: "bg-red-100 text-red-700",
};

type Tab = "apercu" | "utilisateurs" | "matieres" | "validation" | "journal";

type UserForm = {
  firstName: string; lastName: string; email: string; phone: string;
  role: UserRole; school: string; status: UserStatus;
};

const EMPTY_USER_FORM: UserForm = {
  firstName: "", lastName: "", email: "", phone: "",
  role: "student", school: "", status: "actif",
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("apercu");

  // Users state
  const [users, setUsers] = useState<User[]>(INIT_USERS);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>(INIT_SUBJECTS);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [newTheme, setNewTheme] = useState<Record<string, { name: string; level: string }>>({});

  // Questions validation state
  const [questions, setQuestions] = useState<PendingQ[]>(PENDING_QUESTIONS);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Log filter
  const [logFilter, setLogFilter] = useState<LogEntry["category"] | "all">("all");

  // ── Users handlers ──────────────────────────────────────────
  const openAddUser = () => { setEditingUser(null); setUserForm(EMPTY_USER_FORM); setShowUserModal(true); };
  const openEditUser = (u: User) => { setEditingUser(u); setUserForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, role: u.role, school: u.school, status: u.status }); setShowUserModal(true); };

  const saveUser = () => {
    if (!userForm.firstName || !userForm.email) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...userForm } : u));
    } else {
      const newUser: User = { id: Date.now().toString(), ...userForm, createdAt: "À l'instant", lastLogin: "Jamais" };
      setUsers((prev) => [newUser, ...prev]);
    }
    setShowUserModal(false);
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "actif" ? "suspendu" : "actif" } : u));
  };

  const filteredUsers = users.filter((u) =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (`${u.firstName} ${u.lastName} ${u.email} ${u.school}`.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // ── Subject handlers ────────────────────────────────────────
  const addTheme = (subjectId: string) => {
    const t = newTheme[subjectId];
    if (!t?.name?.trim()) return;
    const theme: Theme = { id: Date.now().toString(), name: t.name, level: t.level || "CM1", questionsCount: 0 };
    setSubjects((prev) => prev.map((s) => s.id === subjectId ? { ...s, themes: [...s.themes, theme] } : s));
    setNewTheme((prev) => ({ ...prev, [subjectId]: { name: "", level: "CM1" } }));
  };

  const deleteTheme = (subjectId: string, themeId: string) => {
    setSubjects((prev) => prev.map((s) => s.id === subjectId ? { ...s, themes: s.themes.filter((t) => t.id !== themeId) } : s));
  };

  // ── Question handlers ───────────────────────────────────────
  const approveQuestion = (id: string) => setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, status: "approved" as const } : q));
  const rejectQuestion  = (id: string) => { setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, status: "rejected" as const } : q)); setRejectId(null); setRejectReason(""); };

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  // ── Log helpers ─────────────────────────────────────────────
  const filteredLog = logFilter === "all" ? ACTIVITY_LOG : ACTIVITY_LOG.filter((l) => l.category === logFilter);

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white transition";
  const labelCls = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

  const TABS: { key: Tab; icon: string; label: string; badge?: number }[] = [
    { key: "apercu",       icon: "🏠", label: "Aperçu"         },
    { key: "utilisateurs", icon: "👥", label: "Utilisateurs", badge: users.filter((u) => u.status === "en_attente").length },
    { key: "matieres",     icon: "📚", label: "Matières"       },
    { key: "validation",   icon: "✅", label: "Validation",   badge: pendingCount },
    { key: "journal",      icon: "📋", label: "Journal"        },
  ];

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
            { href: "/settings",        label: "Paramètres",      icon: "⚙️" },
          ].map(({ href, label, icon }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
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

      {/* User modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-900">{editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h2>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Prénom *</label><input type="text" value={userForm.firstName} onChange={(e) => setUserForm((p) => ({ ...p, firstName: e.target.value }))} className={inputCls} placeholder="Fatou" /></div>
                <div><label className={labelCls}>Nom *</label><input type="text" value={userForm.lastName} onChange={(e) => setUserForm((p) => ({ ...p, lastName: e.target.value }))} className={inputCls} placeholder="Diallo" /></div>
              </div>
              <div><label className={labelCls}>Email *</label><input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="exemple@nekh.sn" /></div>
              <div><label className={labelCls}>Téléphone</label><input type="tel" value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+221 77 XXX XX XX" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rôle</label>
                  <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as UserRole }))} className={inputCls}>
                    <option value="student">Élève</option>
                    <option value="teacher">Enseignant</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <select value={userForm.status} onChange={(e) => setUserForm((p) => ({ ...p, status: e.target.value as UserStatus }))} className={inputCls}>
                    <option value="actif">Actif</option>
                    <option value="en_attente">En attente</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>École</label><input type="text" value={userForm.school} onChange={(e) => setUserForm((p) => ({ ...p, school: e.target.value }))} className={inputCls} placeholder="Lycée Lamine Guèye" /></div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={saveUser} disabled={!userForm.firstName || !userForm.email}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
                {editingUser ? "Enregistrer les modifications" : "Créer l'utilisateur"}
              </button>
              <button onClick={() => setShowUserModal(false)} className="px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h3 className="font-black text-gray-900 text-lg mb-2">Supprimer cet utilisateur ?</h3>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible. Toutes les données associées seront perdues.</p>
            <div className="flex gap-3">
              <button onClick={() => { setUsers((prev) => prev.filter((u) => u.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm">
                Supprimer
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:ml-64 flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-black text-gray-900">Administration NEKH XËL</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Bonjour {ADMIN.firstName} · Dernière mise à jour : à l&apos;instant</p>
            </div>
          </div>
          <button onClick={openAddUser} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors">
            + Ajouter utilisateur
          </button>
        </div>

        <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-auto">
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPI_STATS.map(({ label, value, icon, change, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-lg mb-3`}>{icon}</div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-tight">{label}</p>
                <p className="text-xs text-emerald-500 font-medium mt-1">↑ {change}</p>
              </div>
            ))}
          </div>

          {/* Alertes */}
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${a.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : a.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                <span>{a.type === "warning" ? "⚠️" : a.type === "info" ? "ℹ️" : "✅"}</span>
                <span className="flex-1 font-medium">{a.msg}</span>
                <button onClick={() => { if (a.type === "info") setTab("validation"); else if (a.type === "warning") setTab("utilisateurs"); }}
                  className="text-xs font-bold underline underline-offset-2 flex-shrink-0">{a.action}</button>
              </div>
            ))}
          </div>

          {/* Tabs container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map(({ key, icon, label, badge }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors relative flex-shrink-0 ${tab === key ? "text-slate-800 border-b-2 border-slate-700 bg-slate-50/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <span>{icon}</span>{label}
                  {badge !== undefined && badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab Aperçu ─────────────────────────────── */}
            {tab === "apercu" && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Derniers utilisateurs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-black text-gray-900">👥 Nouveaux utilisateurs</h2>
                      <button onClick={() => setTab("utilisateurs")} className="text-xs text-slate-600 font-semibold hover:underline">Voir tout →</button>
                    </div>
                    <div className="space-y-2">
                      {INIT_USERS.slice(0, 5).map((u) => {
                        const rc = ROLE_CFG[u.role];
                        const sc = STATUS_CFG[u.status];
                        return (
                          <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-400 truncate">{u.school}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${rc.color}`}>{rc.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${sc.color}`}>{sc.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contenu plateforme */}
                  <div>
                    <h2 className="font-black text-gray-900 mb-4">📚 Contenu de la plateforme</h2>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        { label: "Questions publiées", value: "1 240", icon: "📝", color: "text-indigo-600" },
                        { label: "En attente valid.", value: pendingCount.toString(), icon: "⏳", color: "text-amber-600" },
                        { label: "Matières actives",  value: subjects.length.toString(), icon: "📚", color: "text-emerald-600" },
                        { label: "Thèmes couverts",   value: subjects.reduce((n, s) => n + s.themes.length, 0).toString(), icon: "🏷️", color: "text-violet-600" },
                      ].map(({ label, value, icon, color }) => (
                        <div key={label} className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                          <span className="text-2xl">{icon}</span>
                          <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Top écoles */}
                    <h3 className="text-sm font-black text-gray-900 mb-3">🏆 Top écoles</h3>
                    <div className="space-y-2">
                      {[
                        { name: "Lycée Lamine Guèye",      region: "Dakar",    score: 84, rank: 1 },
                        { name: "École El Hadj Malick Sy", region: "Thiès",    score: 81, rank: 2 },
                        { name: "École Mariama Bâ",         region: "Rufisque", score: 79, rank: 3 },
                      ].map((s) => (
                        <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          <span className="text-base">{["🥇", "🥈", "🥉"][s.rank - 1]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.region}</p>
                          </div>
                          <span className={`text-sm font-black ${s.score >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{s.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab Utilisateurs ────────────────────────── */}
            {tab === "utilisateurs" && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Rechercher un utilisateur…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
                  </div>
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="all">Tous les rôles</option>
                    <option value="student">Élèves</option>
                    <option value="teacher">Enseignants</option>
                    <option value="parent">Parents</option>
                    <option value="admin">Admins</option>
                  </select>
                  <button onClick={openAddUser} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0">
                    + Ajouter
                  </button>
                </div>

                <p className="text-xs text-gray-400 mb-3">{filteredUsers.length} utilisateur(s) trouvé(s)</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Utilisateur</th>
                        <th className="text-left px-3 py-3">Rôle</th>
                        <th className="text-left px-3 py-3 hidden sm:table-cell">École</th>
                        <th className="text-left px-3 py-3 hidden md:table-cell">Dernière co.</th>
                        <th className="text-left px-3 py-3">Statut</th>
                        <th className="text-right px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map((u) => {
                        const rc = ROLE_CFG[u.role];
                        const sc = STATUS_CFG[u.status];
                        return (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-700 flex-shrink-0">
                                  {u.firstName[0]}{u.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
                            </td>
                            <td className="px-3 py-3 hidden sm:table-cell">
                              <span className="text-xs text-gray-500 truncate max-w-[130px] block">{u.school}</span>
                            </td>
                            <td className="px-3 py-3 hidden md:table-cell text-xs text-gray-400">{u.lastLogin}</td>
                            <td className="px-3 py-3">
                              <button onClick={() => toggleStatus(u.id)} className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-opacity hover:opacity-80 ${sc.color}`}>
                                {sc.label}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEditUser(u)} className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-gray-500 font-semibold">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Matières & Thèmes ──────────────────── */}
            {tab === "matieres" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-black text-gray-900">📚 Matières et thèmes</h2>
                  <p className="text-sm text-gray-400">{subjects.length} matières · {subjects.reduce((n, s) => n + s.themes.length, 0)} thèmes</p>
                </div>
                {subjects.map((subject) => {
                  const isOpen = expandedSubject === subject.id;
                  return (
                    <div key={subject.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <button onClick={() => setExpandedSubject(isOpen ? null : subject.id)}
                        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-2xl">{subject.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="font-black text-gray-900">{subject.name}</p>
                          <p className="text-xs text-gray-400">{subject.themes.length} thème(s)</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${subject.color}`}>
                          {subject.themes.reduce((n, t) => n + t.questionsCount, 0)} questions
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-3">
                          {subject.themes.map((theme) => (
                            <div key={theme.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800">{theme.name}</p>
                                <div className="flex gap-2 mt-0.5">
                                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{theme.level}</span>
                                  <span className="text-xs text-gray-400">{theme.questionsCount} questions</span>
                                </div>
                              </div>
                              <button onClick={() => deleteTheme(subject.id, theme.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}

                          {/* Ajouter un thème */}
                          <div className="flex gap-2 pt-1">
                            <input type="text" placeholder="Nouveau thème…"
                              value={newTheme[subject.id]?.name ?? ""}
                              onChange={(e) => setNewTheme((p) => ({ ...p, [subject.id]: { ...p[subject.id], name: e.target.value } }))}
                              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
                            <select
                              value={newTheme[subject.id]?.level ?? "CM1"}
                              onChange={(e) => setNewTheme((p) => ({ ...p, [subject.id]: { ...p[subject.id], level: e.target.value } }))}
                              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none">
                              {["CI","CP","CE1","CE2","CM1","CM2","6ème","5ème"].map((l) => <option key={l}>{l}</option>)}
                            </select>
                            <button onClick={() => addTheme(subject.id)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0">
                              + Ajouter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Tab Validation questions ───────────────── */}
            {tab === "validation" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-black text-gray-900">✅ Validation des questions</h2>
                  <p className="text-sm text-gray-400">{pendingCount} en attente · {questions.filter((q) => q.status === "approved").length} approuvées · {questions.filter((q) => q.status === "rejected").length} rejetées</p>
                </div>

                <div className="flex gap-3 flex-wrap mb-2">
                  {[
                    { key: "pending",  label: `En attente (${pendingCount})`,                                                bg: "bg-amber-50 border-amber-200 text-amber-700" },
                    { key: "approved", label: `Approuvées (${questions.filter((q) => q.status === "approved").length})`,  bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                    { key: "rejected", label: `Rejetées (${questions.filter((q) => q.status === "rejected").length})`,    bg: "bg-red-50 border-red-200 text-red-700" },
                  ].map(({ key, label, bg }) => (
                    <div key={key} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${bg}`}>{label}</div>
                  ))}
                </div>

                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className={`border rounded-2xl overflow-hidden transition-all ${q.status === "pending" ? "border-gray-200" : q.status === "approved" ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/20"}`}>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{q.subject}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{q.theme}</span>
                            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{q.type}</span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${q.status === "pending" ? "bg-amber-100 text-amber-700" : q.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {q.status === "pending" ? "⏳ En attente" : q.status === "approved" ? "✅ Approuvée" : "❌ Rejetée"}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-gray-900 mb-3 leading-relaxed">{q.enonce}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Par : <strong className="text-gray-600">{q.submittedBy}</strong></span>
                          <span>📅 {q.submittedAt}</span>
                        </div>

                        {q.status === "pending" && (
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => approveQuestion(q.id)}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors">
                              ✅ Approuver et publier
                            </button>
                            <button onClick={() => setRejectId(q.id)}
                              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors">
                              ❌ Rejeter
                            </button>
                          </div>
                        )}

                        {rejectId === q.id && (
                          <div className="mt-3 space-y-2">
                            <input type="text" placeholder="Motif du rejet (optionnel)…" value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
                            <div className="flex gap-2">
                              <button onClick={() => rejectQuestion(q.id)} className="flex-1 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors">Confirmer le rejet</button>
                              <button onClick={() => setRejectId(null)} className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50">Annuler</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab Journal d'activité ─────────────────── */}
            {tab === "journal" && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h2 className="font-black text-gray-900">📋 Journal d&apos;activité</h2>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "user", "question", "session", "system", "security"] as const).map((cat) => (
                      <button key={cat} onClick={() => setLogFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${logFilter === cat ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {cat === "all" ? "Tous" : LOG_ICONS[cat] + " " + cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${LOG_COLORS[log.category]}`}>
                        {LOG_ICONS[log.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900">{log.action}</p>
                          <span className="text-xs text-gray-400 flex-shrink-0">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Par : <span className="font-semibold text-gray-600">{log.user}</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLog.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-gray-500 font-semibold">Aucune activité dans cette catégorie</p>
                  </div>
                )}

                <div className="mt-5 p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-gray-500">{filteredLog.length} entrée(s) affichée(s)</p>
                  <button className="text-xs text-slate-600 font-bold hover:underline">⬇ Exporter CSV</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
