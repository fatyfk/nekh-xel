"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";

type LoginState = { error?: string } | null;

const subjects = ["📐", "🌍", "🔬", "📖", "✍️", "🏛️", "🔢", "⚖️", "🎓"];

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPwd, setShowPwd] = useState(false);
  const s = state as LoginState;

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche décoratif */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/4 right-8 w-24 h-24 bg-white/10 rounded-3xl rotate-12" />
        <div className="absolute bottom-1/3 left-8 w-16 h-16 bg-white/10 rounded-2xl -rotate-6" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="text-6xl font-black text-white tracking-tight mb-1">NEKH XËL</div>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-6">Génie en Herbe · Sénégal</p>
          <p className="text-white/80 text-lg font-medium mb-8">
            La connaissance, c&apos;est un super-pouvoir ! 🚀
          </p>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {subjects.map((emoji, i) => (
              <div key={i}
                className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                {emoji}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-center">
            {[["10 000+", "Élèves"], ["9", "Matières"], ["500+", "Quiz"]].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-white/70 text-xs font-medium">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit – formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-black text-indigo-600">NEKH XËL</span>
            <p className="text-xs text-gray-400 mt-0.5">Génie en Herbe · Sénégal</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">Bon retour ! 👋</h1>
              <p className="text-gray-500 text-sm mt-1">Connectez-vous pour continuer votre aventure.</p>
            </div>

            <form action={formAction} className="space-y-5">
              {s?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0">⚠</span>
                  <p className="text-red-700 text-sm">{s.error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Adresse e-mail
                </label>
                <input id="email" name="email" type="email" placeholder="vous@exemple.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input id="password" name="password" type={showPwd ? "text" : "password"}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-sm">
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion…
                  </span>
                ) : "Se connecter"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-indigo-600 font-bold hover:underline">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
