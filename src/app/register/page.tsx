"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions/auth";

type RegisterState = {
  error?: string;
  success?: string;
} | null;

const roles = [
  { id: "student", label: "Élève",         emoji: "🎒", desc: "Je veux apprendre !",   border: "border-indigo-400", bg: "bg-indigo-50"  },
  { id: "teacher", label: "Enseignant(e)", emoji: "👨‍🏫", desc: "J'enseigne et je guide", border: "border-green-400",  bg: "bg-green-50"   },
  { id: "parent",  label: "Parent",        emoji: "👪", desc: "Je suis les progrès",    border: "border-orange-400", bg: "bg-orange-50"  },
];

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition";

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

export default function RegisterPage() {
  console.log("[RegisterPage] render");

  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const s = state as RegisterState;

  if (s?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-black text-indigo-600">NEKH XËL</Link>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
            <h1 className="text-xl font-black text-gray-900 mb-2">Compte créé !</h1>
            <p className="text-sm text-gray-500">{s.success}</p>
            <Link href="/login"
              className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition text-center">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-indigo-600">NEKH XËL</Link>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">Génie en Herbe · Sénégal</p>
          <h1 className="text-2xl font-black text-gray-900 mt-3">Crée ton compte 🌟</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoins des milliers d&apos;apprenants !</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* Erreur serveur */}
          {s?.error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-red-700 text-sm font-medium">{s.error}</p>
            </div>
          )}

          {/* Indicateur de chargement */}
          {isPending && (
            <div className="mb-5 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5">
              <svg className="animate-spin w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-indigo-700 text-sm font-medium">Création du compte…</p>
            </div>
          )}

          <form
            action={formAction}
            onSubmit={() => console.log("[RegisterPage] form onSubmit fired")}
            className="space-y-5"
          >
            {/* Rôle */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Je suis… <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-3 gap-3">
                {roles.map(({ id, label, emoji, desc, border, bg }) => (
                  <label key={id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={id}
                      className="sr-only"
                      checked={selectedRole === id}
                      onChange={() => {
                        console.log("[RegisterPage] role selected:", id);
                        setSelectedRole(id);
                      }}
                    />
                    <div className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all
                      ${selectedRole === id
                        ? `${border} ${bg} shadow-md scale-[1.03]`
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-xs font-bold text-gray-800 text-center">{label}</span>
                      <span className="text-xs text-gray-400 text-center leading-tight">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              {!selectedRole && s !== null && (
                <p className="text-red-500 text-xs mt-1.5">Veuillez sélectionner un rôle.</p>
              )}
            </div>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                <input id="firstName" name="firstName" type="text" placeholder="Fatou"
                  autoComplete="given-name" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input id="lastName" name="lastName" type="text" placeholder="Diallo"
                  autoComplete="family-name" required className={inputCls} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input id="email" name="email" type="email" placeholder="vous@exemple.com"
                autoComplete="email" required className={inputCls} />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? "text" : "password"}
                  placeholder="8 car. min., 1 majuscule, 1 chiffre"
                  autoComplete="new-password" required className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  autoComplete="new-password" required className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {/* CGU — liens sans href="#" pour éviter la navigation parasite */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                className="mt-0.5 w-4 h-4 rounded accent-indigo-600 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                J&apos;accepte les{" "}
                <button type="button" className="text-indigo-600 font-semibold hover:underline">
                  conditions d&apos;utilisation
                </button>
                {" "}et la{" "}
                <button type="button" className="text-indigo-600 font-semibold hover:underline">
                  politique de confidentialité
                </button>
              </label>
            </div>

            {/* Bouton submit — jamais bloqué par l'état du rôle */}
            <button
              type="submit"
              disabled={isPending}
              onClick={() => console.log("[RegisterPage] submit button clicked — selectedRole:", selectedRole)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-sm"
            >
              {isPending ? "Création du compte…" : "Créer mon compte 🚀"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
