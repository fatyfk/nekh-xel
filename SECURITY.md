# Sécurité — NEKH XËL

> Ce document décrit les mesures de sécurité implémentées dans NEKH XËL
> et les bonnes pratiques à respecter lors de l'évolution du projet.

---

## Sommaire

1. [Authentification](#1-authentification)
2. [Autorisation et contrôle d'accès](#2-autorisation-et-contrôle-daccès)
3. [Row Level Security (RLS)](#3-row-level-security-rls)
4. [Validation des données](#4-validation-des-données)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Sécurité des en-têtes HTTP](#6-sécurité-des-en-têtes-http)
7. [Protection contre les injections](#7-protection-contre-les-injections)
8. [Gestion des sessions](#8-gestion-des-sessions)
9. [Journalisation et audit](#9-journalisation-et-audit)
10. [Déploiement sécurisé](#10-déploiement-sécurisé)
11. [Signalement de vulnérabilités](#11-signalement-de-vulnérabilités)
12. [Checklist de sécurité](#12-checklist-de-sécurité)

---

## 1. Authentification

### 1.1 Méthode principale — OTP SMS

NEKH XËL utilise l'authentification par numéro de téléphone avec code OTP à usage unique (One-Time Password) via Supabase + Twilio.

**Avantages dans le contexte sénégalais :**
- Pas de mot de passe à retenir ni à voler
- Le téléphone est souvent plus accessible que l'email en milieu rural
- Le code expire en 10 minutes (configurable dans Supabase)
- Chaque code est à usage unique

**Ce qui est implémenté :**
```typescript
// src/app/actions/auth-phone.ts
// Normalisation du numéro avec préfixe +221 (Sénégal)
function normalizePhone(cleaned: string): string {
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("221")) return `+${cleaned}`;
  return `+221${cleaned}`;
}
```

**Bonnes pratiques à maintenir :**
- Ne jamais stocker les codes OTP en base de données côté application
- Laisser Supabase Auth gérer la création et la vérification des tokens
- Ne jamais loguer les codes OTP, même en développement
- Le numéro de téléphone vérifié par Supabase Auth, pas par le code applicatif

### 1.2 Authentification email (secondaire)

L'email reste disponible comme méthode alternative. Mots de passe soumis aux règles :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre

Ces règles sont validées côté client (Zod) **et** côté serveur (Supabase Auth policy).

### 1.3 Tokens JWT

Les sessions utilisateurs sont gérées par des JWT Supabase :
- **Access token** : courte durée (1 heure par défaut)
- **Refresh token** : longue durée, rotation automatique à chaque utilisation
- Stockés dans des cookies HttpOnly côté serveur (`@supabase/ssr`)

**Ne jamais :**
- Stocker les JWT dans `localStorage` (vulnérable au XSS)
- Décoder le JWT côté serveur pour en extraire l'identité sans le vérifier

---

## 2. Autorisation et contrôle d'accès

### 2.1 Rôles utilisateurs

| Rôle | Permissions |
|------|-------------|
| `student` | Ses données + questions publiées + résultats personnels |
| `teacher` | Idem + ses élèves + ses questions (draft) + ses sessions |
| `parent` | Idem + données de ses enfants |
| `admin` | Tout lire/écrire sauf purge logs et suppression de profils |
| `super_admin` | Accès total sans restriction |

### 2.2 Middleware Next.js

```typescript
// src/middleware.ts
// Routes protégées redirigées vers /login si pas de session
const PROTECTED_PREFIXES = ["/dashboard", "/quiz", "/courses", ...];

// Vérification du rôle pour les routes spécifiques
if (authed && pathname.startsWith("/dashboard/")) {
  const segment = pathname.split("/")[2]; // "teacher", "admin", etc.
  if (restrictedRoles.includes(segment) && session.role !== segment) {
    redirect(ROLE_HOME[session.role]);
  }
}
```

**Important :** Le middleware lit le JWT depuis le cookie pour extraire le rôle. Ce n'est pas une vérification définitive — la vérification finale se fait au niveau de la base de données via RLS.

### 2.3 Protection contre l'élévation de privilège

La politique RLS `profiles: own UPDATE` empêche un utilisateur de modifier son propre rôle :

```sql
-- Un utilisateur ne peut pas se promouvoir en admin
CREATE POLICY "profiles: own UPDATE"
  ON public.profiles FOR UPDATE
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
```

Seuls les admins peuvent modifier le rôle d'un autre utilisateur.

---

## 3. Row Level Security (RLS)

La RLS est **la dernière ligne de défense** côté base de données. Même si le middleware ou le code applicatif est contourné, la RLS garantit que les données restent protégées.

### 3.1 Principes appliqués

- **Moindre privilège** : chaque rôle ne voit que ce dont il a besoin
- **Défense en profondeur** : middleware + validation + RLS (3 couches)
- **Vérification sans jointure** : les fonctions helper (`is_admin()`, `is_teacher_of()`) utilisent `SECURITY DEFINER` pour éviter les boucles de RLS

### 3.2 Fonctions helper sécurisées

```sql
-- Ces fonctions sont déclarées SECURITY DEFINER + search_path = public
-- pour éviter les attaques de type search_path hijacking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;
```

### 3.3 Vérification de la RLS

```sql
-- Vérifier que RLS est activé sur toutes les tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
-- Ne doit retourner aucune ligne
```

### 3.4 Clé service_role

La clé `service_role` **bypass** toutes les politiques RLS. Elle ne doit **jamais** :
- Apparaître dans le code frontend
- Être préfixée `NEXT_PUBLIC_`
- Être commitée dans Git
- Être exposée dans les logs

---

## 4. Validation des données

### 4.1 Schémas Zod (validation côté serveur)

Toutes les entrées utilisateur sont validées avec Zod **dans les Server Actions** :

```typescript
// src/lib/validations/auth.ts
const phoneField = z
  .string()
  .min(1, "Le numéro de téléphone est requis")
  .transform((v) => v.replace(/[\s\-().]/g, ""))   // nettoyage
  .refine((v) => /^\+?\d{8,15}$/.test(v), "Numéro invalide");
```

**Règles :**
- Valider côté serveur (Server Actions), jamais côté client seulement
- Transformer les données avant validation (nettoyage des espaces, normalisation)
- Rejeter les données inattendues avec des messages d'erreur non révélateurs

### 4.2 Protection contre l'injection de formulaire

Les Server Actions Supabase utilisent toujours `data.user.id` depuis le token JWT, **jamais** depuis les données du formulaire :

```typescript
// SÉCURISÉ : l'ID vient de Supabase Auth (JWT vérifié), pas du formulaire
await supabase.from("profiles").upsert({
  id: data.user.id,   // ← ID du JWT, pas de formData
  first_name: firstName,
  ...
});
```

### 4.3 Sanitisation des contenus

- Les questions et contenus pédagogiques passent par un workflow de validation admin avant publication
- Le contenu affiché est encodé par React (protection XSS automatique)
- Les contenus de type Markdown ou HTML doivent être sanitisés avant affichage

---

## 5. Variables d'environnement

### 5.1 Règles absolues

| Variable | Côté | Explication |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Serveur | Sûre à exposer |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Serveur | Sûre si RLS activée |
| `SUPABASE_SERVICE_ROLE_KEY` | **Serveur uniquement** | **Ne jamais exposer** |
| `SUPABASE_JWT_SECRET` | **Serveur uniquement** | **Ne jamais exposer** |

### 5.2 .gitignore

```gitignore
# Ne jamais commiter ces fichiers
.env
.env.local
.env.production
.env.*.local
```

Vérification :
```bash
git log --oneline --all -- .env.local
# Ne doit rien retourner
```

### 5.3 En production

- Utilise les variables d'environnement de l'hébergeur (Vercel, Railway, etc.)
- Ne jamais passer les secrets en argument de ligne de commande (ils apparaissent dans les logs)
- Rotate les clés Supabase si elles ont été exposées accidentellement

---

## 6. Sécurité des en-têtes HTTP

### 6.1 Configuration recommandée dans `next.config.ts`

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

### 6.2 Content Security Policy (CSP)

Ajouter progressivement une CSP pour limiter les sources de contenu autorisées :

```typescript
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requiert unsafe-eval en dev
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} wss://*.supabase.co`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
  ].join("; "),
}
```

---

## 7. Protection contre les injections

### 7.1 SQL Injection

**Impossible** via les clients Supabase JS : les requêtes utilisent des paramètres préparés systématiquement.

```typescript
// Sécurisé — paramètre préparé automatiquement
const { data } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userId);   // userId n'est jamais interpolé dans la chaîne SQL
```

Ne jamais construire des requêtes SQL manuellement avec des chaînes interpolées.

### 7.2 Cross-Site Scripting (XSS)

React encode automatiquement tout contenu rendu dans JSX. **Ne jamais** utiliser `dangerouslySetInnerHTML` sans sanitiser d'abord avec une bibliothèque comme `DOMPurify`.

### 7.3 Cross-Site Request Forgery (CSRF)

Les Server Actions Next.js intègrent une protection CSRF automatique via le mécanisme `same-origin` des requêtes `fetch`. Les cookies sont `HttpOnly` et `SameSite=Lax`.

---

## 8. Gestion des sessions

### 8.1 Expiration

- Access token : **1 heure** (configurable dans Supabase → Auth Settings → JWT expiry)
- Refresh token : **30 jours** (rotation automatique)
- OTP : **10 minutes** (configurable dans Supabase → Auth Settings → OTP expiry)

### 8.2 Déconnexion

```typescript
// La déconnexion révoque le refresh token côté Supabase
await supabase.auth.signOut();
// Redirige vers /login
```

### 8.3 Sessions multiples

Supabase Auth supporte les sessions simultanées sur plusieurs appareils. Pour les comptes sensibles (admin), envisager de limiter à une session active via la table `auth.sessions`.

---

## 9. Journalisation et audit

### 9.1 Table `activity_log`

Toutes les actions administratives sont journalisées :
- Validation/rejet de questions
- Modification de rôle utilisateur
- Suspension de compte
- Connexions suspectes

```sql
-- Exemple d'entrée de log
INSERT INTO public.activity_log (user_id, action, entity, entity_id, detail)
VALUES (
  auth.uid(),
  'question.published',
  'questions',
  'question-uuid',
  '{"subject": "maths", "validated_by": "admin-name"}'
);
```

### 9.2 Ce qu'on ne loge JAMAIS

- Mots de passe ou codes OTP
- Tokens JWT complets
- Numéros de carte bancaire (non applicable ici)
- Données personnelles non nécessaires au diagnostic

### 9.3 Rétention des logs

```sql
-- Purge automatique des logs > 1 an (à planifier)
DELETE FROM public.activity_log
WHERE created_at < NOW() - INTERVAL '1 year';
```

Seul le `super_admin` peut effectuer cette purge (politique RLS).

---

## 10. Déploiement sécurisé

### 10.1 HTTPS

- **Obligatoire en production** — jamais de HTTP en dehors du développement local
- Vercel et la plupart des hébergeurs activent HTTPS automatiquement
- Activer HSTS (voir section 6.1)

### 10.2 Dépendances

```bash
# Vérifier les vulnérabilités connues
npm audit

# Corriger automatiquement les vulnérabilités non critiques
npm audit fix

# Maintenir les dépendances à jour
npm outdated
```

### 10.3 Variables de build

```bash
# Vérifier qu'aucun secret ne fuite dans le bundle client
npm run build
# Inspecter .next/static/chunks/ pour s'assurer qu'aucune clé n'y apparaît
grep -r "service_role" .next/static/ && echo "ALERTE : secret dans le bundle !"
```

### 10.4 Rate Limiting

Dans Supabase → Authentication → Rate Limits, configurer :
- SMS OTP : max 5/heure par numéro de téléphone
- Email OTP : max 10/heure par adresse
- Connexions échouées : max 10/heure par IP

---

## 11. Signalement de vulnérabilités

Si vous découvrez une vulnérabilité de sécurité dans NEKH XËL :

1. **Ne pas** créer d'issue publique GitHub
2. Envoyer un email à : **security@nekh-xel.sn** (à configurer)
3. Inclure :
   - Description détaillée de la vulnérabilité
   - Étapes pour la reproduire
   - Impact potentiel estimé
   - Suggestion de correction (si disponible)
4. Réponse sous 48 heures ouvrées
5. Correction et publication d'un patch dans les 30 jours

---

## 12. Checklist de sécurité

### Avant chaque déploiement

- [ ] `npm audit` — zéro vulnérabilité critique
- [ ] `.env.local` absent du commit (`git status`)
- [ ] `NEXT_PUBLIC_` ne préfixe aucun secret
- [ ] RLS activée sur toutes les tables (`rowsecurity = true`)
- [ ] Build Next.js réussi sans erreur TypeScript
- [ ] Headers de sécurité configurés dans `next.config.ts`
- [ ] OTP Twilio configuré (pas de mode test en production)
- [ ] URLs de redirection Supabase à jour

### Audit trimestriel

- [ ] Revoir les politiques RLS pour toute nouvelle table
- [ ] Vérifier les utilisateurs avec rôle `admin` ou `super_admin`
- [ ] Analyser le journal d'activité pour des patterns suspects
- [ ] Mettre à jour les dépendances (`npm update`)
- [ ] Tester la déconnexion et l'expiration de session
- [ ] Vérifier les logs d'erreur Supabase

---

*NEKH XËL — Sécurité by design — Dernière révision : 2026-05-23*
