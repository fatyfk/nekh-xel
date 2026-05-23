# Guide d'installation — NEKH XËL

> **Pour les débutants** — Ce guide explique chaque étape en détail.
> Temps estimé : 30 à 45 minutes.

---

## Sommaire

1. [Ce dont tu as besoin](#1-ce-dont-tu-as-besoin)
2. [Installer Node.js](#2-installer-nodejs)
3. [Télécharger le projet](#3-télécharger-le-projet)
4. [Installer les dépendances](#4-installer-les-dépendances)
5. [Créer ton compte Supabase](#5-créer-ton-compte-supabase)
6. [Configurer les variables d'environnement](#6-configurer-les-variables-denvironnement)
7. [Créer la base de données](#7-créer-la-base-de-données)
8. [Ajouter les questions de démonstration](#8-ajouter-les-questions-de-démonstration)
9. [Lancer l'application](#9-lancer-lapplication)
10. [Créer ton premier compte](#10-créer-ton-premier-compte)
11. [En cas de problème](#11-en-cas-de-problème)

---

## 1. Ce dont tu as besoin

Avant de commencer, assure-toi d'avoir :

- Un **ordinateur** sous Windows, Mac ou Linux
- Une **connexion Internet**
- Un **compte email** pour créer un compte Supabase (gratuit)
- Un **terminal** (console de commandes) — voir ci-dessous

### Ouvrir un terminal

**Windows :**
- Appuie sur `Windows + R`, tape `cmd` puis Entrée
- Ou cherche "Invite de commandes" dans le menu Démarrer
- Ou (recommandé) installe Windows Terminal depuis le Microsoft Store

**Mac :**
- Appuie sur `Cmd + Espace`, tape `Terminal` puis Entrée

**Linux :**
- `Ctrl + Alt + T` dans la plupart des distributions

---

## 2. Installer Node.js

Node.js est l'environnement qui fait tourner l'application.

### Vérifier si Node.js est déjà installé

Dans ton terminal :

```bash
node --version
```

Si tu vois quelque chose comme `v20.x.x` (version 18 ou supérieure), c'est bon — passe à l'étape 3.

### Installer Node.js

1. Va sur [nodejs.org](https://nodejs.org)
2. Clique le bouton vert **LTS** (Long Term Support — la version stable)
3. Télécharge et installe comme n'importe quel programme
4. **Redémarre ton terminal** après l'installation

Vérifie l'installation :

```bash
node --version   # doit afficher v18.x.x ou supérieur
npm --version    # doit afficher 9.x.x ou supérieur
```

---

## 3. Télécharger le projet

### Option A — Avec Git (recommandé)

Vérifie si Git est installé :
```bash
git --version
```

Si Git est installé :
```bash
# Remplace par l'URL réelle du dépôt
git clone https://github.com/ton-compte/nekh-xel.git
cd nekh-xel
```

### Option B — Sans Git (téléchargement direct)

1. Sur la page GitHub du projet, clique **Code** → **Download ZIP**
2. Extrais le fichier ZIP quelque part (ex : Bureau)
3. Dans le terminal, va dans ce dossier :
   ```bash
   # Windows
   cd C:\Users\TonNom\Desktop\nekh-xel

   # Mac / Linux
   cd ~/Desktop/nekh-xel
   ```

---

## 4. Installer les dépendances

Dans le dossier du projet :

```bash
npm install
```

Cette commande télécharge tous les modules nécessaires (React, Next.js, Supabase, etc.).
Cela peut prendre 1 à 3 minutes selon ta connexion.

Tu verras beaucoup de texte défiler — c'est normal.
À la fin, tu devrais voir `added XXX packages`.

---

## 5. Créer ton compte Supabase

Supabase est la base de données en ligne (gratuite) de l'application.

### 5.1 Créer un compte

1. Va sur **[supabase.com](https://supabase.com)**
2. Clique **Start your project** (gratuit, sans carte bancaire)
3. Connecte-toi avec ton compte GitHub ou crée un compte email

### 5.2 Créer un nouveau projet

1. Clique **New project**
2. Remplis le formulaire :
   - **Organization** : sélectionne ton organisation (ou crée-en une)
   - **Project name** : `nekh-xel` (ou ce que tu veux)
   - **Database Password** : génère un mot de passe fort → **note-le dans un endroit sûr !**
   - **Region** : `West EU (Ireland)` — le plus proche de l'Afrique de l'Ouest
3. Clique **Create new project**
4. Attends environ **2 minutes** — tu veras une animation de chargement

### 5.3 Récupérer tes clés API

Une fois le projet créé :

1. Clique sur **Settings** (icône engrenage ⚙️ en bas du menu de gauche)
2. Clique **API**
3. Note deux valeurs :
   - **Project URL** → ressemble à `https://abcdefghij.supabase.co`
   - **anon public** key → commence par `eyJhbGciOiJIUzI1NiIs...`

Garde ces informations, tu en auras besoin à l'étape suivante.

---

## 6. Configurer les variables d'environnement

Les variables d'environnement permettent à l'application de se connecter à Supabase sans mettre les clés dans le code source.

### 6.1 Créer le fichier `.env.local`

Dans le dossier du projet :

```bash
# Windows (PowerShell)
Copy-Item .env.local.example .env.local

# Mac / Linux
cp .env.local.example .env.local
```

### 6.2 Remplir le fichier

Ouvre `.env.local` avec un éditeur de texte (Notepad, VS Code, TextEdit...) :

```bash
# Windows
notepad .env.local

# Mac
open -e .env.local

# VS Code (si installé)
code .env.local
```

Le fichier ressemble à ceci :

```
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Remplace les valeurs par celles copiées depuis Supabase.

**Exemple concret :**

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important :** Ne mets PAS de guillemets autour des valeurs.

Sauvegarde et ferme le fichier.

---

## 7. Créer la base de données

Les fichiers SQL dans le dossier `supabase/` créent toutes les tables nécessaires.

### 7.1 Ouvrir l'éditeur SQL de Supabase

1. Dans ton projet Supabase, clique **SQL Editor** (icône `<>` dans le menu)
2. Clique **New query** (bouton `+`)

### 7.2 Exécuter le schéma principal

1. Ouvre le fichier `supabase/schema.sql` dans ton éditeur de texte
2. **Sélectionne tout** le contenu (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)
4. **Colle** dans l'éditeur SQL de Supabase
5. Clique le bouton **Run** (▶) ou appuie sur `Ctrl+Enter`
6. Attends quelques secondes
7. Tu dois voir en bas : `Success. No rows returned.`

> Si tu vois une erreur, consulte la section [En cas de problème](#11-en-cas-de-problème).

### 7.3 Appliquer les politiques de sécurité

1. Clique **New query** à nouveau
2. Ouvre le fichier `supabase/rls-policies.sql`
3. Copie-colle tout le contenu dans le nouvel éditeur SQL
4. Clique **Run**
5. Tu dois voir : `Success. No rows returned.`

### 7.4 Vérifier que ça marche

Dans Supabase, clique **Table Editor** (icône grille dans le menu).
Tu devrais voir apparaître plusieurs tables :
- `profiles`
- `subjects` (avec 11 matières déjà remplies)
- `questions`
- `quiz_results`
- ... et d'autres

---

## 8. Ajouter les questions de démonstration

Le fichier `supabase/seed.sql` ajoute 30 questions de démonstration (6 par matière).

1. Dans SQL Editor, clique **New query**
2. Ouvre le fichier `supabase/seed.sql`
3. Copie-colle tout le contenu
4. Clique **Run**
5. À la fin, tu verras un tableau récapitulatif avec le nombre de questions par matière

**Résultat attendu :**

| subject   | nombre_questions | facile | moyen | difficile |
|-----------|-----------------|--------|-------|-----------|
| francais  | 6               | 2      | 2     | 2         |
| geo       | 6               | 2      | 2     | 2         |
| histoire  | 6               | 2      | 2     | 2         |
| maths     | 6               | 2      | 2     | 2         |
| sciences  | 6               | 2      | 2     | 2         |

---

## 9. Lancer l'application

Dans ton terminal, dans le dossier du projet :

```bash
npm run dev
```

Tu verras quelque chose comme :

```
▲ Next.js 16.2.6
- Local: http://localhost:3000
- Ready in 2.1s
```

Ouvre ton navigateur et va sur : **[http://localhost:3000](http://localhost:3000)**

Tu devrais voir la page d'accueil de NEKH XËL !

### Arrêter l'application

Dans le terminal, appuie sur `Ctrl + C`.

### Relancer après avoir fermé le terminal

```bash
# Revenir dans le dossier du projet
cd chemin/vers/nekh-xel

# Relancer
npm run dev
```

---

## 10. Créer ton premier compte

### 10.1 Activer l'authentification téléphone (pour les tests)

1. Dans Supabase, va dans **Authentication** → **Providers** → **Phone**
2. Active le toggle **Enable Phone provider**
3. Pour les tests sans SMS réels, active **Enable fake SMS OTP**
   (le code `123456` fonctionnera pour tous les numéros)
4. Sauvegarde

### 10.2 S'inscrire sur l'application

1. Va sur [http://localhost:3000/register](http://localhost:3000/register)
2. Choisis **Inscription par téléphone**
3. Entre un numéro de test : `+221700000001`
4. Remplis ton prénom, nom et choisis un rôle (commence par **Élève**)
5. Clique **Envoyer le code**
6. Entre le code : `123456`
7. Tu es redirigé vers le dashboard élève

### 10.3 Créer un compte administrateur

Pour accéder au dashboard admin :

1. Crée d'abord un compte normal (élève, enseignant ou parent)
2. Dans Supabase → **Table Editor** → **profiles**
3. Trouve ton utilisateur dans la liste
4. Clique sur la ligne et modifie le champ `role` en `admin`
5. Sauvegarde

Ou via SQL Editor :

```sql
-- Remplace 'ton-email@exemple.com' par ton email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ton-email@exemple.com';
```

---

## 11. En cas de problème

### "npm : commande introuvable"

Node.js n'est pas installé ou pas dans le PATH.
→ Réinstalle Node.js depuis [nodejs.org](https://nodejs.org) et redémarre le terminal.

---

### "Cannot find module" ou erreur à `npm install`

Essaie de supprimer le dossier `node_modules` et relance :

```bash
# Windows
rd /s /q node_modules

# Mac / Linux
rm -rf node_modules

# Puis relance
npm install
```

---

### Erreur Supabase : "Invalid API key"

Les clés dans `.env.local` sont incorrectes ou ont des espaces en trop.
Vérifie :
1. Pas de guillemets autour des valeurs
2. Pas d'espaces avant ou après le `=`
3. La clé `anon public` (pas `service_role`)
4. L'URL commence par `https://` et finit par `.supabase.co`

Après correction, redémarre le serveur :
```bash
# Ctrl+C pour arrêter, puis
npm run dev
```

---

### Erreur SQL : "type already exists"

Les types enum existent déjà (tu as peut-être exécuté le script deux fois).
Le schéma utilise `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$`
pour éviter cela. Si l'erreur persiste, contacte le support.

---

### La page s'affiche mais les quiz ne fonctionnent pas

Vérifie que les questions de démonstration ont bien été ajoutées (étape 8).

Dans Supabase → SQL Editor :
```sql
SELECT COUNT(*) FROM public.questions WHERE status = 'published';
-- Doit retourner 30
```

---

### Port 3000 déjà utilisé

```bash
# Lancer sur un autre port
npm run dev -- -p 3001
# Puis aller sur http://localhost:3001
```

---

## Félicitations !

Tu as installé NEKH XËL avec succès. Voici ce que tu peux faire maintenant :

- 🎮 **Jouer** : [http://localhost:3000/quiz](http://localhost:3000/quiz)
- 👨‍🎓 **Dashboard élève** : [http://localhost:3000/dashboard/student](http://localhost:3000/dashboard/student)
- 👩‍🏫 **Dashboard enseignant** : créer un compte avec rôle "enseignant"
- 👑 **Dashboard admin** : modifier ton rôle en `admin` dans Supabase

Pour déployer en production, consulte le [README.md](../README.md#déploiement).
Pour la configuration Supabase avancée, consulte [docs/SUPABASE.md](SUPABASE.md).

---

*NEKH XËL — « Le savoir est bon » — Plateforme éducative sénégalaise*
