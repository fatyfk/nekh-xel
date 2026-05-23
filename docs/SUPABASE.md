# Guide Supabase — NEKH XËL

> Guide complet de connexion et configuration Supabase.
> Couvre le développement local, la configuration OTP SMS et la mise en production.

---

## Sommaire

1. [Créer un projet Supabase](#1-créer-un-projet-supabase)
2. [Tableau de bord Supabase — Navigation](#2-tableau-de-bord-supabase--navigation)
3. [Récupérer les clés API](#3-récupérer-les-clés-api)
4. [Configurer les URLs de redirection](#4-configurer-les-urls-de-redirection)
5. [Activer l'authentification par téléphone](#5-activer-lauthentification-par-téléphone)
6. [Mode développement — OTP simulé](#6-mode-développement--otp-simulé)
7. [Configurer Twilio pour la production](#7-configurer-twilio-pour-la-production)
8. [Exécuter les migrations SQL](#8-exécuter-les-migrations-sql)
9. [Vérifier la sécurité (RLS)](#9-vérifier-la-sécurité-rls)
10. [Gestion des utilisateurs](#10-gestion-des-utilisateurs)
11. [Variables d'environnement complètes](#11-variables-denvironnement-complètes)
12. [Passer en production](#12-passer-en-production)
13. [Sauvegardes et maintenance](#13-sauvegardes-et-maintenance)
14. [Résolution des problèmes](#14-résolution-des-problèmes)

---

## 1. Créer un projet Supabase

### Étape 1.1 — Compte Supabase

1. Va sur **[supabase.com](https://supabase.com)**
2. Clique **Start your project** (gratuit, pas de carte bancaire)
3. Connecte-toi avec :
   - **GitHub** ← recommandé, rapide et sans nouveau mot de passe
   - **Email + mot de passe**

### Étape 1.2 — Nouveau projet

Depuis le dashboard principal, clique **New project** et remplis :

| Champ | Valeur recommandée |
|-------|-------------------|
| Organization | Sélectionne ou crée ton organisation |
| Project name | `nekh-xel` |
| Database Password | Génère automatiquement (clique l'icône) — **sauvegarde-le !** |
| Region | **West EU (Ireland)** — latence minimale depuis l'Afrique de l'Ouest |

Clique **Create new project** et attends 2–3 minutes.

> Le mot de passe de base de données est différent des clés API.
> Il sert uniquement aux connexions directes PostgreSQL (pgAdmin, etc.).

---

## 2. Tableau de bord Supabase — Navigation

Une fois dans ton projet, le menu de gauche contient :

| Icône | Section | Utilisation dans NEKH XËL |
|-------|---------|--------------------------|
| 🏠 | **Home** | Vue d'ensemble du projet |
| 📊 | **Table Editor** | Voir et modifier les données |
| `<>` | **SQL Editor** | Exécuter les fichiers SQL |
| 🔑 | **Authentication** | Gérer les utilisateurs, OTP, providers |
| 📦 | **Storage** | Stockage fichiers (avatars — optionnel) |
| ⚡ | **Edge Functions** | Fonctions serverless (optionnel) |
| ⚙️ | **Settings** | Clés API, URLs, configuration |

---

## 3. Récupérer les clés API

**Settings** → **API**

### Clés à copier

```
Project URL    : https://xxxxxxxxxxxxxxxxxxxx.supabase.co
anon key       : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (longue chaîne)
service_role   : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (différente de anon)
```

### Quelle clé utiliser où ?

| Clé | Environnement | Sécurité |
|-----|---------------|----------|
| `anon public` | Navigateur (préfixe `NEXT_PUBLIC_`) | Sûre à exposer — protégée par RLS |
| `service_role` | Serveur uniquement | **JAMAIS dans le navigateur** — bypass RLS total |
| Project URL | Navigateur + serveur | Sûre à exposer |

Dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`, utilise la clé **anon**.

---

## 4. Configurer les URLs de redirection

**Authentication** → **URL Configuration**

### En développement

```
Site URL       : http://localhost:3000
Redirect URLs  : http://localhost:3000/**
```

### En production (exemple Vercel)

```
Site URL       : https://nekh-xel.vercel.app
Redirect URLs  : https://nekh-xel.vercel.app/**
                 https://nekh-xel-*.vercel.app/**   (pour les preview deployments)
```

> **Important :** Ne pas mettre de slash final dans Site URL.
> Le `/**` dans Redirect URLs permet toutes les sous-routes.

---

## 5. Activer l'authentification par téléphone

**Authentication** → **Providers** → **Phone**

### Configuration minimale

1. Active le toggle **Enable Phone provider**
2. Choisis un provider SMS (voir options ci-dessous)
3. Sauvegarde

### Providers SMS disponibles

| Provider | Usage | Notes |
|----------|-------|-------|
| **Twilio** | Production | Recommandé, fiable, tarif à l'usage |
| **Twilio Verify** | Production | Version améliorée de Twilio |
| **MessageBird** | Production | Alternative européenne |
| **Vonage** | Production | Ex Nexmo, bon pour l'Afrique |
| **Test mode** | Développement | Pas de SMS, code fixe |

---

## 6. Mode développement — OTP simulé

En développement, tu n'as **pas besoin de Twilio**. Utilise les numéros de test Supabase.

### Option A — "Fake SMS" via la console Supabase

1. **Authentication** → **Providers** → **Phone**
2. Sélectionne **No external provider** (ou laisse vide)
3. Active **Enable fake OTP** si disponible dans ton plan

Avec ce mode, le code OTP est toujours `123456` pour n'importe quel numéro.

### Option B — Voir l'OTP dans les logs Supabase

1. **Authentication** → **Logs**
2. Filtre par event type → `OTP`
3. Le code envoyé apparaît dans les logs

### Option C — Insérer un utilisateur manuellement

Pour bypasser complètement l'OTP en développement :

```sql
-- Dans SQL Editor — insère un utilisateur de test
-- (uniquement en dev, jamais en prod !)
INSERT INTO auth.users (
  id, phone, phone_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '+221700000001',
  NOW(),
  '{"role": "student", "first_name": "Aminata", "last_name": "Diallo"}'::jsonb,
  NOW(), NOW()
);
```

---

## 7. Configurer Twilio pour la production

### Étape 7.1 — Créer un compte Twilio

1. Va sur **[twilio.com](https://www.twilio.com)** → **Sign Up** (essai gratuit)
2. Vérifie ton email et ton numéro de téléphone
3. Dans la console Twilio, note :
   - **Account SID** : `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token** : visible sur la page d'accueil de la console

### Étape 7.2 — Obtenir un numéro Twilio

**Option A — Numéro Twilio standard** (moins cher mais peut être bloqué par certains opérateurs) :
1. Twilio console → **Phone Numbers** → **Buy a number**
2. Filtre par pays si possible (US ou UK pour la couverture globale)
3. Prends un numéro avec la capacité **SMS**
4. Note le numéro au format `+12015551234`

**Option B — Messaging Service** (recommandé pour l'Afrique) :
1. Twilio console → **Messaging** → **Services** → **Create Messaging Service**
2. Donne un nom : `Nekh Xël SMS`
3. Ajoute un numéro à ce service
4. Note le **Messaging Service SID** : `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Étape 7.3 — Configurer dans Supabase

**Authentication** → **Providers** → **Phone** :

```
SMS Provider         : Twilio
Twilio Account SID   : ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Twilio Auth Token    : xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Twilio Phone Number  : +12015551234
   OU
Twilio Messaging Service SID : MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Template du message** (optionnel, personnalise le SMS) :
```
Ton code NEKH XËL : {{ .Token }}
Valable 10 minutes. Ne le partage avec personne.
```

### Étape 7.4 — Tester l'envoi SMS

Après configuration, essaie de t'inscrire avec un vrai numéro sénégalais (`+221...`).
Vérifie dans Twilio → **Monitor** → **Messaging** → **Logs** si le SMS a été envoyé.

---

## 8. Exécuter les migrations SQL

### Ordre d'exécution (important !)

Les fichiers SQL doivent être exécutés dans cet ordre :

```
1. supabase/schema.sql        → Crée toutes les tables, types, triggers, vues
2. supabase/rls-policies.sql  → Applique les politiques de sécurité
3. supabase/seed.sql          → Insère 30 questions de démonstration
```

### Comment exécuter dans Supabase

1. **SQL Editor** → clique **New query** (bouton `+`)
2. Ouvre le fichier SQL dans ton éditeur de texte
3. **Ctrl+A** pour tout sélectionner
4. **Ctrl+C** pour copier
5. Clique dans l'éditeur SQL de Supabase
6. **Ctrl+V** pour coller
7. Clique **Run** (▶) ou `Ctrl+Enter`
8. Attends le message de succès

### Vérifier après schema.sql

```sql
-- Tables créées correctement ?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Attendu : profiles, parent_child, teacher_student, subjects,
--           themes, questions, sessions, session_participants,
--           quiz_results, user_xp, badges, user_badges,
--           conversations, messages, notifications, activity_log
```

### Vérifier après rls-policies.sql

```sql
-- RLS activé sur toutes les tables ?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- rowsecurity doit être 't' (true) pour toutes les tables
```

### Vérifier après seed.sql

```sql
-- 30 questions insérées ?
SELECT subject, COUNT(*) FROM public.questions
WHERE status = 'published'
GROUP BY subject ORDER BY subject;
```

---

## 9. Vérifier la sécurité (RLS)

### Tester les politiques depuis l'API

En développement, tu peux tester les politiques en simulant différents rôles :

```sql
-- Simule un utilisateur (remplace par un vrai UUID de auth.users)
SET LOCAL role = 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub": "VOTRE-USER-UUID", "role": "authenticated"}';

-- Est-ce que cet utilisateur voit ses données ?
SELECT * FROM public.quiz_results;
SELECT * FROM public.profiles;
```

### Politique de mot de passe

**Authentication** → **Settings** → **Auth Settings** :

```
Minimum password length : 8
Must contain uppercase   : ✓
Must contain number      : ✓
```

### Rate limiting

Par défaut, Supabase limite à 30 emails/heure et 360 SMS/heure.
Pour la production, ajuste dans **Authentication** → **Rate Limits**.

---

## 10. Gestion des utilisateurs

### Voir tous les utilisateurs

**Authentication** → **Users** affiche tous les comptes.

Ou en SQL :
```sql
SELECT
  u.id,
  u.phone,
  u.email,
  u.created_at,
  p.first_name,
  p.last_name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

### Promouvoir un utilisateur en admin

```sql
-- Via email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@exemple.com';

-- Via téléphone
UPDATE public.profiles
SET role = 'admin'
WHERE phone = '+221700000001';

-- Via UUID
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

### Suspendre un utilisateur

```sql
-- Marque le profil comme inactif (l'utilisateur peut encore se connecter
-- mais ses données ne sont plus visibles dans l'app)
UPDATE public.profiles SET is_active = FALSE WHERE id = 'UUID';

-- Pour bloquer complètement la connexion, utilise l'interface Supabase :
-- Authentication → Users → clique l'utilisateur → "Ban user"
```

### Supprimer un utilisateur (RGPD)

```sql
-- La suppression dans auth.users supprime en cascade le profil et les données
-- liées grâce à ON DELETE CASCADE
DELETE FROM auth.users WHERE id = 'UUID';
```

---

## 11. Variables d'environnement complètes

Copie ceci dans `.env.local` (remplace les `...`) :

```env
# ─── OBLIGATOIRES ─────────────────────────────────────────────

# URL du projet Supabase (Settings → API → Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# Clé anon publique (Settings → API → anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de l'application (sans slash final)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ─── RECOMMANDÉS ──────────────────────────────────────────────

# Clé service role — SERVEUR UNIQUEMENT (Settings → API → service_role)
# Utiliser pour les Server Actions qui doivent bypasser RLS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Nom de l'application
NEXT_PUBLIC_APP_NAME=NEKH XËL

# ─── OPTIONNELS ───────────────────────────────────────────────

# Twilio — renseignés directement dans le dashboard Supabase, pas ici
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_PHONE_NUMBER=+12015551234
```

---

## 12. Passer en production

### Checklist de déploiement

- [ ] Variables d'env définies sur l'hébergeur (Vercel, Railway, etc.)
- [ ] `NEXT_PUBLIC_SITE_URL` = URL de production
- [ ] URLs de redirection Supabase mises à jour (section 4)
- [ ] Twilio configuré dans Supabase (section 7)
- [ ] Les 3 fichiers SQL exécutés dans l'ordre (section 8)
- [ ] RLS activé sur toutes les tables (section 9)
- [ ] Au moins un compte `admin` ou `super_admin` créé (section 10)
- [ ] Build de production réussi : `npm run build`

### Déployer sur Vercel

```bash
# Installe Vercel CLI
npm install -g vercel

# Dans le dossier du projet
vercel

# Réponds aux questions :
# - Set up and deploy? Y
# - Project name: nekh-xel
# - Link to existing project? N (premier déploiement)
```

Dans le dashboard Vercel, ajoute les variables d'env :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (ton URL Vercel)

### Déployer sur Railway

1. Va sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionne ton dépôt
4. Ajoute les variables d'env dans **Variables**

---

## 13. Sauvegardes et maintenance

### Sauvegardes automatiques

Supabase crée des backups automatiques :
- **Plan Free** : 1 backup par jour, conservé 7 jours
- **Plan Pro** : backups continus (Point In Time Recovery)

### Sauvegarde manuelle

```bash
# Nécessite psql installé localement
# Récupère l'URL de connexion dans Settings → Database → Connection string

pg_dump "postgres://postgres:PASSWORD@HOST:5432/postgres" > backup_$(date +%Y%m%d).sql
```

### Nettoyer les anciens résultats (optionnel, RGPD)

```sql
-- Supprime les quiz_results de plus de 2 ans
DELETE FROM public.quiz_results
WHERE played_at < NOW() - INTERVAL '2 years';

-- Supprime les logs d'activité de plus de 1 an
DELETE FROM public.activity_log
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Monitorer les performances

Dans Supabase → **Reports** :
- **API** : nombre de requêtes par heure
- **Database** : utilisation CPU et mémoire
- **Auth** : connexions réussies/échouées

---

## 14. Résolution des problèmes

### "JWT expired" — Token expiré

La session a expiré. Dans `src/lib/supabase/server.ts`, vérifie que `createServerClient` est bien configuré pour rafraîchir les tokens.

Solution rapide : l'utilisateur se reconnecte. En production, configure **Authentication** → **Auth Settings** → **JWT expiry** à `3600` (1 heure) avec refresh token.

---

### "Row not found" sur profiles

Le trigger `handle_new_user` ne s'est pas exécuté.

Vérification :
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';
-- Doit retourner : trg_auth_user_created
```

Réparation manuelle :
```sql
-- Insère les profils manquants
INSERT INTO public.profiles (id, role, phone, email)
SELECT
  id,
  COALESCE((raw_user_meta_data->>'role')::public.user_role, 'student'),
  phone,
  email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
```

---

### "Phone signups are disabled"

Le provider Phone n'est pas activé.
→ **Authentication** → **Providers** → **Phone** → activer.

---

### L'OTP SMS n'arrive pas

1. Vérifie que Twilio est configuré (Account SID, Auth Token, numéro)
2. Dans Twilio console → **Monitor** → **Messaging** → **Logs** : cherche l'erreur
3. Erreurs courantes :
   - `Error 21614` : numéro invalide (format incorrect)
   - `Error 21408` : numéro non autorisé dans ce pays
   - `Error 20003` : Account SID ou Auth Token incorrect

---

### "new row violates row-level security policy"

Une politique RLS bloque l'insertion.

Debug :
```sql
-- Vérifie les politiques de la table
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'nom_de_la_table';
```

---

### Connexion lente depuis Dakar

Supabase est hébergé en Europe ou aux USA. Pour réduire la latence :
1. Utilise la région **West EU (Ireland)** — la plus proche de Dakar
2. Active **Supabase Edge Network** (disponible sur les plans payants)
3. Mets en cache les données statiques (matières, thèmes) côté client

---

*Pour toute question, ouvre une issue sur le dépôt GitHub ou consulte [supabase.com/docs](https://supabase.com/docs).*
