"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Données ──────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { icon: "🔢", label: "Mathématiques",      color: "from-blue-500 to-blue-700",     bg: "bg-blue-50",   border: "border-blue-200"   },
  { icon: "📖", label: "Français",           color: "from-violet-500 to-purple-700", bg: "bg-violet-50", border: "border-violet-200" },
  { icon: "🏛️", label: "Histoire",           color: "from-amber-500 to-orange-600",  bg: "bg-amber-50",  border: "border-amber-200"  },
  { icon: "🌍", label: "Géographie",         color: "from-emerald-500 to-green-700", bg: "bg-emerald-50",border: "border-emerald-200"},
  { icon: "🔬", label: "Sciences",           color: "from-red-500 to-rose-700",      bg: "bg-red-50",    border: "border-red-200"    },
  { icon: "⚖️", label: "Instruction civique",color: "from-cyan-500 to-teal-700",     bg: "bg-cyan-50",   border: "border-cyan-200"   },
  { icon: "✏️", label: "Orthographe",        color: "from-pink-500 to-fuchsia-600",  bg: "bg-pink-50",   border: "border-pink-200"   },
  { icon: "🔤", label: "Conjugaison",        color: "from-indigo-500 to-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  { icon: "📝", label: "Grammaire",          color: "from-teal-500 to-cyan-700",     bg: "bg-teal-50",   border: "border-teal-200"   },
  { icon: "🧮", label: "Calcul mental",      color: "from-orange-500 to-amber-600",  bg: "bg-orange-50", border: "border-orange-200" },
  { icon: "🌟", label: "Culture générale",   color: "from-rose-500 to-pink-700",     bg: "bg-rose-50",   border: "border-rose-200"   },
] as const;

const FEATURES = [
  {
    icon: "🏆",
    title: "Format Génie en Herbe",
    desc: "Quiz chronométrés inspirés des compétitions Génie en Herbe. Prépare-toi à briller !",
    color: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: "📊",
    title: "Suivi personnalisé",
    desc: "Tes progrès, ton historique et tes statistiques par matière. Vois où tu t'améliores.",
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100",
  },
  {
    icon: "👨‍🏫",
    title: "Espace enseignant",
    desc: "Crée des questions, organise des sessions d'entraînement et suis tes élèves.",
    color: "bg-emerald-50 border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  {
    icon: "👪",
    title: "Espace parent",
    desc: "Suis les résultats de ton enfant, vois ses points forts et ses difficultés.",
    color: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
  },
  {
    icon: "⚡",
    title: "Système XP & Niveaux",
    desc: "Gagne des points d'expérience, monte de niveau, débloque des badges.",
    color: "bg-violet-50 border-violet-200",
    iconBg: "bg-violet-100",
  },
  {
    icon: "📱",
    title: "Connexion par téléphone",
    desc: "Pas besoin d'email ! Connecte-toi avec ton numéro sénégalais (+221).",
    color: "bg-cyan-50 border-cyan-200",
    iconBg: "bg-cyan-100",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Aminata Diallo",
    role: "Élève CM2 — Dakar",
    avatar: "👧",
    text: "Grâce à NEKH XËL, j'ai eu 18/20 en histoire à l'examen blanc ! Les quiz sont trop bien, on apprend sans s'ennuyer.",
    stars: 5,
    color: "bg-violet-50 border-violet-200",
  },
  {
    name: "M. Ibrahima Sow",
    role: "Enseignant CM2 — Thiès",
    avatar: "👨‍🏫",
    text: "Un outil remarquable. Je crée mes propres questions sur le programme officiel et mes élèves s'entraînent à la maison. Les résultats ont progressé de 30%.",
    stars: 5,
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    name: "Mme Fatou Ndiaye",
    role: "Mère de famille — Saint-Louis",
    avatar: "👩",
    text: "Je n'y connais rien en technologie, mais NEKH XËL est simple à utiliser. Je vois les résultats de mon fils directement sur mon téléphone.",
    stars: 5,
    color: "bg-amber-50 border-amber-200",
  },
  {
    name: "Ousmane Faye",
    role: "Élève CM2 — Ziguinchor",
    avatar: "👦",
    text: "J'adore le système des XP et les badges ! Je joue chaque soir pour monter de niveau. Calcul mental est ma matière préférée maintenant !",
    stars: 5,
    color: "bg-rose-50 border-rose-200",
  },
] as const;

const STATS = [
  { value: 11,    suffix: "",    label: "matières CM2"      },
  { value: 4,     suffix: "",    label: "types de questions" },
  { value: 100,   suffix: "+",   label: "questions validées" },
  { value: 0,     suffix: " F",  label: "coût — 100% gratuit"},
] as const;

const HOW_STEPS = [
  { num: "1", icon: "📱", title: "Inscris-toi",      desc: "Entre ton numéro de téléphone sénégalais. Reçois un code SMS. C'est tout !", color: "bg-indigo-600" },
  { num: "2", icon: "📚", title: "Choisis ta matière",desc: "11 matières du programme CM2. Choisis ta difficulté : facile, moyen ou difficile.", color: "bg-violet-600" },
  { num: "3", icon: "🎯", title: "Joue !",            desc: "Quiz chronométré, questions variées, feedback immédiat avec explications.", color: "bg-rose-600"   },
  { num: "4", icon: "🏆", title: "Progresse",         desc: "Vois ton score, gagne des XP, débloque des badges et grimpe dans le classement !", color: "bg-amber-600" },
] as const;

// ─── Composant compteur animé ──────────────────────────────────────────────

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let v = 0;
          const step = Math.max(1, Math.ceil(target / 60));
          const id = setInterval(() => {
            v = Math.min(v + step, target);
            setCount(v);
            if (v >= target) clearInterval(id);
          }, 20);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Étoiles ──────────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">★</span>
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-black text-gray-900">
              NEKH <span className="text-indigo-600">XËL</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <a href="#matieres" className="hover:text-indigo-600 transition-colors">Matières</a>
            <a href="#fonctionnalites" className="hover:text-indigo-600 transition-colors">Fonctionnalités</a>
            <a href="#comment" className="hover:text-indigo-600 transition-colors">Comment ça marche</a>
            <a href="#temoignages" className="hover:text-indigo-600 transition-colors">Témoignages</a>
            <Link href="/competition" className="flex items-center gap-1 font-bold text-yellow-600 hover:text-yellow-700 transition-colors">🏆 Compétition</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              Connexion
            </Link>
            <Link href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg">
              S&apos;inscrire gratuitement
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
            {["#matieres", "#fonctionnalites", "#comment", "#temoignages"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600">
                {["Matières", "Fonctionnalités", "Comment ça marche", "Témoignages"][i]}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
              <Link href="/competition" className="text-center py-2.5 text-sm font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl">🏆 Mode compétition</Link>
              <Link href="/login" className="text-center py-2.5 text-sm font-bold text-indigo-600 border border-indigo-200 rounded-xl">Connexion</Link>
              <Link href="/register" className="text-center py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl">S&apos;inscrire gratuitement</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-amber-400/20 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm font-bold mb-6 border border-white/20">
              <span>🇸🇳</span>
              <span>Plateforme éducative sénégalaise — Programme CM2 officiel</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 sm:mb-6">
              Le savoir est bon.
              <br />
              <span className="text-amber-300">Nekh Xël.</span>
            </h1>

            <p className="text-lg sm:text-xl text-indigo-200 mb-8 max-w-2xl leading-relaxed">
              La plateforme de quiz interactive pour les élèves de CM2 au Sénégal.
              Entraîne-toi sur les <strong className="text-white">11 matières</strong> du programme,
              prépare le <strong className="text-white">Génie en Herbe</strong> et progresse à ton rythme.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 sm:mb-10">
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black rounded-2xl text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto">
                🚀 Commencer gratuitement
              </Link>
              <Link href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-2xl text-base transition-all w-full sm:w-auto">
                📝 Voir les quiz →
              </Link>
              <Link href="/competition"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/50 text-yellow-300 font-bold rounded-2xl text-base transition-all w-full sm:w-auto">
                🏆 Mode compétition
              </Link>
            </div>

            {/* Social proof mini */}
            <div className="flex items-center gap-3 text-sm text-indigo-200">
              <div className="flex -space-x-2">
                {["👧", "👦", "👧", "👦"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-base">{e}</div>
                ))}
              </div>
              <span>Rejoins des milliers d&apos;élèves sénégalais !</span>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-indigo-700 mb-1">
                <AnimatedCounter target={value} suffix={suffix} />
              </p>
              <p className="text-xs text-gray-500 font-semibold leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Matières ── */}
      <section id="matieres" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Programme officiel</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
            11 matières du CM2 sénégalais
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Toutes les matières du programme officiel du Ministère de l&apos;Éducation nationale,
            avec des questions dans le contexte sénégalais.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SUBJECTS.map((s) => (
            <Link key={s.label} href="/quiz"
              className={`${s.bg} ${s.border} border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 hover:shadow-md transition-all group`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow`}>
                {s.icon}
              </div>
              <span className="text-xs font-bold text-gray-700 text-center leading-tight">{s.label}</span>
            </Link>
          ))}

          {/* CTA card */}
          <Link href="/register"
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 hover:shadow-xl transition-all text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🎓</div>
            <span className="text-xs font-black text-center">Commencer maintenant !</span>
          </Link>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section id="fonctionnalites" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full">Pourquoi NEKH XËL ?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
              Tout ce dont tu as besoin pour réussir
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une plateforme pensée pour les élèves sénégalais, leurs enseignants et leurs parents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className={`${f.color} border rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                <div className={`${f.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Simple comme bonjour</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-gray-500">En 4 étapes, tu es prêt à jouer !</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* Connecteur */}
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-3/4 w-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
              )}
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4 z-10 relative`}>
                {step.icon}
              </div>
              <div className={`${step.color} text-white text-xs font-black px-2 py-0.5 rounded-full mb-3`}>
                Étape {step.num}
              </div>
              <h3 className="font-black text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Types de questions ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3">4 types de questions</h2>
            <p className="text-indigo-200">Comme dans une vraie compétition Génie en Herbe !</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🔤", type: "QCM", desc: "4 choix colorés, feedback immédiat" },
              { icon: "✅", type: "Vrai / Faux", desc: "2 grands boutons, réponse rapide" },
              { icon: "🔗", type: "Association", desc: "Relie les paires en cliquant" },
              { icon: "💡", type: "Identification", desc: "Indices progressifs, écris ta réponse" },
            ].map((t) => (
              <div key={t.type} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-3">{t.icon}</div>
                <h3 className="font-black mb-1">{t.type}</h3>
                <p className="text-indigo-200 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section id="temoignages" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Ils nous font confiance</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
            Ce qu&apos;ils disent de NEKH XËL
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={`${t.color} border rounded-2xl p-6 hover:shadow-md transition-shadow`}>
              <Stars n={t.stars} />
              <p className="text-gray-700 text-sm mt-3 mb-5 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rôles ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Pour toute la communauté éducative</h2>
            <p className="text-gray-500">NEKH XËL est conçu pour les élèves, leurs enseignants et leurs parents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "👨‍🎓",
                role: "Élève",
                color: "from-indigo-500 to-violet-600",
                bg: "bg-indigo-50 border-indigo-200",
                features: [
                  "Quiz sur 11 matières CM2",
                  "Chronomètre et score animé",
                  "XP, niveaux et badges",
                  "Historique et statistiques",
                  "Connexion par numéro de téléphone",
                ],
                cta: "Je suis élève →",
                href: "/register",
              },
              {
                emoji: "👩‍🏫",
                role: "Enseignant",
                color: "from-emerald-500 to-teal-600",
                bg: "bg-emerald-50 border-emerald-200",
                features: [
                  "Créer des questions et quiz",
                  "Importer des questions (CSV)",
                  "Organiser des sessions",
                  "Suivre ses élèves",
                  "Consulter les statistiques de classe",
                ],
                cta: "Je suis enseignant →",
                href: "/register",
              },
              {
                emoji: "👪",
                role: "Parent",
                color: "from-amber-500 to-orange-600",
                bg: "bg-amber-50 border-amber-200",
                features: [
                  "Voir les résultats de son enfant",
                  "Graphique de progression",
                  "Points forts et difficultés",
                  "Interface simple et claire",
                  "Pas besoin d'être expert en tech",
                ],
                cta: "Je suis parent →",
                href: "/register",
              },
            ].map((r) => (
              <div key={r.role} className={`${r.bg} border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow`}>
                <div className={`bg-gradient-to-br ${r.color} p-5 text-white text-center`}>
                  <div className="text-5xl mb-2">{r.emoji}</div>
                  <h3 className="text-xl font-black">{r.role}</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-2 mb-5">
                    {r.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 font-black text-xs">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={r.href}
                    className={`block text-center py-3 bg-gradient-to-r ${r.color} text-white font-black rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md`}>
                    {r.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Prêt à devenir champion ?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Rejoins NEKH XËL gratuitement et commence à progresser dès aujourd&apos;hui.
            Aucune carte bancaire, aucun email obligatoire.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black rounded-2xl text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
              🚀 S&apos;inscrire gratuitement
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-2xl text-base transition-all">
              Se connecter
            </Link>
          </div>
          <p className="text-indigo-300 text-sm mt-6">
            Connexion par numéro de téléphone sénégalais (+221) · 100% gratuit · Pas d&apos;email requis
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎓</span>
                <span className="text-lg font-black text-white">NEKH <span className="text-indigo-400">XËL</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-3">
                &ldquo;Nekh Xël&rdquo; signifie &ldquo;Le savoir est bon&rdquo; en wolof.
                Plateforme éducative sénégalaise pour les élèves de CM2.
              </p>
              <p className="text-xs text-gray-600">Programme officiel CM2 — Ministère de l&apos;Éducation nationale du Sénégal</p>
            </div>

            {/* Liens */}
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Plateforme</h4>
              <ul className="space-y-2 text-sm">
                {[["Quiz", "/quiz"], ["Connexion", "/login"], ["Inscription", "/register"]].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-3">Dashboards</h4>
              <ul className="space-y-2 text-sm">
                {[["Élève", "/dashboard/student"], ["Enseignant", "/dashboard/teacher"], ["Parent", "/dashboard/parent"]].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} NEKH XËL. Tous droits réservés.</span>
            <span>Fait avec ❤️ au Sénégal 🇸🇳</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
