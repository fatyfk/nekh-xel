import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4338ca",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NEKH XËL – Génie en Herbe Sénégal",
  description: "La plateforme de quiz interactive pour les élèves CM2 au Sénégal. Entraîne-toi sur 11 matières, prépare le Génie en Herbe et progresse à ton rythme.",
  keywords: ["quiz", "éducation", "Sénégal", "CM2", "Génie en Herbe", "scolaire"],
  authors: [{ name: "NEKH XËL" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEKH XËL",
  },
  openGraph: {
    title: "NEKH XËL – Génie en Herbe Sénégal",
    description: "La plateforme éducative sénégalaise inspirée des compétitions Génie en Herbe.",
    type: "website",
    locale: "fr_SN",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full`}>
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Preconnect for Google Fonts — already loaded above, but also preconnect origin */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {/* PWA install prompt — shown only when browser fires beforeinstallprompt */}
        <PWAInstallPrompt />
        {/* Service Worker registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(reg) {
                    console.log('[SW] Registered, scope:', reg.scope);
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage('SKIP_WAITING');
                          }
                        });
                      }
                    });
                  })
                  .catch(function(err) {
                    console.warn('[SW] Registration failed:', err);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
