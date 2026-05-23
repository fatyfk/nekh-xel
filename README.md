# NEKH XËL

> **Nekh Xël** signifie « le savoir est bon » en wolof.
> Plateforme éducative sénégalaise interactive inspirée des jeux Génie en Herbe,
> destinée aux élèves de CM2.

---

## Table des matières

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Stack technique](#stack-technique)
4. [Prérequis](#prérequis)
5. [Installation rapide](#installation-rapide)
6. [Configuration Supabase](#configuration-supabase)
7. [Variables d'environnement](#variables-denvironnement)
8. [Lancer en développement](#lancer-en-développement)
9. [Structure du projet](#structure-du-projet)
10. [Déploiement](#déploiement)
11. [Contribuer](#contribuer)

---

## Présentation

NEKH XËL est une application web Next.js qui permet aux élèves sénégalais de :

- S'entraîner aux 11 matières du programme CM2 sénégalais
- Jouer à des quiz chronométrés avec 4 types de questions
- Suivre leur progression et gagner des XP
- Préparer les compétitions Génie en Herbe

Les enseignants peuvent créer des questions, organiser des sessions, et suivre les résultats de leurs élèves. Les parents voient l'évolution de leur enfant. Les administrateurs valident les contenus.

---

## Fonctionnalités

### Élèves
- Quiz interactifs (QCM, Vrai/Faux, Association, Identification avec indices)
- 11 matières CM2 : Mathématiques, Français, Histoire, Géographie, Sciences, Instruction civique, Orthographe, Conjugaison, Grammaire, Calcul mental, Culture générale
- Chronomètre par question avec barre de progression colorée
- Score animé et corrections détaillées avec explications pédagogiques
- Historique et statistiques personnelles
- Système d'XP et de niveaux

### Enseignants
- Liste des élèves avec statistiques par matière
- Création de questions (formulaire complet + import CSV)
- Création de sessions d'entraînement et d'évaluation
- Tableau de bord avec résultats de la classe

### Parents
- Résultats de l'enfant par matière
- Graphique de progression dans le temps
- Détection automatique des points forts et difficultés

### Administrateurs
- Gestion CRUD des utilisateurs
- Validation et publication des questions soumises
- Gestion des matières et thèmes
- Journal des activités et statistiques globales

---

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.2.6 | Framework React (App Router) |
| **React** | 19.2.4 | UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Styles (PostCSS) |
| **Supabase** | 2.x | Base de données + Auth |
| **@supabase/ssr** | 0.10.3 | Intégration Next.js SSR |
| **Zod** | 4.x | Validation des formulaires |
| **React Hook Form** | 7.x | Gestion des formulaires |

---

## Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 9.x ou supérieur (inclus avec Node.js)
- Un compte **Supabase** gratuit (supabase.com)
- Optionnel : un compte **Twilio** pour les SMS OTP (ou utiliser le simulateur Supabase)

---

## Installation rapide

### 1. Cloner le projet

```bash
git clone https://github.com/ton-compte/nekh-xel.git
cd nekh-xel
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.local.example .env.local

# Ouvrir et remplir les valeurs (voir section suivante)
notepad .env.local   # Windows
# ou
nano .env.local      # Linux/Mac
```

### 4. Configurer Supabase

Voir la section [Configuration Supabase](#configuration-supabase) ci-dessous ou le fichier [SUPABASE.md](SUPABASE.md).

### 5. Appliquer les migrations de base de données

Dans le dashboard Supabase > **SQL Editor**, exécute dans l'ordre :

1. `supabase/migrations/001_profiles.sql`
2. `supabase/migrations/002_questions.sql`

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

---

## Configuration Supabase

> Voir aussi le guide détaillé : **[SUPABASE.md](SUPABASE.md)**

### Étape 1 — Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et connecte-toi
2. Clique **New project**
3. Choisis un nom (ex: `nekh-xel`), une région (**West EU** ou **US East** pour latence minimale), un mot de passe fort
4. Attends ~2 minutes que le projet soit prêt

### Étape 2 — Récupérer les clés API

1. Dans ton projet Supabase : **Settings** > **API**
2. Copie :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 3 — Créer les tables

1. Va dans **SQL Editor**
2. Colle et exécute le contenu de `supabase/migrations/001_profiles.sql`
3. Colle et exécute le contenu de `supabase/migrations/002_questions.sql`

### Étape 4 — Activer l'authentification téléphone (OTP SMS)

1. **Authentication** > **Providers** > **Phone**
2. Active le provider
3. En développement : active **Enable Phone Confirmations** avec le mode **Test OTP** (code `123456` pour tous les numéros)
4. En production : configure Twilio (voir SUPABASE.md)

---

## Variables d'environnement

Copie `.env.local.example` en `.env.local` et remplis :

```env
# Obligatoires
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Optionnels
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NEKH XËL
```

> **Important** : Redémarre `npm run dev` après chaque modification de `.env.local`.

---

## Lancer en développement

```bash
# Serveur de développement (Turbopack)
npm run dev

# Vérification TypeScript
npx tsc --noEmit

# Build de production (teste avant de déployer)
npm run build

# Linter
npm run lint
```

---

## Structure du projet

```
nekh-xel/
├── src/
│   ├── app/                          # Pages (Next.js App Router)
│   │   ├── page.tsx                  # Page d'accueil
│   │   ├── login/page.tsx            # Connexion (email ou téléphone)
│   │   ├── register/page.tsx         # Inscription
│   │   ├── quiz/
│   │   │   ├── page.tsx              # Sélection matière → quiz → résultats
│   │   │   ├── history/page.tsx      # Historique et statistiques personnelles
│   │   │   └── [id]/page.tsx         # Quiz spécifique (legacy)
│   │   ├── dashboard/
│   │   │   ├── student/page.tsx      # Dashboard élève
│   │   │   ├── teacher/
│   │   │   │   ├── page.tsx          # Dashboard enseignant
│   │   │   │   ├── students/page.tsx # Liste des élèves
│   │   │   │   ├── questions/page.tsx# Création et gestion des questions
│   │   │   │   └── sessions/page.tsx # Gestion des sessions
│   │   │   ├── parent/page.tsx       # Dashboard parent
│   │   │   └── admin/page.tsx        # Dashboard administrateur
│   │   └── actions/
│   │       ├── auth.ts               # Server Actions — email/mdp
│   │       └── auth-phone.ts         # Server Actions — téléphone OTP
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client navigateur
│   │   │   └── server.ts             # Client serveur (SSR)
│   │   ├── validations/
│   │   │   └── auth.ts               # Schémas Zod
│   │   └── data/
│   │       └── demo-questions.ts     # 10 questions exemple par matière
│   └── middleware.ts                 # Auth + redirections par rôle
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql          # Table profiles + RLS
│       └── 002_questions.sql         # Table questions + résultats + RLS
├── public/                           # Assets statiques
├── .env.local.example                # Template des variables d'env
├── SUPABASE.md                       # Guide connexion Supabase en ligne
└── README.md                         # Ce fichier
```

---

## Déploiement

### Vercel (recommandé)

1. Pousse le code sur GitHub
2. Va sur [vercel.com](https://vercel.com) > **New Project** > importe le dépôt
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → ton URL Vercel (ex: `https://nekh-xel.vercel.app`)
4. Clique **Deploy**

Dans Supabase : **Authentication** > **URL Configuration** :
- **Site URL** → ton URL Vercel
- **Redirect URLs** → `https://nekh-xel.vercel.app/**`

### Autres hébergeurs

Toute plateforme supportant Node.js 18+ fonctionne : Railway, Render, Netlify.

---

## Contribuer

Les contributions sont les bienvenues ! Pour les questions pédagogiques du contexte sénégalais, chaque pull request est relu par un enseignant certifié.

1. Fork le projet
2. Crée une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit tes changements (`git commit -m 'Ajoute X'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvre une Pull Request

---

*NEKH XËL — « Le savoir est bon » — Plateforme éducative sénégalaise*
