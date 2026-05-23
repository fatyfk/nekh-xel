import { NextResponse, type NextRequest } from "next/server";

// Routes accessibles sans connexion
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/auth"];

// Routes réservées aux utilisateurs connectés
const PROTECTED_PREFIXES = [
  "/dashboard", "/courses", "/exercises",
  "/results", "/messages", "/profile", "/settings",
  "/quiz", "/competition",
];

// Redirection par rôle (lue depuis le cookie de session Supabase)
const ROLE_HOME: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  parent:  "/dashboard/parent",
  admin:   "/dashboard/admin",
};

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthPage(pathname: string) {
  return ["/login", "/register", "/forgot-password"].includes(pathname);
}

function getSupabaseSession(request: NextRequest): { userId: string; role: string } | null {
  // Supabase stocke la session dans sb-<ref>-auth-token (JSON base64)
  for (const cookie of request.cookies.getAll()) {
    const { name, value } = cookie;
    if (name.startsWith("sb-") && name.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(value);
        const token = Array.isArray(parsed) ? parsed[0] : parsed.access_token ?? parsed;
        if (!token || typeof token !== "string") continue;

        const payload = token.split(".")[1];
        if (!payload) continue;
        const decoded = JSON.parse(
          Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
        );

        const userId = decoded.sub as string;
        const role   = (decoded.user_metadata?.role as string) ?? "student";
        return { userId, role };
      } catch {
        // cookie malformé, on ignore
      }
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Passe les assets et routes internes Next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(ico|png|svg|jpg|jpeg|webp|woff2?|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const session = getSupabaseSession(request);
  const authed  = session !== null;

  // Route protégée sans session → /login
  if (isProtected(pathname) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Page d'auth avec session → dashboard selon rôle
  if (isAuthPage(pathname) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[session!.role] ?? "/dashboard/student";
    return NextResponse.redirect(url);
  }

  // Vérification rôle pour /dashboard/teacher|parent|admin
  if (authed && pathname.startsWith("/dashboard/")) {
    const segment = pathname.split("/")[2];
    const restrictedRoles = ["teacher", "parent", "admin"];
    if (restrictedRoles.includes(segment) && session!.role !== segment && session!.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[session!.role] ?? "/dashboard/student";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
