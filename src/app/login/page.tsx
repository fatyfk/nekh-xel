"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useEffect } from "react";
import { loginPhoneAction } from "@/app/actions/auth-phone";
import { loginAction } from "@/app/actions/auth";

type LoginState = {
  error?: string;
  step?: "send" | "verify";
  phone?: string;
} | null;

const subjects = ["📐", "🌍", "🔬", "📖", "✍️", "🏛️", "🔢", "⚖️", "🎓"];

// Champ OTP 6 cases
function OtpInput({ onComplete }: { onComplete: (v: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
    const full = next.join("");
    if (full.length === 6) onComplete(full);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      onComplete(pasted);
      refs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
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

function PhoneLoginFlow() {
  const [state, formAction, isPending] = useActionState(loginPhoneAction, null);
  const [otpValue, setOtpValue] = useState("");
  const otpRef = useRef<HTMLInputElement>(null);
  const step = (state as LoginState)?.step ?? "send";

  useEffect(() => {
    if (step === "verify") setOtpValue("");
  }, [step]);

  if (step === "verify") {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">📱</div>
          <h2 className="text-xl font-black text-gray-900">Code envoyé !</h2>
          <p className="text-sm text-gray-500 mt-1">
            Entrez le code reçu par SMS au <span className="font-bold text-gray-700">{(state as LoginState)?.phone}</span>
          </p>
        </div>

        {(state as LoginState)?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <span className="text-red-500 flex-shrink-0">⚠</span>
            <p className="text-red-700 text-sm">{(state as LoginState)?.error}</p>
          </div>
        )}

        <OtpInput onComplete={(v) => { setOtpValue(v); }} />

        <form action={formAction}>
          <input type="hidden" name="_step" value="verify" />
          <input type="hidden" name="phone" value={(state as LoginState)?.phone ?? ""} />
          <input type="hidden" name="token" value={otpValue} ref={otpRef} />
          <button type="submit" disabled={isPending || otpValue.length < 6}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-sm mt-2">
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Vérification…
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        <form action={formAction}>
          <input type="hidden" name="_step" value="send" />
          <input type="hidden" name="phone" value={(state as LoginState)?.phone ?? ""} />
          <button type="submit" className="w-full text-sm text-indigo-600 font-semibold hover:underline py-1">
            Renvoyer le code
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="_step" value="send" />

      {(state as LoginState)?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <span className="text-red-500 flex-shrink-0">⚠</span>
          <p className="text-red-700 text-sm">{(state as LoginState)?.error}</p>
        </div>
      )}

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Numéro de téléphone
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm font-semibold text-gray-500 border-r border-gray-200 pr-3">
            🇸🇳 +221
          </div>
          <input
            id="phone" name="phone" type="tel" placeholder="77 XXX XX XX"
            autoComplete="tel" inputMode="numeric"
            className="w-full pl-24 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Vous recevrez un code SMS de vérification</p>
      </div>

      <button type="submit" disabled={isPending}
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
  );
}

function EmailLoginFallback() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <span className="text-red-500 flex-shrink-0">⚠</span>
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}
      <div>
        <label htmlFor="email-alt" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <input id="email-alt" name="email" type="email" placeholder="vous@exemple.com"
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition" />
      </div>
      <div>
        <label htmlFor="password-alt" className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
        <div className="relative">
          <input id="password-alt" name="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition" />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {showPwd
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
              }
            </svg>
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition">
        {isPending ? "Connexion…" : "Se connecter par email"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"phone" | "email">("phone");

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

            {/* Toggle mode */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button onClick={() => setMode("phone")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                  ${mode === "phone" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                📱 SMS (recommandé)
              </button>
              <button onClick={() => setMode("email")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                  ${mode === "email" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                ✉️ Email
              </button>
            </div>

            {mode === "phone" ? <PhoneLoginFlow /> : <EmailLoginFallback />}

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
