"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  student:     "/dashboard/student",
  teacher:     "/dashboard/teacher",
  parent:      "/dashboard/parent",
  admin:       "/dashboard/admin",
  super_admin: "/dashboard/admin",
};

// ── Connexion ──────────────────────────────────────────────────
export async function loginAction(_prev: unknown, formData: FormData) {
  console.log("[loginAction] called — email:", formData.get("email"));

  const raw = {
    email:    formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    console.log("[loginAction] validation error:", msg);
    return { error: msg };
  }

  // redirect() doit être appelé HORS du try/catch car il lève une erreur intentionnelle
  let redirectPath: string;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    parsed.data.email,
      password: parsed.data.password,
    });

    console.log("[loginAction] signInWithPassword →", {
      userId:  data?.user?.id ?? null,
      error:   error?.message ?? null,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        return { error: "Email ou mot de passe incorrect." };
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return { error: "Confirmez votre adresse e-mail avant de vous connecter." };
      }
      return { error: `Erreur Supabase : ${error.message}` };
    }

    if (!data.user) {
      return { error: "Connexion échouée : session introuvable. Réessayez." };
    }

    // Récupérer le rôle
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!profile || profileErr) {
      console.warn("[loginAction] profil introuvable ou erreur RLS —", profileErr?.message ?? "aucun profil");
    }

    console.log("[loginAction] profile →", {
      role:        profile?.role ?? null,
      profileErr:  profileErr?.message ?? null,
    });

    const role = profile?.role ?? "student";
    redirectPath = ROLE_REDIRECTS[role] ?? "/dashboard/student";
    console.log("[loginAction] redirect →", redirectPath);
  } catch (err) {
    console.error("[loginAction] unexpected error:", err);
    return { error: "Une erreur inattendue est survenue. Réessayez." };
  }

  // Hors try/catch — lève NEXT_REDIRECT intentionnellement
  redirect(redirectPath);
}

// ── Inscription ───────────────────────────────────────────────
export async function registerAction(_prev: unknown, formData: FormData) {
  try {
    console.log("[registerAction] called — email:", formData.get("email"), "role:", formData.get("role"));
    console.log("[registerAction] env check — SUPABASE_URL set:", !!process.env.NEXT_PUBLIC_SUPABASE_URL, "ANON_KEY set:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const raw = {
      firstName:       formData.get("firstName"),
      lastName:        formData.get("lastName"),
      email:           formData.get("email"),
      password:        formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role:            formData.get("role"),
      terms:           formData.get("terms") === "on" ? true : undefined,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Données invalides. Vérifiez le formulaire.";
      console.log("[registerAction] validation error:", msg);
      return { error: msg };
    }
    console.log("[registerAction] validation OK — proceeding to signUp");

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email:    parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name:  parsed.data.lastName,
          role:       parsed.data.role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    console.log("[registerAction] signUp →", { error: error?.message ?? null });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return { error: "Un compte existe déjà avec cet email." };
      }
      return { error: `Erreur lors de la création du compte : ${error.message}` };
    }

    console.log("[registerAction] success");
    return { success: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse." };
  } catch (err) {
    console.error("[registerAction] UNCAUGHT error:", err);
    return { error: "Une erreur inattendue est survenue. Réessayez dans quelques instants." };
  }
}

// ── Mot de passe oublié ───────────────────────────────────────
export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const raw = { email: formData.get("email") };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: `Erreur Supabase : ${error.message}` };
    }
  } catch (err) {
    console.error("[forgotPasswordAction] unexpected error:", err);
    return { error: "Impossible d'envoyer l'email. Réessayez." };
  }

  return { success: "Email envoyé ! Vérifiez votre boîte mail." };
}

// ── Déconnexion ───────────────────────────────────────────────
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
