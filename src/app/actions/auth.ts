"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  parent:  "/dashboard/parent",
  admin:   "/dashboard/admin",
};

// ── Connexion ──────────────────────────────────────────────────
export async function loginAction(_prev: unknown, formData: FormData) {
  const raw = {
    email:    formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email ou mot de passe incorrect" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Veuillez confirmer votre adresse e-mail avant de vous connecter" };
    }
    return { error: "Une erreur est survenue. Réessayez." };
  }

  // Récupérer le rôle depuis le profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role ?? "student";
  redirect(ROLE_REDIRECTS[role] ?? "/dashboard/student");
}

// ── Inscription ───────────────────────────────────────────────
export async function registerAction(_prev: unknown, formData: FormData) {
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
    return { error: parsed.error.issues[0].message };
  }

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

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Un compte existe déjà avec cet email" };
    }
    return { error: "Impossible de créer le compte. Réessayez." };
  }

  return { success: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse." };
}

// ── Mot de passe oublié ───────────────────────────────────────
export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const raw = { email: formData.get("email") };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
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
