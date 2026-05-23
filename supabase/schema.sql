-- =============================================================
--  NEKH XËL — Schéma SQL complet
--  « Nekh Xël » = « Le savoir est bon » en wolof
--  Plateforme éducative Génie en Herbe — CM2 Sénégal
--  Base : PostgreSQL 15+ / Supabase
-- =============================================================
-- USAGE :
--   Exécuter ce fichier sur une base Supabase vierge.
--   Ensuite exécuter supabase/seed.sql pour les données de démo.
--   Les politiques RLS sont dans supabase/rls-policies.sql.
-- =============================================================

-- ─── Extensions ───────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- pour la recherche insensible aux accents

-- =============================================================
-- 0. TYPES ÉNUMÉRÉS
-- =============================================================

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'student',      -- élève
    'teacher',      -- enseignant
    'parent',       -- parent d'élève
    'admin',        -- administrateur de l'établissement
    'super_admin'   -- administrateur de la plateforme (Nekh Xël team)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.question_type AS ENUM (
    'qcm',            -- QCM 4 choix
    'vrai_faux',      -- Vrai ou Faux
    'association',    -- Association de colonnes
    'identification'  -- Identification avec indices progressifs
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.difficulty_level AS ENUM ('facile', 'moyen', 'difficile');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.question_status AS ENUM (
    'draft',      -- brouillon de l'enseignant
    'pending',    -- soumis pour validation
    'published',  -- validé et visible par les élèves
    'rejected',   -- refusé par l'admin
    'archived'    -- désactivé
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.session_type AS ENUM (
    'entrainement',   -- session libre, pas de classement
    'evaluation',     -- évaluation notée
    'competition'     -- format Génie en Herbe
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.session_status AS ENUM (
    'draft',      -- brouillon
    'scheduled',  -- programmée
    'active',     -- en cours
    'completed',  -- terminée
    'cancelled'   -- annulée
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.badge_trigger AS ENUM (
    'first_quiz',      -- premier quiz joué
    'first_perfect',   -- 100% à un quiz
    'streak_3',        -- 3 jours consécutifs
    'streak_7',        -- 7 jours consécutifs
    'streak_30',       -- 30 jours consécutifs
    'quizzes_10',      -- 10 quiz joués
    'quizzes_50',      -- 50 quiz joués
    'score_avg_80',    -- moyenne ≥ 80%
    'score_avg_90',    -- moyenne ≥ 90%
    'xp_500',          -- 500 XP accumulés
    'xp_2000',         -- 2 000 XP accumulés
    'all_subjects'     -- quiz dans les 11 matières
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notif_type AS ENUM (
    'badge',      -- badge gagné
    'result',     -- résultat de session
    'message',    -- nouveau message
    'reminder',   -- rappel d'activité
    'system'      -- annonce plateforme
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- 1. FONCTIONS UTILITAIRES
--    Définies en premier car utilisées par les triggers.
-- =============================================================

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Helpers RLS (redéfinis ici, utilisés aussi dans rls-policies.sql)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS public.user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of(p_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_student
    WHERE teacher_id = auth.uid() AND student_id = p_student_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of(p_child_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_child
    WHERE parent_id = auth.uid() AND child_id = p_child_id
  );
$$;

-- =============================================================
-- 2. PROFILES
--    Étend auth.users — créé automatiquement à l'inscription.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         public.user_role NOT NULL DEFAULT 'student',
  first_name   TEXT         NOT NULL DEFAULT '',
  last_name    TEXT         NOT NULL DEFAULT '',
  display_name TEXT         GENERATED ALWAYS AS (
                 TRIM(first_name || ' ' || last_name)
               ) STORED,
  username     TEXT         UNIQUE,
  phone        TEXT         UNIQUE,
  email        TEXT         UNIQUE,
  avatar_url   TEXT,
  school       TEXT,                              -- établissement
  school_level TEXT         DEFAULT 'CM2',        -- niveau scolaire
  region       TEXT,                              -- région du Sénégal
  bio          TEXT,
  locale       TEXT         NOT NULL DEFAULT 'fr',
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_role_valid CHECK (role IN ('student','teacher','parent','admin','super_admin'))
);

COMMENT ON TABLE public.profiles IS 'Profil utilisateur étendu — lié à auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'student | teacher | parent | admin | super_admin';

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Création automatique du profil à chaque inscription Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'student'
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  ''),
    NEW.phone,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- 3. RELATIONS PARENT ↔ ENFANT
-- =============================================================

CREATE TABLE IF NOT EXISTS public.parent_child (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_parent_child   UNIQUE (parent_id, child_id),
  CONSTRAINT chk_pc_not_self   CHECK  (parent_id <> child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child  ON public.parent_child(child_id);

-- =============================================================
-- 4. RELATIONS ENSEIGNANT ↔ ÉLÈVE
-- =============================================================

CREATE TABLE IF NOT EXISTS public.teacher_student (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name TEXT,                               -- ex : "CM2 A", "CM2 B"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teacher_student  UNIQUE (teacher_id, student_id),
  CONSTRAINT chk_ts_not_self     CHECK  (teacher_id <> student_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_student_teacher ON public.teacher_student(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON public.teacher_student(student_id);

-- =============================================================
-- 5. MATIÈRES
--    Les 11 matières du programme CM2 sénégalais.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id          UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT     NOT NULL UNIQUE,
  name        TEXT     NOT NULL,
  description TEXT,
  icon        TEXT,                              -- emoji
  color_from  TEXT,                              -- classe Tailwind gradient from
  color_to    TEXT,                              -- classe Tailwind gradient to
  hex_color   TEXT,                              -- couleur hexadécimale
  position    SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN  NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subjects (slug, name, description, icon, color_from, color_to, hex_color, position) VALUES
  ('maths',       'Mathématiques',      'Nombres, calcul, géométrie et mesures',               '🔢', 'from-blue-500',   'to-blue-700',    '#3b82f6', 1),
  ('francais',    'Français',           'Lecture, vocabulaire et expression écrite',            '📖', 'from-violet-500', 'to-purple-700',  '#8b5cf6', 2),
  ('histoire',    'Histoire',           'Empires africains, colonisation, indépendance',        '🏛️', 'from-amber-500',  'to-orange-600',  '#f59e0b', 3),
  ('geo',         'Géographie',         'Sénégal, Afrique et le monde',                        '🌍', 'from-emerald-500','to-green-700',   '#10b981', 4),
  ('sciences',    'Sciences',           'Le vivant, la matière et l''énergie',                 '🔬', 'from-red-500',    'to-rose-700',    '#ef4444', 5),
  ('civique',     'Instruction civique','Droits, devoirs et institutions',                     '⚖️', 'from-cyan-500',   'to-teal-700',    '#06b6d4', 6),
  ('ortho',       'Orthographe',        'Règles d''écriture, accords et homophones',           '✏️', 'from-pink-500',   'to-fuchsia-600', '#ec4899', 7),
  ('conjugaison', 'Conjugaison',        'Temps et modes des verbes français',                  '🔤', 'from-indigo-500', 'to-indigo-700',  '#6366f1', 8),
  ('grammaire',   'Grammaire',          'Noms, verbes, adjectifs et structure des phrases',    '📝', 'from-teal-500',   'to-cyan-700',    '#14b8a6', 9),
  ('calcul',      'Calcul mental',      'Rapidité et précision en calcul arithmétique',        '🧮', 'from-orange-500', 'to-amber-600',   '#f97316',10),
  ('culture',     'Culture générale',   'Connaissances variées sur le Sénégal et le monde',   '🌟', 'from-rose-500',   'to-pink-700',    '#f43f5e',11)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 6. THÈMES
--    Sous-catégories d'une matière.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.themes (
  id         UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID     NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name       TEXT     NOT NULL,
  position   SMALLINT NOT NULL DEFAULT 0,
  is_active  BOOLEAN  NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_theme_subject_name UNIQUE (subject_id, name)
);

CREATE INDEX IF NOT EXISTS idx_themes_subject ON public.themes(subject_id);

-- Thèmes de chaque matière
DO $$
DECLARE
  v_subject_id UUID;
BEGIN
  -- Maths
  SELECT id INTO v_subject_id FROM public.subjects WHERE slug = 'maths';
  INSERT INTO public.themes (subject_id, name, position) VALUES
    (v_subject_id, 'Nombres et opérations', 1),
    (v_subject_id, 'Géométrie', 2),
    (v_subject_id, 'Mesures', 3),
    (v_subject_id, 'Problèmes', 4),
    (v_subject_id, 'Fractions', 5)
  ON CONFLICT DO NOTHING;

  -- Français
  SELECT id INTO v_subject_id FROM public.subjects WHERE slug = 'francais';
  INSERT INTO public.themes (subject_id, name, position) VALUES
    (v_subject_id, 'Lecture et compréhension', 1),
    (v_subject_id, 'Vocabulaire', 2),
    (v_subject_id, 'Expression écrite', 3)
  ON CONFLICT DO NOTHING;

  -- Histoire
  SELECT id INTO v_subject_id FROM public.subjects WHERE slug = 'histoire';
  INSERT INTO public.themes (subject_id, name, position) VALUES
    (v_subject_id, 'Empires africains médiévaux', 1),
    (v_subject_id, 'Traite négrière et colonisation', 2),
    (v_subject_id, 'Indépendances africaines', 3),
    (v_subject_id, 'Histoire du Sénégal', 4)
  ON CONFLICT DO NOTHING;

  -- Géographie
  SELECT id INTO v_subject_id FROM public.subjects WHERE slug = 'geo';
  INSERT INTO public.themes (subject_id, name, position) VALUES
    (v_subject_id, 'Le Sénégal', 1),
    (v_subject_id, 'L''Afrique de l''Ouest', 2),
    (v_subject_id, 'Le monde', 3)
  ON CONFLICT DO NOTHING;

  -- Sciences
  SELECT id INTO v_subject_id FROM public.subjects WHERE slug = 'sciences';
  INSERT INTO public.themes (subject_id, name, position) VALUES
    (v_subject_id, 'Le monde du vivant', 1),
    (v_subject_id, 'La matière', 2),
    (v_subject_id, 'Corps humain', 3),
    (v_subject_id, 'L''énergie', 4)
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================================
-- 7. QUESTIONS
--    Banque de questions Génie en Herbe.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.questions (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id   UUID         REFERENCES public.subjects(id) ON DELETE SET NULL,
  theme_id     UUID         REFERENCES public.themes(id)   ON DELETE SET NULL,
  -- Champs dupliqués (slug/nom) pour accès rapide sans jointure
  subject      TEXT         NOT NULL,
  theme        TEXT         NOT NULL DEFAULT '',
  type         public.question_type    NOT NULL DEFAULT 'qcm',
  difficulty   public.difficulty_level NOT NULL DEFAULT 'moyen',
  enonce       TEXT         NOT NULL,

  -- QCM
  choices      JSONB,         -- ["choix A","choix B","choix C","choix D"]
  answer_index SMALLINT       CHECK (answer_index BETWEEN 0 AND 3),

  -- Vrai/Faux
  answer_bool  BOOLEAN,

  -- Association de colonnes
  pairs        JSONB,         -- [["gauche","droite"],...]

  -- Identification avec indices
  hints        JSONB,         -- ["indice 1","indice 2","indice 3"]
  answer_text  TEXT,

  -- Pédagogie
  explanation  TEXT           NOT NULL DEFAULT '',
  xp           SMALLINT       NOT NULL DEFAULT 10,
  source       TEXT,          -- référence pédagogique / programme officiel

  -- Workflow de publication
  status       public.question_status NOT NULL DEFAULT 'draft',
  submitted_by UUID           REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID           REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_reason TEXT,

  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_q_qcm         CHECK (type <> 'qcm'         OR (choices IS NOT NULL AND answer_index IS NOT NULL)),
  CONSTRAINT chk_q_vrai_faux    CHECK (type <> 'vrai_faux'   OR answer_bool IS NOT NULL),
  CONSTRAINT chk_q_association  CHECK (type <> 'association' OR pairs IS NOT NULL),
  CONSTRAINT chk_q_identification CHECK (type <> 'identification' OR (hints IS NOT NULL AND answer_text IS NOT NULL))
);

COMMENT ON TABLE public.questions IS 'Banque de questions Génie en Herbe — 4 types supportés.';

CREATE INDEX IF NOT EXISTS idx_q_subject          ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_q_difficulty       ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_q_status           ON public.questions (status);
CREATE INDEX IF NOT EXISTS idx_q_subject_diff_st  ON public.questions (subject, difficulty, status);
CREATE INDEX IF NOT EXISTS idx_q_submitted_by     ON public.questions (submitted_by);

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- 8. SESSIONS DE QUIZ
--    Sessions créées par les enseignants.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sessions (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id     UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT         NOT NULL,
  description    TEXT,
  type           public.session_type   NOT NULL DEFAULT 'entrainement',
  status         public.session_status NOT NULL DEFAULT 'draft',
  subject        TEXT,                          -- NULL = multi-matières
  difficulty     public.difficulty_level,       -- NULL = mixte
  question_count SMALLINT     NOT NULL DEFAULT 10,
  duration_min   SMALLINT     NOT NULL DEFAULT 20,
  -- Questions sélectionnées manuellement (NULL = sélection auto)
  question_ids   UUID[],
  -- Scores
  max_score      SMALLINT,
  passing_score  SMALLINT     DEFAULT 60,
  -- Accès
  access_code    TEXT         UNIQUE,            -- code 6 chiffres pour rejoindre
  scheduled_at   TIMESTAMPTZ,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status  ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_code    ON public.sessions(access_code) WHERE access_code IS NOT NULL;

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- 9. PARTICIPANTS À UNE SESSION
-- =============================================================

CREATE TABLE IF NOT EXISTS public.session_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_session_participant UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_sp_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_sp_student ON public.session_participants(student_id);

-- =============================================================
-- 10. RÉSULTATS DE QUIZ
--     Historique de chaque quiz joué (hors session ou dans session).
-- =============================================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id          UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID     REFERENCES public.sessions(id) ON DELETE SET NULL,
  subject     TEXT     NOT NULL,
  difficulty  public.difficulty_level NOT NULL,
  score_pct   SMALLINT NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
  correct     SMALLINT NOT NULL,
  total       SMALLINT NOT NULL,
  xp_earned   SMALLINT NOT NULL DEFAULT 0,
  duration_s  INTEGER  NOT NULL DEFAULT 0,         -- durée totale du quiz en secondes
  -- Détail par question : [{question_id, correct, time_left, answer}]
  detail      JSONB,
  played_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_user        ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_subject     ON public.quiz_results(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_qr_session     ON public.quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_qr_played      ON public.quiz_results(user_id, played_at DESC);

-- =============================================================
-- 11. XP ET NIVEAU UTILISATEUR
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_xp (
  id               UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp         INTEGER  NOT NULL DEFAULT 0,
  level            SMALLINT NOT NULL DEFAULT 1,
  streak           SMALLINT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_xp_updated_at
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Initialise user_xp dès la création du profil
CREATE OR REPLACE FUNCTION public.init_user_xp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.user_xp (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_user_xp ON public.profiles;
CREATE TRIGGER trg_init_user_xp
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_user_xp();

-- =============================================================
-- 12. BADGES
-- =============================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id          UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT     NOT NULL UNIQUE,
  name        TEXT     NOT NULL,
  description TEXT,
  icon        TEXT,
  trigger     public.badge_trigger NOT NULL,
  xp_bonus    SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN  NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.badges (slug, name, description, icon, trigger, xp_bonus) VALUES
  ('first-quiz',    'Premier quiz !',     'Tu as joué ton premier quiz',           '🚀', 'first_quiz',    20),
  ('first-perfect', 'Score parfait',      '100% à un quiz — impressionnant !',     '🎯', 'first_perfect', 50),
  ('streak-3',      'Série de 3 jours',   '3 jours d''affilée, continue !',        '🔥', 'streak_3',      30),
  ('streak-7',      'Série de 7 jours',   '7 jours consécutifs d''activité',       '💪', 'streak_7',      100),
  ('streak-30',     'Série de 30 jours',  '30 jours — tu es un champion !',        '💎', 'streak_30',     500),
  ('quizzes-10',    'Quiz explorateur',   '10 quiz joués',                         '📚', 'quizzes_10',    80),
  ('quizzes-50',    'Quiz champion',      '50 quiz joués — tu es au sommet !',     '🏆', 'quizzes_50',    300),
  ('score-avg-80',  'Élève sérieux',      'Moyenne générale ≥ 80%',               '⭐', 'score_avg_80',  100),
  ('score-avg-90',  'Excellence',         'Moyenne générale ≥ 90% — felicitations','🌟', 'score_avg_90',  200),
  ('xp-500',        'Accumulateur',       '500 XP gagnés',                         '⚡', 'xp_500',        50),
  ('xp-2000',       'Maître des savoirs', '2 000 XP — niveau expert atteint',      '👑', 'xp_2000',       200),
  ('all-subjects',  'Touche-à-tout',      'Au moins 1 quiz dans chaque matière',   '🌈', 'all_subjects',  150)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- 13. BADGES UTILISATEUR
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES public.badges(id)   ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user  ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);

-- =============================================================
-- 14. MESSAGERIE
-- =============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_msg_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_conversation UNIQUE (
    LEAST(participant1::TEXT, participant2::TEXT),
    GREATEST(participant1::TEXT, participant2::TEXT)
  ),
  CONSTRAINT chk_conv_not_self CHECK (participant1 <> participant2)
);

CREATE INDEX IF NOT EXISTS idx_conv_p1 ON public.conversations(participant1);
CREATE INDEX IF NOT EXISTS idx_conv_p2 ON public.conversations(participant2);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body            TEXT        NOT NULL,
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv    ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender  ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Mise à jour last_message dans conversations
CREATE OR REPLACE FUNCTION public.update_conversation_last_msg()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversations
  SET last_message = NEW.body, last_msg_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_update_conv
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_msg();

-- =============================================================
-- 15. NOTIFICATIONS
-- =============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       public.notif_type NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT,
  link       TEXT,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread  ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.notifications(created_at DESC);

-- =============================================================
-- 16. JOURNAL D'ACTIVITÉ (audit log)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.activity_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,                      -- ex: 'question.published', 'user.suspended'
  entity     TEXT,                               -- table concernée
  entity_id  UUID,                               -- id de l'entité concernée
  detail     JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_user    ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_log_action  ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_log_entity  ON public.activity_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_log_created ON public.activity_log(created_at DESC);

-- =============================================================
-- 17. VUES UTILITAIRES
-- =============================================================

-- Vue : statistiques par matière pour un utilisateur
CREATE OR REPLACE VIEW public.v_user_subject_stats AS
SELECT
  user_id,
  subject,
  COUNT(*)                                          AS quizzes_played,
  ROUND(AVG(score_pct))::SMALLINT                   AS avg_score,
  MAX(score_pct)                                    AS best_score,
  SUM(xp_earned)                                    AS total_xp,
  SUM(correct)                                      AS total_correct,
  SUM(total)                                        AS total_questions,
  MAX(played_at)                                    AS last_played
FROM public.quiz_results
GROUP BY user_id, subject;

-- Vue : classement global des élèves
CREATE OR REPLACE VIEW public.v_leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.school,
  p.avatar_url,
  x.total_xp,
  x.level,
  x.streak,
  RANK() OVER (ORDER BY x.total_xp DESC) AS rank
FROM public.profiles p
JOIN public.user_xp x ON x.user_id = p.id
WHERE p.role = 'student' AND p.is_active = TRUE;

-- Vue : questions publiées avec info matière
CREATE OR REPLACE VIEW public.v_published_questions AS
SELECT
  q.id,
  q.subject,
  q.theme,
  q.type,
  q.difficulty,
  q.enonce,
  q.choices,
  q.answer_index,
  q.answer_bool,
  q.pairs,
  q.hints,
  q.answer_text,
  q.explanation,
  q.xp,
  s.icon       AS subject_icon,
  s.color_from AS subject_color_from,
  s.color_to   AS subject_color_to
FROM public.questions q
LEFT JOIN public.subjects s ON s.slug = q.subject
WHERE q.status = 'published';

-- =============================================================
-- 18. ACTIVATION ROW LEVEL SECURITY
--     (Politiques dans supabase/rls-policies.sql)
-- =============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log          ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- FIN DU SCHÉMA — NEKH XËL v1.0
-- =============================================================
