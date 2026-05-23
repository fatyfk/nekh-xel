import Link from "next/link";
import { notFound } from "next/navigation";

const courses = [
  {
    id: 1,
    title: "Algèbre – Équations et inéquations",
    category: "Mathématiques",
    level: "Intermédiaire",
    duration: "6h30",
    lessons: 14,
    progress: 75,
    color: "from-indigo-500 to-indigo-700",
    icon: "📐",
    enrolled: true,
    instructor: { name: "M. Konaté", role: "Professeur de Mathématiques", avatar: "K" },
    description:
      "Maîtrisez les équations du 1er et 2ème degré, les systèmes d'équations et les inéquations. Ce cours couvre les techniques fondamentales de l'algèbre avec des exercices progressifs et des cas pratiques.",
    objectives: [
      "Résoudre des équations du 1er et 2ème degré",
      "Manipuler et simplifier des expressions algébriques",
      "Résoudre des systèmes de deux équations",
      "Étudier le signe d'une expression",
    ],
    chapters: [
      {
        title: "Introduction à l'algèbre",
        lessons: [
          { title: "Les expressions algébriques", duration: "18 min", done: true },
          { title: "Opérations de base", duration: "22 min", done: true },
        ],
      },
      {
        title: "Équations du 1er degré",
        lessons: [
          { title: "Principe d'équivalence", duration: "20 min", done: true },
          { title: "Résolution d'équations simples", duration: "25 min", done: true },
          { title: "Problèmes appliqués", duration: "30 min", done: true },
        ],
      },
      {
        title: "Équations du 2ème degré",
        lessons: [
          { title: "Le discriminant (Δ)", duration: "28 min", done: true },
          { title: "Racines et factorisation", duration: "32 min", done: true },
          { title: "Applications pratiques", duration: "35 min", done: false, current: true },
          { title: "Exercices avancés", duration: "40 min", done: false },
        ],
      },
      {
        title: "Systèmes d'équations",
        lessons: [
          { title: "Méthode par substitution", duration: "25 min", done: false },
          { title: "Méthode par combinaison", duration: "28 min", done: false },
          { title: "Problèmes à deux inconnues", duration: "35 min", done: false },
        ],
      },
      {
        title: "Inéquations",
        lessons: [
          { title: "Règles des inéquations", duration: "20 min", done: false },
          { title: "Représentation sur la droite", duration: "18 min", done: false },
        ],
      },
    ],
  },
];

const levelColor: Record<string, string> = {
  Débutant: "bg-green-100 text-green-700",
  Intermédiaire: "bg-yellow-100 text-yellow-700",
  Avancé: "bg-red-100 text-red-700",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courses.find((c) => c.id === Number(id));
  if (!course) notFound();

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const doneLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.done).length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
            { href: "/courses", label: "Mes cours", icon: "📚" },
            { href: "#", label: "Exercices", icon: "✏️" },
            { href: "#", label: "Résultats", icon: "📊" },
            { href: "/messages", label: "Messages", icon: "💬" },
            { href: "#", label: "Paramètres", icon: "⚙️" },
          ].map(({ href, label, icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">F</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
            <Link href="/login" className="text-xs text-gray-400 hover:text-red-500 transition-colors">↩</Link>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="ml-64 flex-1">
        {/* Bandeau hero */}
        <div className={`bg-gradient-to-r ${course.color} px-10 py-10`}>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            ← Retour aux cours
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">{course.category}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor[course.level]}`}>{course.level}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-3">{course.icon} {course.title}</h1>
              <p className="text-white/80 text-sm max-w-xl leading-relaxed">{course.description}</p>
              <div className="flex items-center gap-6 mt-5 text-white/80 text-sm">
                <span>🕐 {course.duration}</span>
                <span>📄 {totalLessons} leçons</span>
                <span>✅ {doneLessons}/{totalLessons} complétées</span>
              </div>
            </div>
            <div className="ml-10 text-7xl hidden lg:block">{course.icon}</div>
          </div>
        </div>

        <div className="px-10 py-8 grid grid-cols-3 gap-8">
          {/* Colonne principale – chapitres */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Contenu du cours</h2>

            {course.chapters.map((chapter, ci) => (
              <div key={ci} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">{chapter.title}</h3>
                  <span className="text-xs text-gray-400">{chapter.lessons.length} leçons</span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {chapter.lessons.map((lesson, li) => (
                    <li
                      key={li}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                        lesson.current ? "bg-indigo-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Icône statut */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        lesson.done
                          ? "bg-green-100 text-green-600"
                          : lesson.current
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {lesson.done ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : lesson.current ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-8v4" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        )}
                      </div>

                      <span className={`flex-1 text-sm ${lesson.current ? "font-semibold text-indigo-700" : lesson.done ? "text-gray-600" : "text-gray-500"}`}>
                        {lesson.title}
                        {lesson.current && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">En cours</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{lesson.duration}</span>

                      {(lesson.done || lesson.current) && (
                        <button className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                          lesson.current
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-indigo-600 hover:bg-indigo-50"
                        }`}>
                          {lesson.done ? "Revoir" : "Continuer"}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            {/* Progression */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Ma progression</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-extrabold text-indigo-600">{course.progress}%</span>
                <span className="text-xs text-gray-400">{doneLessons}/{totalLessons} leçons</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-5">
                <div
                  className={`bg-gradient-to-r ${course.color} h-2.5 rounded-full`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <button className={`w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r ${course.color} rounded-xl hover:opacity-90 transition-opacity shadow-sm`}>
                ▶ Continuer le cours
              </button>
            </div>

            {/* Objectifs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Objectifs du cours</h3>
              <ul className="space-y-2.5">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructeur */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Instructeur</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-base flex-shrink-0">
                  {course.instructor.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{course.instructor.name}</p>
                  <p className="text-xs text-gray-400">{course.instructor.role}</p>
                </div>
              </div>
            </div>

            {/* Infos rapides */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Infos du cours</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex justify-between"><span className="text-gray-400">Durée totale</span><span className="font-medium">{course.duration}</span></li>
                <li className="flex justify-between"><span className="text-gray-400">Leçons</span><span className="font-medium">{totalLessons}</span></li>
                <li className="flex justify-between"><span className="text-gray-400">Chapitres</span><span className="font-medium">{course.chapters.length}</span></li>
                <li className="flex justify-between"><span className="text-gray-400">Niveau</span><span className="font-medium">{course.level}</span></li>
                <li className="flex justify-between"><span className="text-gray-400">Langue</span><span className="font-medium">Français</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
