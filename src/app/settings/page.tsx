"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/courses", label: "Mes cours", icon: "📚" },
  { href: "/exercises", label: "Exercices", icon: "✏️" },
  { href: "/results", label: "Résultats", icon: "📊" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/settings", label: "Paramètres", icon: "⚙️", active: true },
];

const sections = [
  { id: "compte", label: "Compte", icon: "👤" },
  { id: "apparence", label: "Apparence", icon: "🎨" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "confidentialite", label: "Confidentialité", icon: "🔒" },
  { id: "accessibilite", label: "Accessibilité", icon: "♿" },
  { id: "langue", label: "Langue & région", icon: "🌍" },
  { id: "danger", label: "Zone dangereuse", icon: "⚠️" },
];

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? "bg-indigo-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex-1 mr-6">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("compte");
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("indigo");
  const [fontSize, setFontSize] = useState("normal");

  const colors = [
    { id: "indigo", bg: "bg-indigo-600" },
    { id: "violet", bg: "bg-violet-600" },
    { id: "sky", bg: "bg-sky-500" },
    { id: "green", bg: "bg-green-600" },
    { id: "rose", bg: "bg-rose-500" },
    { id: "orange", bg: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar nav */}
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
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">F</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="ml-64 flex-1 flex">
        {/* Menu sections */}
        <div className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-3 fixed left-64 h-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Paramètres</p>
          <nav className="space-y-0.5">
            {sections.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeSection === id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-base">{icon}</span>{label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="ml-56 flex-1 p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {sections.find((s) => s.id === activeSection)?.icon}{" "}
            {sections.find((s) => s.id === activeSection)?.label}
          </h1>
          <p className="text-sm text-gray-400 mb-8">Gérez vos préférences et votre compte.</p>

          {/* ── Compte ── */}
          {activeSection === "compte" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Informations du profil</h2>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold">F</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Fatou Diallo</p>
                    <p className="text-xs text-gray-400">fatyfk82@gmail.com</p>
                    <button className="mt-2 text-xs text-indigo-600 hover:underline font-medium">Changer la photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Prénom", value: "Fatou" },
                    { label: "Nom", value: "Diallo" },
                    { label: "Nom d'utilisateur", value: "fatou_d" },
                    { label: "Téléphone", value: "+221 77 000 00 00" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input defaultValue={value} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Adresse e-mail</label>
                    <input defaultValue="fatyfk82@gmail.com" type="email" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <button className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">Sauvegarder les modifications</button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Sécurité du compte</h2>
                <Row label="Changer le mot de passe" desc="Dernière modification il y a 30 jours">
                  <button className="text-xs text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors">Modifier</button>
                </Row>
                <Row label="Authentification à deux facteurs" desc="Ajouter une couche de sécurité supplémentaire">
                  <Toggle defaultChecked={false} />
                </Row>
                <Row label="Sessions actives" desc="2 appareils connectés">
                  <button className="text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-colors">Déconnecter tout</button>
                </Row>
              </div>
            </div>
          )}

          {/* ── Apparence ── */}
          {activeSection === "apparence" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Thème</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "light", label: "Clair", preview: "bg-white border-gray-200", icon: "☀️" },
                    { id: "dark", label: "Sombre", preview: "bg-gray-900 border-gray-700", icon: "🌙" },
                    { id: "system", label: "Système", preview: "bg-gradient-to-br from-white to-gray-900 border-gray-400", icon: "💻" },
                  ].map(({ id, label, preview, icon }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-full h-16 rounded-lg border ${preview}`} />
                      <span className="text-lg">{icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                      {theme === id && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Couleur d&apos;accentuation</h2>
                <div className="flex gap-3">
                  {colors.map(({ id, bg }) => (
                    <button
                      key={id}
                      onClick={() => setAccentColor(id)}
                      className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center transition-transform hover:scale-110 ${
                        accentColor === id ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                      }`}
                    >
                      {accentColor === id && <span className="text-white text-sm font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Taille du texte</h2>
                <div className="flex gap-3">
                  {["petit", "normal", "grand"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors ${
                        fontSize === size
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {size === "petit" ? "Aa" : size === "normal" ? "Aa" : "Aa"}
                      <br />
                      <span className={`text-xs ${size === "petit" ? "text-xs" : size === "normal" ? "text-sm" : "text-base"}`}>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    </button>
                  ))}
                </div>
                <Row label="Réduire les animations" desc="Désactive les transitions et effets visuels">
                  <Toggle />
                </Row>
                <Row label="Mode compact" desc="Réduit l'espacement entre les éléments">
                  <Toggle />
                </Row>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === "notifications" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Notifications push</h2>
                <Row label="Activer les notifications" desc="Autoriser NEKH XËL à vous envoyer des notifications">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Rappels de cours" desc="Rappels quotidiens pour continuer vos cours">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Exercices disponibles" desc="Nouveaux exercices ajoutés à vos matières">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Résultats de quiz" desc="Résumé après chaque quiz complété">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Messages reçus" desc="Notifications pour les nouveaux messages">
                  <Toggle defaultChecked={false} />
                </Row>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Notifications e-mail</h2>
                <Row label="Résumé hebdomadaire" desc="Rapport de progression chaque lundi">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Nouvelles fonctionnalités" desc="Mises à jour et nouveautés de la plateforme">
                  <Toggle defaultChecked={false} />
                </Row>
                <Row label="Offres et promotions" desc="Réductions sur les cours premium">
                  <Toggle defaultChecked={false} />
                </Row>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Horaire de notifications</h2>
                <Row label="Ne pas déranger" desc="Aucune notification pendant cette période">
                  <Toggle />
                </Row>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
                    <input type="time" defaultValue="22:00" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">À</label>
                    <input type="time" defaultValue="07:00" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Confidentialité ── */}
          {activeSection === "confidentialite" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Visibilité du profil</h2>
                <div className="space-y-3">
                  {[
                    { label: "Public", desc: "Tout le monde peut voir votre profil", id: "public" },
                    { label: "Élèves seulement", desc: "Uniquement les élèves de vos cours", id: "students" },
                    { label: "Privé", desc: "Votre profil n'est visible par personne", id: "private" },
                  ].map(({ label, desc, id }) => (
                    <label key={id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-200 cursor-pointer transition-colors">
                      <input type="radio" name="visibility" defaultChecked={id === "students"} className="accent-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Données & confidentialité</h2>
                <Row label="Partager mes statistiques" desc="Autoriser NEKH XËL à utiliser vos données pour améliorer la plateforme">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Historique d'activité" desc="Conserver l'historique de vos actions sur la plateforme">
                  <Toggle defaultChecked={true} />
                </Row>
                <Row label="Cookies de personnalisation" desc="Utiliser des cookies pour personnaliser votre expérience">
                  <Toggle defaultChecked={false} />
                </Row>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Télécharger mes données</h2>
                <p className="text-xs text-gray-400 mb-4">Obtenez une copie de toutes vos données personnelles stockées sur NEKH XËL.</p>
                <button className="px-5 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-xl transition-colors">
                  Exporter mes données
                </button>
              </div>
            </div>
          )}

          {/* ── Accessibilité ── */}
          {activeSection === "accessibilite" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Vision</h2>
                <Row label="Contraste élevé" desc="Augmente le contraste pour une meilleure lisibilité">
                  <Toggle />
                </Row>
                <Row label="Mode daltonien" desc="Adapte les couleurs pour les personnes daltoniennes">
                  <Toggle />
                </Row>
                <Row label="Texte en gras" desc="Affiche tout le texte en gras">
                  <Toggle />
                </Row>
                <Row label="Sous-titres automatiques" desc="Affiche des sous-titres sur les vidéos de cours">
                  <Toggle defaultChecked={true} />
                </Row>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Interaction</h2>
                <Row label="Clavier uniquement" desc="Naviguer avec uniquement le clavier (sans souris)">
                  <Toggle />
                </Row>
                <Row label="Lecteur d'écran" desc="Optimiser l'interface pour les lecteurs d'écran">
                  <Toggle />
                </Row>
                <Row label="Délai de session prolongé" desc="Augmente le délai avant déconnexion automatique">
                  <Toggle defaultChecked={true} />
                </Row>
              </div>
            </div>
          )}

          {/* ── Langue & région ── */}
          {activeSection === "langue" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Langue de l&apos;interface</h2>
                <div className="space-y-2">
                  {[
                    { code: "fr", label: "Français", flag: "🇫🇷" },
                    { code: "en", label: "English", flag: "🇬🇧" },
                    { code: "ar", label: "العربية", flag: "🇸🇦" },
                    { code: "wo", label: "Wolof", flag: "🇸🇳" },
                  ].map(({ code, label, flag }) => (
                    <label key={code} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-200 cursor-pointer transition-colors">
                      <input type="radio" name="language" defaultChecked={code === "fr"} className="accent-indigo-600" />
                      <span className="text-xl">{flag}</span>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Région & format</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fuseau horaire</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>UTC+0 – Dakar, Abidjan</option>
                      <option>UTC+1 – Paris, Bruxelles</option>
                      <option>UTC+2 – Le Caire, Johannesburg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Format de date</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>JJ/MM/AAAA</option>
                      <option>MM/JJ/AAAA</option>
                      <option>AAAA-MM-JJ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Zone dangereuse ── */}
          {activeSection === "danger" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-red-600 mb-1">Actions irréversibles</h2>
                <p className="text-xs text-gray-400 mb-5">Ces actions ne peuvent pas être annulées. Procédez avec précaution.</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Réinitialiser la progression</p>
                      <p className="text-xs text-gray-400 mt-0.5">Efface toute votre progression dans les cours et exercices</p>
                    </div>
                    <button className="px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 text-xs font-semibold rounded-xl transition-colors flex-shrink-0 ml-4">
                      Réinitialiser
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Désactiver le compte</p>
                      <p className="text-xs text-gray-400 mt-0.5">Suspend votre compte temporairement — réactivable à tout moment</p>
                    </div>
                    <button className="px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 text-xs font-semibold rounded-xl transition-colors flex-shrink-0 ml-4">
                      Désactiver
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200">
                    <div>
                      <p className="text-sm font-semibold text-red-700">Supprimer mon compte</p>
                      <p className="text-xs text-red-400 mt-0.5">Supprime définitivement votre compte et toutes vos données</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0 ml-4">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Se déconnecter</h2>
                <p className="text-xs text-gray-400 mb-4">Vous serez redirigé vers la page de connexion.</p>
                <Link href="/login" className="inline-block px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors">
                  Se déconnecter
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
