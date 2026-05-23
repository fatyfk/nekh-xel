# Guide Supabase — NEKH XËL

Ce guide explique pas à pas comment connecter NEKH XËL à Supabase,
configurer l'authentification par SMS OTP, et préparer la base de données.

---

## Sommaire

1. [Créer un projet Supabase](#1-créer-un-projet-supabase)
2. [Récupérer les clés API](#2-récupérer-les-clés-api)
3. [Configurer .env.local](#3-configurer-envlocal)
4. [Créer les tables](#4-créer-les-tables)
5. [Activer l'auth téléphone OTP](#5-activer-lauth-téléphone-otp)
6. [Configurer Twilio pour la production](#6-configurer-twilio-pour-la-production)
7. [Configurer les URLs de redirection](#7-configurer-les-urls-de-redirection)
8. [Tester l'authentification](#8-tester-lauthentification)
9. [Passer en production](#9-passer-en-production)
10. [Résolution des problèmes courants](#10-résolution-des-problèmes-courants)

---

## 1. Créer un projet Supabase

### 1.1 Créer un compte

1. Va sur **[supabase.com](https://supabase.com)**
2. Clique **Start your project** (gratuit, sans carte bancaire)
3. Connecte-toi avec GitHub ou crée un compte email

### 1.2 Créer un nouveau projet

1. Dans ton dashboard, clique **New project**
2. Remplis :
   - **Name** : `nekh-xel` (ou autre)
   - **Database Password** : génère un mot de passe fort et **note-le** (tu en auras besoin si tu te connectes directement à PostgreSQL)
   - **Region** : `West EU (Ireland)` — le plus proche de l'Afrique de l'Ouest
3. Clique **Create new project**
4. Attends environ **2 minutes** que la base de données soit initialisée

---

## 2. Récupérer les clés API

### Où trouver les clés

1. Dans ton projet Supabase, clique **Settings** (icône engrenage en bas à gauche)
2. Puis **API**

Tu trouveras :

| Clé | Description | Utilisation |
|-----|-------------|-------------|
| **Project URL** | URL unique de ton projet | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon (public)** | Clé publique (safe browser) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Clé admin (serveur uniquement !) | `SUPABASE_SERVICE_ROLE_KEY` |

> **ATTENTION** : Ne mets JAMAIS la clé `service_role` dans du code client.
> Elle bypass toutes les politiques RLS.

---

## 3. Configurer .env.local

Dans le dossier du projet, copie le fichier exemple :

```bash
cp .env.local.example .env.local
```

Ouvre `.env.local` et remplis :

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Remplace les valeurs par celles copiées depuis Settings > API.

**Redémarre** le serveur de développement :
```bash
npm run dev
```

---

## 4. Créer les tables

Les migrations créent automatiquement toutes les tables avec leurs politiques de sécurité (RLS).

### Étape 4.1 — Table `profiles`

1. Dans ton projet Supabase, va dans **SQL Editor**
2. Clique **New query**
3. Copie-colle l'intégralité du fichier `supabase/migrations/001_profiles.sql`
4. Clique **Run** (ou Ctrl+Enter)
5. Tu devrais voir : `Success. No rows returned.`

**Ce que ça crée :**
- Table `profiles` liée à `auth.users`
- Trigger : profil créé automatiquement à chaque inscription
- Trigger : `updated_at` mis à jour automatiquement
- RLS : chaque utilisateur ne voit que son propre profil
- RLS : les admins voient tous les profils

### Étape 4.2 — Tables `questions` et `quiz_results`

1. Dans SQL Editor, crée une **New query**
2. Copie-colle `supabase/migrations/002_questions.sql`
3. Clique **Run**
4. Tu devrais voir : `Success. No rows returned.`

**Ce que ça crée :**
- Table `questions` avec 10 questions de démonstration publiées
- Table `quiz_results` pour l'historique des quiz
- RLS : tout le monde lit les questions publiées, seuls les enseignants créent, seuls les admins valident

### Vérifier les tables

Dans **Table Editor**, tu devrais voir :
- `profiles` (vide pour l'instant)
- `questions` (10 lignes de démonstration)
- `quiz_results` (vide)

---

## 5. Activer l'auth téléphone OTP

### 5.1 Activer le provider Phone

1. **Authentication** (icône cadenas) > **Providers**
2. Trouve **Phone** et clique pour l'ouvrir
3. Active le toggle **Enable Phone provider**
4. Sauvegarde

### 5.2 Mode développement — OTP simulé

En développement, tu n'as **pas besoin de Twilio**. Supabase peut simuler les SMS :

1. **Authentication** > **Configuration** > **Phone**
2. Cherche **Test OTP** ou **SMS Provider** : sélectionne **None (SMS disabled)**
3. Pour tester, utilise les numéros de test Supabase :
   - N'importe quel numéro fictif (ex: `+221700000001`)
   - Le code OTP sera toujours `123456`

> **Note** : En mode test, Supabase n'envoie pas de vrai SMS.
> Le code `123456` fonctionne pour tous les numéros.

Pour activer les OTP de test :

1. **Authentication** > **Providers** > **Phone**
2. Active **Enable test OTP** (si disponible dans ton plan)
3. Ou utilise l'API directement pour confirmer le numéro

### Alternative : Voir les tokens dans les logs

1. **Authentication** > **Logs**
2. Filtre par **Phone** pour voir les OTP générés

---

## 6. Configurer Twilio pour la production

### 6.1 Créer un compte Twilio

1. Va sur **[twilio.com](https://www.twilio.com)** et crée un compte
2. Vérifie ton numéro de téléphone
3. Dans la console Twilio, note :
   - **Account SID** (commence par `AC...`)
   - **Auth Token**
4. Achète un numéro de téléphone Twilio (ou crée un **Messaging Service**)

### 6.2 Configurer dans Supabase

1. Dans Supabase : **Authentication** > **Providers** > **Phone**
2. Sélectionne **Twilio** comme SMS Provider
3. Remplis :
   - **Twilio Account SID** : ton Account SID
   - **Twilio Auth Token** : ton Auth Token
   - **Twilio Phone Number** : le numéro acheté (ex: `+12015551234`)
   - Ou **Twilio Messaging Service SID** (recommandé pour la production)
4. **Message Template** (optionnel) :
   ```
   Ton code NEKH XËL : {{ .Token }}. Valable 10 minutes.
   ```
5. Sauvegarde

### 6.3 Vérifier avec Twilio

Pour tester sans déployer :
1. Dans Supabase **SQL Editor** :
   ```sql
   -- Vérifie qu'un utilisateur test existe
   SELECT * FROM auth.users LIMIT 5;
   ```
2. Essaie de t'inscrire avec un vrai numéro sénégalais (`+221...`)

---

## 7. Configurer les URLs de redirection

### En développement

1. **Authentication** > **URL Configuration**
2. **Site URL** : `http://localhost:3000`
3. **Redirect URLs** : ajoute `http://localhost:3000/**`

### En production (Vercel)

1. Déploie d'abord l'application sur Vercel
2. Note l'URL Vercel (ex: `https://nekh-xel.vercel.app`)
3. Dans Supabase :
   - **Site URL** : `https://nekh-xel.vercel.app`
   - **Redirect URLs** : `https://nekh-xel.vercel.app/**`
4. Dans Vercel, ajoute la variable d'env :
   - `NEXT_PUBLIC_SITE_URL` = `https://nekh-xel.vercel.app`

---

## 8. Tester l'authentification

### Test complet du flux

1. Lance `npm run dev`
2. Va sur [http://localhost:3000/register](http://localhost:3000/register)
3. Remplis le formulaire avec un numéro de test (ex: `+221700000001`)
4. Clique **Envoyer le code**
5. Entre le code `123456` (mode test)
6. Tu devrais être redirigé vers le dashboard selon le rôle choisi

### Vérifier dans Supabase

1. **Authentication** > **Users** : tu dois voir l'utilisateur créé
2. **Table Editor** > **profiles** : le profil doit avoir été créé automatiquement

### Créer un admin manuellement

Pour donner le rôle `admin` à un utilisateur existant :

```sql
-- Dans SQL Editor, remplace 'USER_ID' par le vrai UUID
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_ID';
```

---

## 9. Passer en production

### Checklist avant le déploiement

- [ ] Variables d'env définies sur Vercel/hébergeur
- [ ] `NEXT_PUBLIC_SITE_URL` pointe vers la vraie URL
- [ ] Twilio configuré dans Supabase (pas de faux SMS)
- [ ] URLs de redirection Supabase mises à jour
- [ ] Les migrations SQL sont appliquées
- [ ] Le build passe sans erreur (`npm run build`)
- [ ] RLS activé sur toutes les tables (vérifie dans Table Editor)

### Sécurité de production

```sql
-- Vérifie que RLS est bien activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- rowsecurity doit être 't' (true) pour profiles, questions, quiz_results
```

### Performance

Pour les grandes bases d'utilisateurs, ajoute des index :

```sql
-- Optionnel : index sur le rôle pour les vérifications admin
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Index sur played_at pour trier l'historique
CREATE INDEX IF NOT EXISTS idx_quiz_results_played ON public.quiz_results (user_id, played_at DESC);
```

---

## 10. Résolution des problèmes courants

### "Invalid API key"

**Cause** : Variables d'env incorrectes ou non chargées.  
**Solution** :
1. Vérifie `.env.local` (pas de guillemets, pas d'espaces)
2. Redémarre `npm run dev`
3. Vérifie que l'URL commence par `https://` et finit par `.supabase.co`

---

### "Phone signups are disabled"

**Cause** : Le provider Phone n'est pas activé dans Supabase.  
**Solution** : Authentication > Providers > Phone > activer.

---

### "SMS not sent" en développement

**Cause** : Pas de provider SMS configuré.  
**Solution** : Utilise le mode test (code `123456`) ou configure Twilio.

---

### "new row violates row-level security policy"

**Cause** : Une politique RLS bloque une insertion.  
**Solution** :
1. Vérifie que l'utilisateur est bien authentifié
2. Vérifie la politique dans Table Editor > ta table > Policies
3. En debug, tu peux temporairement désactiver RLS :
   ```sql
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   -- ATTENTION : Ne fais jamais ça en production !
   ```

---

### Le profil n'est pas créé automatiquement

**Cause** : Le trigger `handle_new_user` n'est pas installé.  
**Solution** : Réexécute la migration `001_profiles.sql`.

Vérifie que le trigger existe :
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

### Redirection infinie (middleware)

**Cause** : Le cookie de session Supabase n'est pas dans le format attendu.  
**Solution** :
1. Vide les cookies du navigateur (F12 > Application > Cookies > Clear all)
2. Vérifie que `@supabase/ssr` est bien à la version `^0.10.3`

---

*Pour toute question, ouvre une issue sur le dépôt GitHub du projet.*
