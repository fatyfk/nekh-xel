-- ============================================================
-- Table : questions
-- Banque de questions pour les quiz NEKH XËL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT NOT NULL,
  theme        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('qcm', 'vrai_faux', 'association', 'identification')),
  difficulty   TEXT NOT NULL CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  enonce       TEXT NOT NULL,

  -- QCM : tableau JSON de 4 choix
  choices      JSONB,
  -- QCM : index de la bonne réponse (0-3)
  answer_index SMALLINT CHECK (answer_index BETWEEN 0 AND 3),

  -- Vrai/Faux
  answer_bool  BOOLEAN,

  -- Association : tableau JSON de paires [[gauche, droite], ...]
  pairs        JSONB,

  -- Identification : tableau JSON d'indices + réponse texte
  hints        JSONB,
  answer_text  TEXT,

  -- Pédagogie
  explanation  TEXT NOT NULL,
  xp           SMALLINT NOT NULL DEFAULT 10,

  -- Statut de publication (validé par un admin avant publication)
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_questions_subject     ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty  ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_status      ON public.questions (status);
CREATE INDEX IF NOT EXISTS idx_questions_subject_diff ON public.questions (subject, difficulty, status);

-- Trigger updated_at (réutilise la fonction créée dans 001_profiles.sql)
DROP TRIGGER IF EXISTS on_questions_updated ON public.questions;
CREATE TRIGGER on_questions_updated
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les questions publiées
CREATE POLICY "questions_select_published"
  ON public.questions FOR SELECT
  USING (status = 'published');

-- Les enseignants voient leurs propres brouillons
CREATE POLICY "questions_select_own_draft"
  ON public.questions FOR SELECT
  USING (auth.uid() = submitted_by);

-- Les enseignants créent des questions (en draft)
CREATE POLICY "questions_insert_teacher"
  ON public.questions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin')
    )
  );

-- Les enseignants modifient leurs propres brouillons
CREATE POLICY "questions_update_own"
  ON public.questions FOR UPDATE
  USING (
    auth.uid() = submitted_by AND status = 'draft'
  );

-- Les admins voient et modifient tout
CREATE POLICY "questions_admin_all"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- Table : quiz_results
-- Historique des quiz joués par les élèves
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  difficulty   TEXT NOT NULL CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  score_pct    SMALLINT NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
  correct      SMALLINT NOT NULL,
  total        SMALLINT NOT NULL,
  xp_earned    SMALLINT NOT NULL DEFAULT 0,
  -- Détail question par question (JSON)
  detail       JSONB,
  played_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user     ON public.quiz_results (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject  ON public.quiz_results (user_id, subject);

-- RLS : chaque utilisateur voit uniquement ses propres résultats
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_results_select_own"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_results_insert_own"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins et enseignants voient tous les résultats
CREATE POLICY "quiz_results_select_staff"
  ON public.quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher')
    )
  );

-- ============================================================
-- Données de démonstration (10 questions publiées)
-- ============================================================

INSERT INTO public.questions
  (subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Mathématiques
  ('maths', 'Nombres', 'qcm', 'facile',
   'Quel est le résultat de 9 × 7 ?',
   '["54", "63", "56", "72"]', 1,
   '9 × 7 = 63. Astuce : 9 × 7 = 10 × 7 − 7 = 70 − 7 = 63.',
   10, 'published'),

  ('maths', 'Géométrie', 'qcm', 'moyen',
   'Quelle est l''aire d''un rectangle de 6 cm de long et 4 cm de large ?',
   '["10 cm²", "20 cm²", "24 cm²", "48 cm²"]', 2,
   'Aire d''un rectangle = longueur × largeur = 6 × 4 = 24 cm².',
   15, 'published'),

  -- Français
  ('francais', 'Grammaire', 'qcm', 'facile',
   'Quel est le verbe de la phrase : "Les enfants jouent au football." ?',
   '["enfants", "jouent", "football", "Les"]', 1,
   '"Jouent" est le verbe : il exprime l''action réalisée par les enfants.',
   10, 'published'),

  ('francais', 'Orthographe', 'qcm', 'moyen',
   'Choisissez l''orthographe correcte du pluriel de "bal" :',
   '["bales", "baux", "bals", "bal"]', 2,
   '"Bal" fait "bals" au pluriel. Exception : les mots en -al ne font pas tous -aux.',
   15, 'published'),

  -- Histoire
  ('histoire', 'Sénégal', 'qcm', 'facile',
   'En quelle année le Sénégal a-t-il obtenu son indépendance ?',
   '["1958", "1960", "1962", "1965"]', 1,
   'Le Sénégal a proclamé son indépendance le 4 avril 1960, qui est désormais la fête nationale.',
   10, 'published'),

  ('histoire', 'Empires africains', 'qcm', 'moyen',
   'Quel empire africain avait Tombouctou comme grand centre de savoir ?',
   '["Empire du Ghana", "Empire du Mali", "Empire Songhaï", "Royaume du Congo"]', 2,
   'L''Empire Songhaï avait Tombouctou comme grand centre intellectuel et commercial. La ville abritait la célèbre université de Sankoré.',
   15, 'published'),

  -- Géographie
  ('geo', 'Sénégal', 'qcm', 'facile',
   'Le Sénégal se trouve sur quel continent ?',
   '["Amérique", "Asie", "Europe", "Afrique"]', 3,
   'Le Sénégal est un pays d''Afrique de l''Ouest, situé à l''extrême ouest du continent africain.',
   8, 'published'),

  ('geo', 'Sénégal', 'qcm', 'moyen',
   'Quel océan borde la côte ouest du Sénégal ?',
   '["Océan Indien", "Océan Arctique", "Océan Atlantique", "Mer Méditerranée"]', 2,
   'La côte sénégalaise donne sur l''Océan Atlantique. Dakar est sur la presqu''île du Cap-Vert, le point le plus à l''ouest de l''Afrique.',
   12, 'published'),

  -- Sciences
  ('sciences', 'Le vivant', 'qcm', 'facile',
   'Quel gaz les plantes absorbent-elles pour faire la photosynthèse ?',
   '["Oxygène (O₂)", "Azote (N₂)", "Dioxyde de carbone (CO₂)", "Hydrogène (H₂)"]', 2,
   'Les plantes absorbent le CO₂ et l''eau, et grâce à la lumière, produisent du sucre et rejettent de l''oxygène.',
   10, 'published'),

  ('sciences', 'Corps humain', 'qcm', 'moyen',
   'Quel organe du corps humain filtre le sang et produit l''urine ?',
   '["Le foie", "Le cœur", "Les poumons", "Les reins"]', 3,
   'Les reins filtrent environ 180 litres de sang par jour et produisent 1 à 2 litres d''urine.',
   15, 'published')
ON CONFLICT DO NOTHING;
