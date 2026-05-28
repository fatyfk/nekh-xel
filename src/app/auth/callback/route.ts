import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ROLE_REDIRECTS: Record<string, string> = {
  student:     "/dashboard/student",
  teacher:     "/dashboard/teacher",
  parent:      "/dashboard/parent",
  admin:       "/dashboard/admin",
  super_admin: "/dashboard/admin",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/student";

  console.log("[auth/callback] code present:", !!code, "| next:", next);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[auth/callback] exchangeCodeForSession →", {
      userId: data?.user?.id ?? null,
      error:  error?.message ?? null,
    });

    if (!error && data.user) {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      console.log("[auth/callback] profile →", {
        role:       profile?.role ?? null,
        profileErr: profileErr?.message ?? null,
      });

      const destination =
        profile?.role && ROLE_REDIRECTS[profile.role]
          ? ROLE_REDIRECTS[profile.role]
          : next;

      console.log("[auth/callback] redirect →", destination);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  console.warn("[auth/callback] échec — redirect vers /login?error=auth_callback_failed");
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
