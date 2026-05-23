"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  phoneLoginSendSchema,
  phoneLoginVerifySchema,
  phoneRegisterFormSchema,
  phoneRegisterVerifySchema,
} from "@/lib/validations/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  parent:  "/dashboard/parent",
  admin:   "/dashboard/admin",
};

function normalizePhone(cleaned: string): string {
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("221")) return `+${cleaned}`;
  return `+221${cleaned}`;
}

// ── Connexion par SMS OTP ──────────────────────────────────────
export async function loginPhoneAction(_prev: unknown, formData: FormData) {
  const step = (formData.get("_step") as string) ?? "send";

  if (step === "verify") {
    const parsed = phoneLoginVerifySchema.safeParse({
      phone: formData.get("phone"),
      token: (formData.get("token") as string ?? "").replace(/\s/g, ""),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0].message,
        step: "verify" as const,
        phone: formData.get("phone") as string ?? "",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone: parsed.data.phone,
      token: parsed.data.token,
      type: "sms",
    });

    if (error || !data.user) {
      return {
        error: "Code incorrect ou expiré. Réessayez.",
        step: "verify" as const,
        phone: parsed.data.phone,
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role ?? data.user.user_metadata?.role ?? "student";
    redirect(ROLE_REDIRECTS[role] ?? "/dashboard/student");
  }

  // Step "send"
  const parsed = phoneLoginSendSchema.safeParse({ phone: formData.get("phone") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, step: "send" as const };
  }

  const phone = normalizePhone(parsed.data.phone);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "sms" },
  });

  if (error) {
    return { error: "Impossible d'envoyer le SMS. Vérifiez le numéro.", step: "send" as const };
  }
  return { step: "verify" as const, phone };
}

// ── Inscription par SMS OTP ────────────────────────────────────
export async function registerPhoneAction(_prev: unknown, formData: FormData) {
  const step = (formData.get("_step") as string) ?? "form";

  if (step === "verify") {
    const parsed = phoneRegisterVerifySchema.safeParse({
      phone:     formData.get("phone"),
      token:     (formData.get("token") as string ?? "").replace(/\s/g, ""),
      firstName: formData.get("firstName"),
      lastName:  formData.get("lastName"),
      role:      formData.get("role"),
      email:     formData.get("email") || undefined,
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0].message,
        step: "verify" as const,
        phone:     formData.get("phone") as string ?? "",
        firstName: formData.get("firstName") as string ?? "",
        lastName:  formData.get("lastName") as string ?? "",
        role:      formData.get("role") as string ?? "",
        email:     formData.get("email") as string ?? "",
      };
    }

    const { phone, token, firstName, lastName, role, email } = parsed.data;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });

    if (error || !data.user) {
      return {
        error: "Code incorrect ou expiré.",
        step: "verify" as const,
        phone, firstName, lastName, role, email: email ?? "",
      };
    }

    // Upsert sécurisé : ID provient de Supabase Auth, jamais du formulaire
    await supabase.from("profiles").upsert({
      id:         data.user.id,
      first_name: firstName,
      last_name:  lastName,
      role,
      phone,
      email:      email ?? null,
      updated_at: new Date().toISOString(),
    });

    redirect(ROLE_REDIRECTS[role] ?? "/dashboard/student");
  }

  // Step "form"
  const parsed = phoneRegisterFormSchema.safeParse({
    phone:     formData.get("phone"),
    firstName: formData.get("firstName"),
    lastName:  formData.get("lastName"),
    role:      formData.get("role"),
    email:     formData.get("email") || undefined,
    terms:     formData.get("terms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, step: "form" as const };
  }

  const { phone: rawPhone, firstName, lastName, role, email } = parsed.data;
  const phone = normalizePhone(rawPhone);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: "sms",
      data: { first_name: firstName, last_name: lastName, role, email: email ?? undefined },
    },
  });

  if (error) {
    return { error: "Impossible d'envoyer le SMS. Vérifiez le numéro.", step: "form" as const };
  }

  return { step: "verify" as const, phone, firstName, lastName, role, email: email ?? "" };
}
