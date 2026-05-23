import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Remove X-Powered-By header (security hygiene)
  poweredByHeader: false,

  // Compress responses (gzip/brotli) — Vercel does this automatically,
  // but keep it on for self-hosted and local builds.
  compress: true,

  // Turbopack root — silences the "multiple lockfiles" workspace warning
  // (caused by a package-lock.json in the parent directory)
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 375, 428, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow images from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Security + performance headers
  async headers() {
    return [
      // Service worker — must not be cached, must control full origin scope
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control",         value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      // App manifest
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      // Static icons — immutable (content doesn't change without rename)
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // CSV files — short cache
      {
        source: "/:path*.csv",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type",  value: "text/csv; charset=utf-8" },
        ],
      },
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control",  value: "on" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "SAMEORIGIN" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
          // HSTS — production only (breaks localhost HTTPS dev)
          ...(isProd ? [{
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
