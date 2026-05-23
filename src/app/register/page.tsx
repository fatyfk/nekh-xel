"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import { registerPhoneAction } from "@/app/actions/auth-phone";

type RegisterState = {
  error?: string;
  step?: "form" | "verify";
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
} | null;

const roles = [
  { id: "student", label: "Élève",         emoji: "🎒", desc: "Je veux apprendre !",      border: "border-indigo-400",  bg: "bg-indigo-50"  },
  { id: "teacher", label: "Enseignant(e)", emoji: "👨‍🏫", desc: "J'enseigne et je guide",    border: "border-green-400",   bg: "bg-green-50"   },
  { id: "parent",  label: "Parent",        emoji: "👪", desc: "Je suis les progrès",       border: "border-orange-400",  bg: "bg-orange-50"  },
];

function OtpInput({ onComplete }: { onComplete: (v: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
    const full = next.join("");
    if (full.length === 6) onComplete(full);
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setDigits(p.split("")); onComplete(p); refs.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`w-11 h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all
            ${d ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-800"}
            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerPhoneAction, null);
  const [selectedRole, setSelectedRole] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const s = state as RegisterState;
  const step = s?.step ?? "form";

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-black text-indigo-600">NEKH XËL</Link>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">📱</div>
              <h1 className="text-xl font-black text-gray-900">Code de vérification</h1>
              <p className="text-sm text-gray-500 mt-1">
                Code envoyé au <span className="font-bold text-gray-700">{s?.phone}</span>
              </p>
            </div>

            {s?.error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <span className="text-red-500 flex-shrink-0">⚠</span>
                <p className="text-red-700 text-sm">{s.error}</p>
              </div>
            )}

            <div className="space-y-5">
              <OtpInput onComplete={(v) => setOtpValue(v)} />

              <form action={formAction}>
                <input type="hidden" name="_step" value="verify" />
                <input type="hidden" name="phone" value={s?.phone ?? ""} />
                <input type="hidden" name="firstName" value={s?.firstName ?? ""} />
                <input type="hidden" name="lastName" value={s?.lastName ?? ""} />
                <input type="hidden" name="role" value={s?.role ?? ""} />
                <input type="hidden" name="email" value={s?.email ?? ""} />
                <input type="hidden" name="token" value={otpValue} />
                <button type="submit" disabled={isPending || otpValue.length < 6}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md mt-2">
                  {isPending ? "Vérification…" : "Créer mon compte 🚀"}
                </button>
              </form>

              <form action={formAction}>
                <input type="hidden" name="_step" value="form" />
                <input type="hidden" name="phone" value={s?.phone ?? ""} />
                <input type="hidden" name="firstName" value={s?.firstName ?? ""} />
                <input type="hidden" name="lastName" value={s?.lastName ?? ""} />
                <input type="hidden" name="role" value={s?.role ?? ""} />
                <input type="hidden" name="email" value={s?.email ?? ""} />
                <button type="submit" className="w-full text-sm text-indigo-600 font-semibold hover:underline py-1">
                  Renvoyer le code
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition";

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
          {s?.error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-red-700 text-sm">{s.error}</p>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="_step" value="form" />

            {/* Rôle */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Je suis…</p>
              <div className="grid grid-cols-3 gap-3">
                {roles.map(({ id, label, emoji, desc, border, bg }) => (
                  <label key={id} className="cursor-pointer">
                    <input type="radio" name="role" value={id} className="sr-only"
                      checked={selectedRole === id} onChange={() => setSelectedRole(id)} />
                    <div className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all
                      ${selectedRole === id ? `${border} ${bg} shadow-md scale-[1.03]` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-xs font-bold text-gray-800 text-center">{label}</span>
                      <span className="text-xs text-gray-400 text-center leading-tight">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                <input id="firstName" name="firstName" type="text" placeholder="Fatou"
                  autoComplete="given-name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                <input id="lastName" name="lastName" type="text" placeholder="Diallo"
                  autoComplete="family-name" className={inputCls} />
              </div>
            </div>

            {/* Téléphone (requis) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm font-semibold text-gray-500 border-r border-gray-200 pr-3">
                  🇸🇳 +221
                </div>
                <input id="phone" name="phone" type="tel" placeholder="77 XXX XX XX"
                  autoComplete="tel" inputMode="numeric"
                  className={`${inputCls} pl-24`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Vous recevrez un code SMS de confirmation</p>
            </div>

            {/* Email (optionnel) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse e-mail <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input id="email" name="email" type="email" placeholder="vous@exemple.com"
                autoComplete="email" className={inputCls} />
            </div>

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="terms" className="mt-0.5 w-4 h-4 rounded accent-indigo-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                J&apos;accepte les{" "}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">conditions d&apos;utilisation</a>
                {" "}et la{" "}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">politique de confidentialité</a>
              </span>
            </label>

            <button type="submit" disabled={isPending || !selectedRole}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-sm">
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi du code…
                </span>
              ) : "Recevoir mon code SMS 📱"}
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
