"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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
      userId: data?.user?.id ?? null,
      error:  error?.message ?? null,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        return { error: "Email ou mot de passe incorrect." };
      }
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        return { error: "Confirmez votre adresse e-mail avant de vous connecter." };
      }
      // Afficher le message Supabase réel pour faciliter le diagnostic
      return { error: `Erreur de connexion : ${error.message}` };
    }

    if (!data.user || !data.user.id) {
      console.error("[loginAction] signInWithPassword sans erreur mais user null");
      return { error: "Connexion échouée : session introuvable. Réessayez." };
    }

    console.log("[loginAction] user authenticated — id:", data.user.id);

    // Lire le profil via le client admin (service role bypasse RLS).
    // Évite tout blocage si les politiques RLS ne sont pas encore appliquées.
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    console.log("[loginAction] profile →", {
      role:       profile?.role ?? null,
      profileErr: profileErr?.message ?? null,
    });

    if (!profile) {
      console.error("[loginAction] profil introuvable pour user:", data.user.id, "—", profileErr?.message);
      return { error: "Profil utilisateur introuvable. Contactez l'administrateur." };
    }

    redirectPath = ROLE_REDIRECTS[profile.role] ?? "/dashboard/student";
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
    console.log("[registerAction] env check — URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL, "ANON:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "SERVICE_ROLE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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
    const { data, error } = await supabase.auth.signUp({
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

    console.log("[registerAction] signUp →", {
      userId:  data?.user?.id ?? null,
      session: data?.session ? "active" : "null (confirmation email ou échec)",
      error:   error?.message ?? null,
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return { error: "Un compte existe déjà avec cet email." };
      }
      console.error("[registerAction] signUp error:", error.message);
      return { error: `Erreur lors de la création du compte : ${error.message}` };
    }

    // Supabase peut renvoyer error=null mais user=null (protection anti-énumération
    // ou email déjà utilisé avec confirmation en attente).
    if (!data.user || !data.user.id) {
      console.error("[registerAction] signUp sans erreur mais user null — email probablement déjà utilisé");
      return { error: "Le compte n'a pas pu être créé. Cet email est peut-être déjà utilisé." };
    }

    console.log("[registerAction] user created in auth.users — id:", data.user.id);

    // Vérifier et créer le profil via le client admin (service role bypasse RLS).
    // Nécessaire car sans session active auth.uid() est null → le client anon
    // ne peut pas lire public.profiles (RLS bloqué).
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .single();

    console.log("[registerAction] profile check →", {
      profileId:  profile?.id ?? null,
      profileErr: profileErr?.message ?? null,
    });

    if (!profile) {
      // Le trigger handle_new_user() n'a pas encore créé le profil (trigger absent
      // ou exécution retardée). On l'insère manuellement.
      console.warn("[registerAction] profil absent — insertion manuelle");
      const { error: insertErr } = await admin
        .from("profiles")
        .upsert(
          {
            id:         data.user.id,
            role:       parsed.data.role,
            first_name: parsed.data.firstName,
            last_name:  parsed.data.lastName,
            email:      parsed.data.email,
          },
          { onConflict: "id" },
        );

      console.log("[registerAction] manual profile insert →", { error: insertErr?.message ?? null });

      if (insertErr) {
        console.error("[registerAction] profile insert failed:", insertErr.message);
        return { error: "Compte créé mais profil introuvable. Réessayez ou contactez le support." };
      }

      console.log("[registerAction] profil créé manuellement — OK");
    } else {
      console.log("[registerAction] profil trouvé via trigger — role:", profile.role);
    }

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
