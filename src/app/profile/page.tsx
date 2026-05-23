"use client";

import Link from "next/link";
import { useState } from "react";

const tabs = ["Aperçu", "Mes informations", "Sécurité", "Notifications"];

const badges = [
  { icon: "🏅", label: "Français maîtrisé", desc: "Niveau intermédiaire validé", date: "12 mai 2026" },
  { icon: "🔥", label: "Série de 7 jours", desc: "7 jours consécutifs d'étude", date: "18 mai 2026" },
  { icon: "🎯", label: "Score parfait", desc: "100% à un quiz", date: "20 mai 2026" },
  { icon: "🚀", label: "Premier cours", desc: "Cours complété pour la 1ère fois", date: "3 mai 2026" },
  { icon: "⚡", label: "Rapide comme l'éclair", desc: "Quiz complété en moins de 2 min", date: "15 mai 2026" },
  { icon: "📚", label: "Lecteur assidu", desc: "10 cours suivis", date: "22 mai 2026" },
];

const activity = [
  { label: "Lun", value: 45 },
  { label: "Mar", value: 80 },
  { label: "Mer", value: 30 },
  { label: "Jeu", value: 90 },
  { label: "Ven", value: 60 },
  { label: "Sam", value: 20 },
  { label: "Dim", value: 70 },
];

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/courses", label: "Mes cours", icon: "📚" },
  { href: "#", label: "Exercices", icon: "✏️" },
  { href: "#", label: "Résultats", icon: "📊" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "#", label: "Paramètres", icon: "⚙️" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Aperçu");
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon }) => (
            <Link key={label} href={href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">F</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-700 truncate">Fatou Diallo</p>
              <p className="text-xs text-indigo-400 truncate">Voir le profil</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Contenu */}
      <div className="ml-64 flex-1">
        {/* Bandeau profil */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-10 pt-10 pb-0">
          <div className="flex items-end gap-6 pb-0">
            <div className="relative mb-[-2.5rem]">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-indigo-700 font-extrabold text-3xl">
                F
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-white text-xs hover:bg-indigo-700 transition-colors">
                ✎
              </button>
            </div>
            <div className="pb-4 flex-1">
              <h1 className="text-2xl font-extrabold text-white">Fatou Diallo</h1>
              <p className="text-indigo-200 text-sm">Étudiante · Inscrite depuis mai 2026</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="mb-4 px-5 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors border border-white/30"
            >
              {editMode ? "✓ Sauvegarder" : "✎ Modifier le profil"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
                  activeTab === tab
                    ? "bg-gray-50 text-indigo-700"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="px-10 py-8">

          {/* ── Aperçu ── */}
          {activeTab === "Aperçu" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Colonne principale */}
              <div className="col-span-2 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Cours suivis", value: "12", icon: "📚" },
                    { label: "Exercices", value: "84", icon: "✅" },
                    { label: "Score moyen", value: "87%", icon: "🎯" },
                    { label: "Jours actifs", value: "18", icon: "🔥" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                      <div className="text-2xl mb-1">{icon}</div>
                      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Activité hebdomadaire */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-5">Activité cette semaine</h2>
                  <div className="flex items-end gap-3 h-28">
                    {activity.map(({ label, value }) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-indigo-500 rounded-lg transition-all"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-gray-900">Mes badges</h2>
                    <span className="text-xs text-indigo-600 font-medium">{badges.length} obtenus</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map(({ icon, label, desc, date }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
                        <span className="text-2xl mt-0.5">{icon}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                          <p className="text-xs text-indigo-400 mt-1">{date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-5">
                {/* Infos rapides */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Informations</h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      { label: "E-mail", value: "fatyfk82@gmail.com" },
                      { label: "Rôle", value: "Étudiante" },
                      { label: "Niveau", value: "Intermédiaire" },
                      { label: "Langue", value: "Français" },
                      { label: "Fuseau", value: "UTC+0 (Dakar)" },
                    ].map(({ label, value }) => (
                      <li key={label} className="flex justify-between">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-medium text-gray-700">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Objectif hebdo */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Objectif hebdomadaire</h3>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-extrabold text-indigo-600">5h</span>
                    <span className="text-xs text-gray-400">/ 8h visées</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "62%" }} />
                  </div>
                  <p className="text-xs text-gray-400">62% de l&apos;objectif atteint cette semaine</p>
                </div>

                {/* Cours récent */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Dernier cours</h3>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📐</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Algèbre – Équations</p>
                      <p className="text-xs text-gray-400 mt-0.5">Repris il y a 30 min</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "75%" }} />
                      </div>
                      <p className="text-xs text-indigo-500 mt-1">75% complété</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Mes informations ── */}
          {activeTab === "Mes informations" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Informations personnelles</h2>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Prénom", value: "Fatou", type: "text" },
                    { label: "Nom", value: "Diallo", type: "text" },
                    { label: "Adresse e-mail", value: "fatyfk82@gmail.com", type: "email" },
                    { label: "Téléphone", value: "+221 77 000 00 00", type: "tel" },
                  ].map(({ label, value, type }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type={type}
                        defaultValue={value}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Biographie</label>
                    <textarea
                      defaultValue="Étudiante passionnée par les mathématiques et les sciences. J'utilise NEKH XËL pour préparer mes examens."
                      disabled={!editMode}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Préférences</h2>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Langue", value: "Français" },
                    { label: "Fuseau horaire", value: "UTC+0 (Dakar)" },
                    { label: "Niveau scolaire", value: "Terminale" },
                    { label: "Objectif hebdomadaire", value: "8 heures" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        defaultValue={value}
                        disabled={!editMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Sécurité ── */}
          {activeTab === "Sécurité" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Changer le mot de passe</h2>
                <div className="space-y-4">
                  {["Mot de passe actuel", "Nouveau mot de passe", "Confirmer le nouveau mot de passe"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                    </div>
                  ))}
                  <button className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Mettre à jour
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-1">Authentification à deux facteurs</h2>
                <p className="text-xs text-gray-400 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">2FA par SMS</p>
                    <p className="text-xs text-gray-400">+221 77 ••• •• 00</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full">Désactivé</span>
                </div>
                <button className="mt-4 px-6 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl transition-colors">
                  Activer la 2FA
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-red-600 mb-1">Zone dangereuse</h2>
                <p className="text-xs text-gray-400 mb-4">Ces actions sont irréversibles. Procédez avec précaution.</p>
                <button className="px-6 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "Notifications" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-gray-900">Préférences de notifications</h2>
                {[
                  { label: "Rappels de cours", desc: "Rappels quotidiens pour vos cours en cours", defaultOn: true },
                  { label: "Nouveaux exercices", desc: "Notifié quand de nouveaux exercices sont disponibles", defaultOn: true },
                  { label: "Résultats de quiz", desc: "Résumé de vos résultats après chaque quiz", defaultOn: true },
                  { label: "Messages de l'instructeur", desc: "Notifications pour les nouveaux messages", defaultOn: false },
                  { label: "Promotions et actualités", desc: "Offres spéciales et nouvelles fonctionnalités", defaultOn: false },
                ].map(({ label, desc, defaultOn }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
