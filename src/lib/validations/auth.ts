import { z } from "zod";

// ── Connexion ──────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Minimum 6 caractères"),
  remember: z.boolean().optional(),
});

// ── Inscription ───────────────────────────────────────────────
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Prénom trop court (min. 2 caractères)")
      .max(50, "Prénom trop long")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Caractères invalides"),
    lastName: z
      .string()
      .min(2, "Nom trop court (min. 2 caractères)")
      .max(50, "Nom trop long")
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Caractères invalides"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Adresse e-mail invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une lettre majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    role: z.enum(["student", "teacher", "parent"] as const, {
      message: "Veuillez sélectionner un rôle",
    }),
    terms: z.literal(true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ── Mot de passe oublié ───────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse e-mail invalide"),
});

// ── Réinitialisation mot de passe ─────────────────────────────
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une lettre majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ── Téléphone — champ commun ──────────────────────────────────
const phoneField = z
  .string()
  .min(1, "Le numéro de téléphone est requis")
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine(
    (v) => /^\+?\d{8,15}$/.test(v),
    "Numéro de téléphone invalide (8–15 chiffres)"
  );

// ── OTP — champ commun ────────────────────────────────────────
const otpField = z
  .string()
  .length(6, "Le code doit contenir exactement 6 chiffres")
  .regex(/^\d{6}$/, "Chiffres uniquement");

// ── Connexion SMS OTP ─────────────────────────────────────────
export const phoneLoginSendSchema = z.object({
  phone: phoneField,
});

export const phoneLoginVerifySchema = z.object({
  phone: z.string().min(1),
  token: otpField,
});

// ── Inscription SMS OTP ───────────────────────────────────────
const nameField = (label: string) =>
  z
    .string()
    .min(2, `${label} trop court (min. 2 caractères)`)
    .max(50, `${label} trop long`)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Caractères invalides");

export const phoneRegisterFormSchema = z.object({
  phone:     phoneField,
  firstName: nameField("Prénom"),
  lastName:  nameField("Nom"),
  role:      z.enum(["student", "teacher", "parent"] as const, {
    message: "Veuillez sélectionner un rôle",
  }),
  email: z
    .string()
    .optional()
    .transform((v) => (v?.trim() === "" ? undefined : v?.trim()))
    .pipe(z.string().email("Adresse e-mail invalide").optional()),
  terms: z.literal("on", { message: "Vous devez accepter les conditions d'utilisation" }),
});

export const phoneRegisterVerifySchema = z.object({
  phone:     z.string().min(1),
  token:     otpField,
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  role:      z.enum(["student", "teacher", "parent"] as const),
  email:     z.string().optional(),
});

export type LoginInput                = z.infer<typeof loginSchema>;
export type RegisterInput             = z.infer<typeof registerSchema>;
export type ForgotPasswordInput       = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput        = z.infer<typeof resetPasswordSchema>;
export type PhoneLoginSendInput       = z.infer<typeof phoneLoginSendSchema>;
export type PhoneLoginVerifyInput     = z.infer<typeof phoneLoginVerifySchema>;
export type PhoneRegisterFormInput    = z.infer<typeof phoneRegisterFormSchema>;
export type PhoneRegisterVerifyInput  = z.infer<typeof phoneRegisterVerifySchema>;
