// Ce fichier est conservé pour compatibilité.
// La redirection réelle se fait via le middleware et /dashboard/student.
import Link from "next/link";

const stats = [
  { label: "Cours suivis", value: "12", icon: "📚", change: "+2 cette semaine" },
  { label: "Exercices complétés", value: "84", icon: "✅", change: "+11 cette semaine" },
  { label: "Score moyen", value: "87%", icon: "🎯", change: "+3% ce mois" },
  { label: "Temps d'étude", value: "24h", icon: "⏱️", change: "ce mois" },
];

const courses = [
  { title: "Mathématiques – Algèbre", progress: 75, color: "bg-indigo-500", badge: "En cours" },
  { title: "Français – Grammaire", progress: 100, color: "bg-green-500", badge: "Terminé" },
  { title: "Histoire-Géographie", progress: 40, color: "bg-yellow-500", badge: "En cours" },
  { title: "Sciences – Physique", progress: 10, color: "bg-red-400", badge: "Débuté" },
];

const activities = [
  { action: "Exercice complété", detail: "Algèbre – Équations du 2ème degré", time: "Il y a 30 min", icon: "✅" },
  { action: "Nouveau cours démarré", detail: "Sciences – Physique : Les forces", time: "Il y a 2h", icon: "🚀" },
  { action: "Badge obtenu", detail: "Français maîtrisé – Niveau intermédiaire", time: "Hier", icon: "🏅" },
  { action: "Score parfait", detail: "Quiz Histoire : La Révolution française", time: "Hier", icon: "🎯" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { href: "/dashboard", label: "Tableau de bord", icon: "🏠", active: true },
            { href: "/courses", label: "Mes cours", icon: "📚", active: false },
            { href: "/exercises", label: "Exercices", icon: "✏️", active: false },
            { href: "#", label: "Résultats", icon: "📊", active: false },
            { href: "/messages", label: "Messages", icon: "💬", active: false },
            { href: "#", label: "Paramètres", icon: "⚙️", active: false },
          ].map(({ href, label, icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
            <Link href="/login" className="text-xs text-gray-400 hover:text-red-500 transition-colors">↩</Link>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="ml-64 flex-1 p-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bonjour, Fatou 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Voici votre progression aujourd&apos;hui.</p>
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            + Nouveau cours
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, icon, change }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">{change}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Mes cours */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Mes cours en cours</h2>
              <Link href="#" className="text-sm text-indigo-600 hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-5">
              {courses.map(({ title, progress, color, badge }) => (
                <div key={title}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{title}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          badge === "Terminé"
                            ? "bg-green-100 text-green-700"
                            : badge === "En cours"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {badge}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-5">Activité récente</h2>
            <div className="space-y-4">
              {activities.map(({ action, detail, time, icon }) => (
                <div key={detail} className="flex gap-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
