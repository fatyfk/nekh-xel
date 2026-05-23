"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [prompt, setPrompt]     = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Dismissed before
    if (sessionStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-dismissed", "1");
    setDismissed(true);
  };

  // Don't render if: already installed, dismissed, or no browser prompt support
  if (installed || dismissed || !prompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pb-safe sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="bg-gradient-to-br from-indigo-700 to-violet-800 rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              📲
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-snug">
                Installe NEKH XËL sur ton téléphone !
              </p>
              <p className="text-indigo-200 text-xs mt-1 leading-relaxed">
                Accède aux quiz sans internet · Jëf ak jàmm !
              </p>
            </div>
            <button onClick={handleDismiss}
              aria-label="Fermer"
              className="text-indigo-300 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-sm py-2.5 rounded-xl transition-colors active:scale-95">
              ⬇️ Installer l'app
            </button>
            <button onClick={handleDismiss}
              className="px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
