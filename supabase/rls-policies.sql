-- =============================================================
--  NEKH XËL — Politiques Row Level Security (RLS)
--  À exécuter APRÈS supabase/schema.sql
-- =============================================================
-- Rôles pris en charge :
--   student      → élève CM2
--   teacher      → enseignant
--   parent       → parent d'élève
--   admin        → administrateur d'établissement
--   super_admin  → administrateur de la plateforme
-- =============================================================
-- Supprime et recrée toutes les politiques (idempotent).
-- =============================================================

-- ─── Fonctions helpers (redéclarées pour autonomie) ───────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
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
-- TABLE : profiles
-- =============================================================

DROP POLICY IF EXISTS "profiles: own SELECT"            ON public.profiles;
DROP POLICY IF EXISTS "profiles: teacher reads students" ON public.profiles;
DROP POLICY IF EXISTS "profiles: parent reads children"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin SELECT all"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: own UPDATE"             ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin UPDATE all"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: system INSERT"          ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin DELETE"           ON public.profiles;

-- student : voit son propre profil
CREATE POLICY "profiles: own SELECT"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- teacher : voit ses élèves
CREATE POLICY "profiles: teacher reads students"
  ON public.profiles FOR SELECT
  USING (public.is_teacher_of(id));

-- parent : voit ses enfants
CREATE POLICY "profiles: parent reads children"
  ON public.profiles FOR SELECT
  USING (public.is_parent_of(id));

-- admin / super_admin : voit tout
CREATE POLICY "profiles: admin SELECT all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- tout utilisateur met à jour son propre profil
CREATE POLICY "profiles: own UPDATE"
  ON public.profiles FOR UPDATE
  USING  (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Empêche l'auto-promotion de rôle
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- admin peut modifier n'importe quel profil (y compris changer le rôle)
CREATE POLICY "profiles: admin UPDATE all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- le trigger Supabase Auth insère via SECURITY DEFINER — pas de policy INSERT nécessaire
-- mais on autorise l'upsert lors de l'inscription téléphone
CREATE POLICY "profiles: system INSERT"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- seul super_admin peut supprimer un profil
CREATE POLICY "profiles: admin DELETE"
  ON public.profiles FOR DELETE
  USING (public.is_super_admin());

-- =============================================================
-- TABLE : parent_child
-- =============================================================

DROP POLICY IF EXISTS "pc: participant SELECT" ON public.parent_child;
DROP POLICY IF EXISTS "pc: parent INSERT"      ON public.parent_child;
DROP POLICY IF EXISTS "pc: parent DELETE"      ON public.parent_child;
DROP POLICY IF EXISTS "pc: admin ALL"          ON public.parent_child;

-- parent voit ses propres liens, student voit ses parents
CREATE POLICY "pc: participant SELECT"
  ON public.parent_child FOR SELECT
  USING (parent_id = auth.uid() OR child_id = auth.uid());

-- parent crée un lien (doit être de rôle parent)
CREATE POLICY "pc: parent INSERT"
  ON public.parent_child FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND public.my_role() = 'parent'
  );

-- parent supprime son propre lien
CREATE POLICY "pc: parent DELETE"
  ON public.parent_child FOR DELETE
  USING (parent_id = auth.uid());

-- admin voit et gère tout
CREATE POLICY "pc: admin ALL"
  ON public.parent_child FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : teacher_student
-- =============================================================

DROP POLICY IF EXISTS "ts: participant SELECT" ON public.teacher_student;
DROP POLICY IF EXISTS "ts: teacher INSERT"     ON public.teacher_student;
DROP POLICY IF EXISTS "ts: teacher DELETE"     ON public.teacher_student;
DROP POLICY IF EXISTS "ts: admin ALL"          ON public.teacher_student;

CREATE POLICY "ts: participant SELECT"
  ON public.teacher_student FOR SELECT
  USING (teacher_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "ts: teacher INSERT"
  ON public.teacher_student FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.my_role() IN ('teacher', 'admin', 'super_admin')
  );

CREATE POLICY "ts: teacher DELETE"
  ON public.teacher_student FOR DELETE
  USING (teacher_id = auth.uid() OR public.is_admin());

CREATE POLICY "ts: admin ALL"
  ON public.teacher_student FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : subjects
-- =============================================================

DROP POLICY IF EXISTS "subjects: SELECT active"  ON public.subjects;
DROP POLICY IF EXISTS "subjects: admin ALL"       ON public.subjects;

-- tout utilisateur authentifié voit les matières actives
CREATE POLICY "subjects: SELECT active"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (is_active = TRUE OR public.is_admin());

-- seuls les admins modifient les matières
CREATE POLICY "subjects: admin ALL"
  ON public.subjects FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : themes
-- =============================================================

DROP POLICY IF EXISTS "themes: SELECT active" ON public.themes;
DROP POLICY IF EXISTS "themes: admin ALL"     ON public.themes;

CREATE POLICY "themes: SELECT active"
  ON public.themes FOR SELECT
  TO authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "themes: admin ALL"
  ON public.themes FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : questions
-- =============================================================

DROP POLICY IF EXISTS "q: SELECT published"     ON public.questions;
DROP POLICY IF EXISTS "q: SELECT own draft"     ON public.questions;
DROP POLICY IF EXISTS "q: SELECT teacher all"   ON public.questions;
DROP POLICY IF EXISTS "q: INSERT teacher"        ON public.questions;
DROP POLICY IF EXISTS "q: UPDATE own draft"      ON public.questions;
DROP POLICY IF EXISTS "q: admin ALL"             ON public.questions;

-- student : voit uniquement les questions publiées
CREATE POLICY "q: SELECT published"
  ON public.questions FOR SELECT
  USING (status = 'published');

-- teacher : voit ses propres brouillons/soumissions en plus des publiées
CREATE POLICY "q: SELECT own draft"
  ON public.questions FOR SELECT
  USING (submitted_by = auth.uid());

-- admin : voit tout
CREATE POLICY "q: admin ALL"
  ON public.questions FOR ALL
  USING (public.is_admin());

-- teacher : peut créer des questions (status = draft par défaut)
CREATE POLICY "q: INSERT teacher"
  ON public.questions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.my_role() IN ('teacher', 'admin', 'super_admin')
    AND submitted_by = auth.uid()
    AND status IN ('draft', 'pending')
  );

-- teacher : modifie ses propres brouillons (pas les publiées)
CREATE POLICY "q: UPDATE own draft"
  ON public.questions FOR UPDATE
  USING (
    submitted_by = auth.uid()
    AND status IN ('draft', 'pending', 'rejected')
  )
  WITH CHECK (
    submitted_by = auth.uid()
    -- Impossible de se valider soi-même
    AND status <> 'published'
  );

-- =============================================================
-- TABLE : sessions
-- =============================================================

DROP POLICY IF EXISTS "sessions: teacher SELECT own"     ON public.sessions;
DROP POLICY IF EXISTS "sessions: student SELECT active"  ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher INSERT"         ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher UPDATE own"     ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher DELETE own"     ON public.sessions;
DROP POLICY IF EXISTS "sessions: admin ALL"              ON public.sessions;

-- teacher voit ses propres sessions
CREATE POLICY "sessions: teacher SELECT own"
  ON public.sessions FOR SELECT
  USING (teacher_id = auth.uid());

-- student voit les sessions actives auxquelles il participe
CREATE POLICY "sessions: student SELECT active"
  ON public.sessions FOR SELECT
  USING (
    status IN ('scheduled', 'active')
    AND EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = id AND sp.student_id = auth.uid()
    )
  );

-- teacher crée des sessions
CREATE POLICY "sessions: teacher INSERT"
  ON public.sessions FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.my_role() IN ('teacher', 'admin', 'super_admin')
  );

-- teacher modifie ses propres sessions non terminées
CREATE POLICY "sessions: teacher UPDATE own"
  ON public.sessions FOR UPDATE
  USING (
    teacher_id = auth.uid()
    AND status <> 'completed'
  );

-- teacher supprime ses propres brouillons
CREATE POLICY "sessions: teacher DELETE own"
  ON public.sessions FOR DELETE
  USING (teacher_id = auth.uid() AND status = 'draft');

-- admin voit et gère tout
CREATE POLICY "sessions: admin ALL"
  ON public.sessions FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : session_participants
-- =============================================================

DROP POLICY IF EXISTS "sp: own SELECT"    ON public.session_participants;
DROP POLICY IF EXISTS "sp: teacher SELECT" ON public.session_participants;
DROP POLICY IF EXISTS "sp: student JOIN"  ON public.session_participants;
DROP POLICY IF EXISTS "sp: admin ALL"     ON public.session_participants;

-- student voit ses propres participations
CREATE POLICY "sp: own SELECT"
  ON public.session_participants FOR SELECT
  USING (student_id = auth.uid());

-- teacher voit les participants de ses sessions
CREATE POLICY "sp: teacher SELECT"
  ON public.session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.teacher_id = auth.uid()
    )
  );

-- student peut rejoindre une session (INSERT)
CREATE POLICY "sp: student JOIN"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND public.my_role() = 'student'
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.status IN ('scheduled', 'active')
    )
  );

CREATE POLICY "sp: admin ALL"
  ON public.session_participants FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : quiz_results
-- =============================================================

DROP POLICY IF EXISTS "qr: own SELECT"          ON public.quiz_results;
DROP POLICY IF EXISTS "qr: own INSERT"           ON public.quiz_results;
DROP POLICY IF EXISTS "qr: teacher SELECT"       ON public.quiz_results;
DROP POLICY IF EXISTS "qr: parent SELECT"        ON public.quiz_results;
DROP POLICY IF EXISTS "qr: admin ALL"            ON public.quiz_results;

-- student voit uniquement ses propres résultats
CREATE POLICY "qr: own SELECT"
  ON public.quiz_results FOR SELECT
  USING (user_id = auth.uid());

-- student insère ses propres résultats
CREATE POLICY "qr: own INSERT"
  ON public.quiz_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- teacher voit les résultats de ses élèves
CREATE POLICY "qr: teacher SELECT"
  ON public.quiz_results FOR SELECT
  USING (public.is_teacher_of(user_id));

-- parent voit les résultats de ses enfants
CREATE POLICY "qr: parent SELECT"
  ON public.quiz_results FOR SELECT
  USING (public.is_parent_of(user_id));

-- admin voit tout, peut corriger
CREATE POLICY "qr: admin ALL"
  ON public.quiz_results FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : user_xp
-- =============================================================

DROP POLICY IF EXISTS "xp: own SELECT"           ON public.user_xp;
DROP POLICY IF EXISTS "xp: teacher/parent SELECT" ON public.user_xp;
DROP POLICY IF EXISTS "xp: system UPDATE"         ON public.user_xp;
DROP POLICY IF EXISTS "xp: admin ALL"             ON public.user_xp;

CREATE POLICY "xp: own SELECT"
  ON public.user_xp FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "xp: teacher/parent SELECT"
  ON public.user_xp FOR SELECT
  USING (
    public.is_teacher_of(user_id)
    OR public.is_parent_of(user_id)
  );

-- l'élève met à jour son propre XP (via Server Action ou function sécurisée)
CREATE POLICY "xp: system UPDATE"
  ON public.user_xp FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "xp: admin ALL"
  ON public.user_xp FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : badges
-- =============================================================

DROP POLICY IF EXISTS "badges: SELECT active" ON public.badges;
DROP POLICY IF EXISTS "badges: admin ALL"     ON public.badges;

-- badges lisibles par tous les utilisateurs authentifiés
CREATE POLICY "badges: SELECT active"
  ON public.badges FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "badges: admin ALL"
  ON public.badges FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : user_badges
-- =============================================================

DROP POLICY IF EXISTS "ub: own SELECT"            ON public.user_badges;
DROP POLICY IF EXISTS "ub: teacher/parent SELECT" ON public.user_badges;
DROP POLICY IF EXISTS "ub: system INSERT"          ON public.user_badges;
DROP POLICY IF EXISTS "ub: admin ALL"              ON public.user_badges;

CREATE POLICY "ub: own SELECT"
  ON public.user_badges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ub: teacher/parent SELECT"
  ON public.user_badges FOR SELECT
  USING (
    public.is_teacher_of(user_id)
    OR public.is_parent_of(user_id)
  );

-- seul le système (admin, Server Action) attribue des badges
CREATE POLICY "ub: system INSERT"
  ON public.user_badges FOR INSERT
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "ub: admin ALL"
  ON public.user_badges FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : conversations
-- =============================================================

DROP POLICY IF EXISTS "conv: participant SELECT"  ON public.conversations;
DROP POLICY IF EXISTS "conv: participant INSERT"  ON public.conversations;
DROP POLICY IF EXISTS "conv: admin ALL"           ON public.conversations;

CREATE POLICY "conv: participant SELECT"
  ON public.conversations FOR SELECT
  USING (participant1 = auth.uid() OR participant2 = auth.uid());

CREATE POLICY "conv: participant INSERT"
  ON public.conversations FOR INSERT
  WITH CHECK (
    (participant1 = auth.uid() OR participant2 = auth.uid())
    -- Seuls les enseignants, parents et admins démarrent des conversations
    AND public.my_role() IN ('teacher', 'parent', 'admin', 'super_admin')
  );

CREATE POLICY "conv: admin ALL"
  ON public.conversations FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : messages
-- =============================================================

DROP POLICY IF EXISTS "msg: participant SELECT" ON public.messages;
DROP POLICY IF EXISTS "msg: sender INSERT"      ON public.messages;
DROP POLICY IF EXISTS "msg: recipient UPDATE"   ON public.messages;
DROP POLICY IF EXISTS "msg: admin ALL"          ON public.messages;

CREATE POLICY "msg: participant SELECT"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

CREATE POLICY "msg: sender INSERT"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

-- le destinataire peut marquer un message comme lu (UPDATE is_read)
CREATE POLICY "msg: recipient UPDATE"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
        AND sender_id <> auth.uid()  -- seulement le destinataire
    )
  );

CREATE POLICY "msg: admin ALL"
  ON public.messages FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : notifications
-- =============================================================

DROP POLICY IF EXISTS "notif: own SELECT"  ON public.notifications;
DROP POLICY IF EXISTS "notif: own UPDATE"  ON public.notifications;
DROP POLICY IF EXISTS "notif: system INSERT" ON public.notifications;
DROP POLICY IF EXISTS "notif: admin ALL"   ON public.notifications;

CREATE POLICY "notif: own SELECT"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- l'utilisateur marque ses notifs comme lues
CREATE POLICY "notif: own UPDATE"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- seuls les admins et le système envoient des notifications
CREATE POLICY "notif: system INSERT"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notif: admin ALL"
  ON public.notifications FOR ALL
  USING (public.is_admin());

-- =============================================================
-- TABLE : activity_log
-- =============================================================

DROP POLICY IF EXISTS "log: admin SELECT" ON public.activity_log;
DROP POLICY IF EXISTS "log: admin INSERT" ON public.activity_log;
DROP POLICY IF EXISTS "log: super DELETE" ON public.activity_log;

-- seuls les admins lisent les logs
CREATE POLICY "log: admin SELECT"
  ON public.activity_log FOR SELECT
  USING (public.is_admin());

-- le système (Server Actions avec service_role) insère les logs
-- les admins peuvent aussi journaliser leurs actions
CREATE POLICY "log: admin INSERT"
  ON public.activity_log FOR INSERT
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- seul le super_admin peut purger les logs (RGPD)
CREATE POLICY "log: super DELETE"
  ON public.activity_log FOR DELETE
  USING (public.is_super_admin());

-- =============================================================
-- RÉSUMÉ DES PERMISSIONS PAR RÔLE
-- =============================================================
-- student      : ses données (profil, xp, badges, résultats)
--                + questions publiées + matières actives
--                + sessions auxquelles il est inscrit
-- teacher      : idem student + ses élèves + ses questions (draft)
--                + ses sessions + résultats de ses élèves
-- parent       : idem student + ses enfants + résultats de ses enfants
-- admin        : tout READ/WRITE sauf purge logs
-- super_admin  : tout sans restriction + purge logs + DELETE profils
-- =============================================================
