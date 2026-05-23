-- =============================================================
--  NEKH XËL — Politiques Row Level Security (RLS)
--  À exécuter APRÈS supabase/schema.sql
-- =============================================================
-- Rôles : student | teacher | parent | admin | super_admin
-- Toutes les politiques sont PERMISSIVE (comportement PostgreSQL
-- par défaut) : plusieurs politiques sur la même opération sont
-- combinées avec OR.
-- Idempotent : DROP POLICY IF EXISTS avant chaque CREATE POLICY.
-- =============================================================

-- =============================================================
-- TABLE : profiles
-- =============================================================

DROP POLICY IF EXISTS "profiles: own SELECT"             ON public.profiles;
DROP POLICY IF EXISTS "profiles: teacher reads students" ON public.profiles;
DROP POLICY IF EXISTS "profiles: parent reads children"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin SELECT all"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: own UPDATE"             ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin UPDATE all"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: system INSERT"          ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin DELETE"           ON public.profiles;

-- Chaque utilisateur voit son propre profil
CREATE POLICY "profiles: own SELECT"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Un enseignant voit les profils de ses élèves
CREATE POLICY "profiles: teacher reads students"
  ON public.profiles FOR SELECT
  USING (public.is_teacher_of(id));

-- Un parent voit les profils de ses enfants
CREATE POLICY "profiles: parent reads children"
  ON public.profiles FOR SELECT
  USING (public.is_parent_of(id));

-- Admin / super_admin voit tous les profils
CREATE POLICY "profiles: admin SELECT all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Chaque utilisateur peut modifier son propre profil
-- (le changement de rôle est bloqué côté application)
CREATE POLICY "profiles: own UPDATE"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin peut modifier n'importe quel profil (y compris le rôle)
CREATE POLICY "profiles: admin UPDATE all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Le trigger handle_new_user() est SECURITY DEFINER et bypasse RLS.
-- Cette policy autorise aussi un upsert direct si l'id correspond.
CREATE POLICY "profiles: system INSERT"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Seul super_admin peut supprimer un profil
CREATE POLICY "profiles: admin DELETE"
  ON public.profiles FOR DELETE
  USING (public.is_super_admin());

-- =============================================================
-- TABLE : parent_child
-- =============================================================

DROP POLICY IF EXISTS "pc: participant SELECT" ON public.parent_child;
DROP POLICY IF EXISTS "pc: parent INSERT"      ON public.parent_child;
DROP POLICY IF EXISTS "pc: parent DELETE"      ON public.parent_child;
DROP POLICY IF EXISTS "pc: admin SELECT"       ON public.parent_child;
DROP POLICY IF EXISTS "pc: admin INSERT"       ON public.parent_child;
DROP POLICY IF EXISTS "pc: admin DELETE"       ON public.parent_child;

CREATE POLICY "pc: participant SELECT"
  ON public.parent_child FOR SELECT
  USING (parent_id = auth.uid() OR child_id = auth.uid());

CREATE POLICY "pc: parent INSERT"
  ON public.parent_child FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND public.my_role() = 'parent'
  );

CREATE POLICY "pc: parent DELETE"
  ON public.parent_child FOR DELETE
  USING (parent_id = auth.uid());

CREATE POLICY "pc: admin SELECT"
  ON public.parent_child FOR SELECT
  USING (public.is_admin());

CREATE POLICY "pc: admin INSERT"
  ON public.parent_child FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "pc: admin DELETE"
  ON public.parent_child FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : teacher_student
-- =============================================================

DROP POLICY IF EXISTS "ts: participant SELECT" ON public.teacher_student;
DROP POLICY IF EXISTS "ts: teacher INSERT"     ON public.teacher_student;
DROP POLICY IF EXISTS "ts: teacher DELETE"     ON public.teacher_student;
DROP POLICY IF EXISTS "ts: admin SELECT"       ON public.teacher_student;
DROP POLICY IF EXISTS "ts: admin INSERT"       ON public.teacher_student;
DROP POLICY IF EXISTS "ts: admin DELETE"       ON public.teacher_student;

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
  USING (teacher_id = auth.uid());

CREATE POLICY "ts: admin SELECT"
  ON public.teacher_student FOR SELECT
  USING (public.is_admin());

CREATE POLICY "ts: admin INSERT"
  ON public.teacher_student FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "ts: admin DELETE"
  ON public.teacher_student FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : subjects
-- =============================================================

DROP POLICY IF EXISTS "subjects: SELECT active" ON public.subjects;
DROP POLICY IF EXISTS "subjects: admin SELECT"  ON public.subjects;
DROP POLICY IF EXISTS "subjects: admin INSERT"  ON public.subjects;
DROP POLICY IF EXISTS "subjects: admin UPDATE"  ON public.subjects;
DROP POLICY IF EXISTS "subjects: admin DELETE"  ON public.subjects;

-- Tout utilisateur authentifié voit les matières actives
CREATE POLICY "subjects: SELECT active"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "subjects: admin SELECT"
  ON public.subjects FOR SELECT
  USING (public.is_admin());

CREATE POLICY "subjects: admin INSERT"
  ON public.subjects FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "subjects: admin UPDATE"
  ON public.subjects FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "subjects: admin DELETE"
  ON public.subjects FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : themes
-- =============================================================

DROP POLICY IF EXISTS "themes: SELECT active" ON public.themes;
DROP POLICY IF EXISTS "themes: admin SELECT"  ON public.themes;
DROP POLICY IF EXISTS "themes: admin INSERT"  ON public.themes;
DROP POLICY IF EXISTS "themes: admin UPDATE"  ON public.themes;
DROP POLICY IF EXISTS "themes: admin DELETE"  ON public.themes;

CREATE POLICY "themes: SELECT active"
  ON public.themes FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "themes: admin SELECT"
  ON public.themes FOR SELECT
  USING (public.is_admin());

CREATE POLICY "themes: admin INSERT"
  ON public.themes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "themes: admin UPDATE"
  ON public.themes FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "themes: admin DELETE"
  ON public.themes FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : questions
-- =============================================================

DROP POLICY IF EXISTS "q: SELECT published"   ON public.questions;
DROP POLICY IF EXISTS "q: SELECT own draft"   ON public.questions;
DROP POLICY IF EXISTS "q: admin SELECT"       ON public.questions;
DROP POLICY IF EXISTS "q: INSERT teacher"     ON public.questions;
DROP POLICY IF EXISTS "q: UPDATE own draft"   ON public.questions;
DROP POLICY IF EXISTS "q: admin INSERT"       ON public.questions;
DROP POLICY IF EXISTS "q: admin UPDATE"       ON public.questions;
DROP POLICY IF EXISTS "q: admin DELETE"       ON public.questions;

-- Tout le monde voit les questions publiées
CREATE POLICY "q: SELECT published"
  ON public.questions FOR SELECT
  USING (status = 'published');

-- Un enseignant voit ses propres brouillons et soumissions
CREATE POLICY "q: SELECT own draft"
  ON public.questions FOR SELECT
  USING (submitted_by = auth.uid());

-- Admin voit tout
CREATE POLICY "q: admin SELECT"
  ON public.questions FOR SELECT
  USING (public.is_admin());

-- Enseignant crée des questions (status = draft ou pending)
CREATE POLICY "q: INSERT teacher"
  ON public.questions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.my_role() IN ('teacher', 'admin', 'super_admin')
    AND submitted_by = auth.uid()
    AND status IN ('draft', 'pending')
  );

-- Enseignant modifie ses propres brouillons non publiés
CREATE POLICY "q: UPDATE own draft"
  ON public.questions FOR UPDATE
  USING (
    submitted_by = auth.uid()
    AND status IN ('draft', 'pending', 'rejected')
  )
  WITH CHECK (
    submitted_by = auth.uid()
    AND status <> 'published'
  );

CREATE POLICY "q: admin INSERT"
  ON public.questions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "q: admin UPDATE"
  ON public.questions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "q: admin DELETE"
  ON public.questions FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : sessions
-- =============================================================

DROP POLICY IF EXISTS "sessions: teacher SELECT own"    ON public.sessions;
DROP POLICY IF EXISTS "sessions: student SELECT active" ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher INSERT"        ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher UPDATE own"    ON public.sessions;
DROP POLICY IF EXISTS "sessions: teacher DELETE own"    ON public.sessions;
DROP POLICY IF EXISTS "sessions: admin SELECT"          ON public.sessions;
DROP POLICY IF EXISTS "sessions: admin INSERT"          ON public.sessions;
DROP POLICY IF EXISTS "sessions: admin UPDATE"          ON public.sessions;
DROP POLICY IF EXISTS "sessions: admin DELETE"          ON public.sessions;

-- Enseignant voit ses propres sessions
CREATE POLICY "sessions: teacher SELECT own"
  ON public.sessions FOR SELECT
  USING (teacher_id = auth.uid());

-- Élève voit les sessions actives auxquelles il participe
CREATE POLICY "sessions: student SELECT active"
  ON public.sessions FOR SELECT
  USING (
    status IN ('scheduled', 'active')
    AND EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = id AND sp.student_id = auth.uid()
    )
  );

-- Enseignant crée des sessions
CREATE POLICY "sessions: teacher INSERT"
  ON public.sessions FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.my_role() IN ('teacher', 'admin', 'super_admin')
  );

-- Enseignant modifie ses propres sessions non terminées
CREATE POLICY "sessions: teacher UPDATE own"
  ON public.sessions FOR UPDATE
  USING (teacher_id = auth.uid() AND status <> 'completed')
  WITH CHECK (teacher_id = auth.uid());

-- Enseignant supprime ses propres brouillons
CREATE POLICY "sessions: teacher DELETE own"
  ON public.sessions FOR DELETE
  USING (teacher_id = auth.uid() AND status = 'draft');

CREATE POLICY "sessions: admin SELECT"
  ON public.sessions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "sessions: admin INSERT"
  ON public.sessions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "sessions: admin UPDATE"
  ON public.sessions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "sessions: admin DELETE"
  ON public.sessions FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : session_participants
-- =============================================================

DROP POLICY IF EXISTS "sp: own SELECT"     ON public.session_participants;
DROP POLICY IF EXISTS "sp: teacher SELECT" ON public.session_participants;
DROP POLICY IF EXISTS "sp: student JOIN"   ON public.session_participants;
DROP POLICY IF EXISTS "sp: admin SELECT"   ON public.session_participants;
DROP POLICY IF EXISTS "sp: admin INSERT"   ON public.session_participants;
DROP POLICY IF EXISTS "sp: admin DELETE"   ON public.session_participants;

CREATE POLICY "sp: own SELECT"
  ON public.session_participants FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "sp: teacher SELECT"
  ON public.session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id AND s.teacher_id = auth.uid()
    )
  );

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

CREATE POLICY "sp: admin SELECT"
  ON public.session_participants FOR SELECT
  USING (public.is_admin());

CREATE POLICY "sp: admin INSERT"
  ON public.session_participants FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "sp: admin DELETE"
  ON public.session_participants FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : quiz_results
-- =============================================================

DROP POLICY IF EXISTS "qr: own SELECT"     ON public.quiz_results;
DROP POLICY IF EXISTS "qr: own INSERT"     ON public.quiz_results;
DROP POLICY IF EXISTS "qr: teacher SELECT" ON public.quiz_results;
DROP POLICY IF EXISTS "qr: parent SELECT"  ON public.quiz_results;
DROP POLICY IF EXISTS "qr: admin SELECT"   ON public.quiz_results;
DROP POLICY IF EXISTS "qr: admin INSERT"   ON public.quiz_results;
DROP POLICY IF EXISTS "qr: admin UPDATE"   ON public.quiz_results;
DROP POLICY IF EXISTS "qr: admin DELETE"   ON public.quiz_results;

CREATE POLICY "qr: own SELECT"
  ON public.quiz_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "qr: own INSERT"
  ON public.quiz_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "qr: teacher SELECT"
  ON public.quiz_results FOR SELECT
  USING (public.is_teacher_of(user_id));

CREATE POLICY "qr: parent SELECT"
  ON public.quiz_results FOR SELECT
  USING (public.is_parent_of(user_id));

CREATE POLICY "qr: admin SELECT"
  ON public.quiz_results FOR SELECT
  USING (public.is_admin());

CREATE POLICY "qr: admin INSERT"
  ON public.quiz_results FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "qr: admin UPDATE"
  ON public.quiz_results FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "qr: admin DELETE"
  ON public.quiz_results FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : user_xp
-- =============================================================

DROP POLICY IF EXISTS "xp: own SELECT"            ON public.user_xp;
DROP POLICY IF EXISTS "xp: teacher/parent SELECT" ON public.user_xp;
DROP POLICY IF EXISTS "xp: own UPDATE"            ON public.user_xp;
DROP POLICY IF EXISTS "xp: admin SELECT"          ON public.user_xp;
DROP POLICY IF EXISTS "xp: admin UPDATE"          ON public.user_xp;
DROP POLICY IF EXISTS "xp: admin DELETE"          ON public.user_xp;

CREATE POLICY "xp: own SELECT"
  ON public.user_xp FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "xp: teacher/parent SELECT"
  ON public.user_xp FOR SELECT
  USING (
    public.is_teacher_of(user_id)
    OR public.is_parent_of(user_id)
  );

CREATE POLICY "xp: own UPDATE"
  ON public.user_xp FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "xp: admin SELECT"
  ON public.user_xp FOR SELECT
  USING (public.is_admin());

CREATE POLICY "xp: admin UPDATE"
  ON public.user_xp FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "xp: admin DELETE"
  ON public.user_xp FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : badges
-- =============================================================

DROP POLICY IF EXISTS "badges: SELECT active" ON public.badges;
DROP POLICY IF EXISTS "badges: admin SELECT"  ON public.badges;
DROP POLICY IF EXISTS "badges: admin INSERT"  ON public.badges;
DROP POLICY IF EXISTS "badges: admin UPDATE"  ON public.badges;
DROP POLICY IF EXISTS "badges: admin DELETE"  ON public.badges;

CREATE POLICY "badges: SELECT active"
  ON public.badges FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "badges: admin SELECT"
  ON public.badges FOR SELECT
  USING (public.is_admin());

CREATE POLICY "badges: admin INSERT"
  ON public.badges FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "badges: admin UPDATE"
  ON public.badges FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "badges: admin DELETE"
  ON public.badges FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : user_badges
-- =============================================================

DROP POLICY IF EXISTS "ub: own SELECT"            ON public.user_badges;
DROP POLICY IF EXISTS "ub: teacher/parent SELECT" ON public.user_badges;
DROP POLICY IF EXISTS "ub: system INSERT"         ON public.user_badges;
DROP POLICY IF EXISTS "ub: admin SELECT"          ON public.user_badges;
DROP POLICY IF EXISTS "ub: admin INSERT"          ON public.user_badges;
DROP POLICY IF EXISTS "ub: admin DELETE"          ON public.user_badges;

CREATE POLICY "ub: own SELECT"
  ON public.user_badges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ub: teacher/parent SELECT"
  ON public.user_badges FOR SELECT
  USING (
    public.is_teacher_of(user_id)
    OR public.is_parent_of(user_id)
  );

-- L'élève peut recevoir ses propres badges (via Server Action sécurisée)
CREATE POLICY "ub: system INSERT"
  ON public.user_badges FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "ub: admin SELECT"
  ON public.user_badges FOR SELECT
  USING (public.is_admin());

CREATE POLICY "ub: admin INSERT"
  ON public.user_badges FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "ub: admin DELETE"
  ON public.user_badges FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : conversations
-- =============================================================

DROP POLICY IF EXISTS "conv: participant SELECT" ON public.conversations;
DROP POLICY IF EXISTS "conv: participant INSERT" ON public.conversations;
DROP POLICY IF EXISTS "conv: admin SELECT"       ON public.conversations;
DROP POLICY IF EXISTS "conv: admin INSERT"       ON public.conversations;
DROP POLICY IF EXISTS "conv: admin DELETE"       ON public.conversations;

CREATE POLICY "conv: participant SELECT"
  ON public.conversations FOR SELECT
  USING (participant1 = auth.uid() OR participant2 = auth.uid());

-- Seuls les enseignants, parents et admins démarrent des conversations
CREATE POLICY "conv: participant INSERT"
  ON public.conversations FOR INSERT
  WITH CHECK (
    (participant1 = auth.uid() OR participant2 = auth.uid())
    AND public.my_role() IN ('teacher', 'parent', 'admin', 'super_admin')
  );

CREATE POLICY "conv: admin SELECT"
  ON public.conversations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "conv: admin INSERT"
  ON public.conversations FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "conv: admin DELETE"
  ON public.conversations FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : messages
-- =============================================================

DROP POLICY IF EXISTS "msg: participant SELECT" ON public.messages;
DROP POLICY IF EXISTS "msg: sender INSERT"      ON public.messages;
DROP POLICY IF EXISTS "msg: recipient UPDATE"   ON public.messages;
DROP POLICY IF EXISTS "msg: admin SELECT"       ON public.messages;
DROP POLICY IF EXISTS "msg: admin INSERT"       ON public.messages;
DROP POLICY IF EXISTS "msg: admin DELETE"       ON public.messages;

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

-- Le destinataire peut marquer le message comme lu
CREATE POLICY "msg: recipient UPDATE"
  ON public.messages FOR UPDATE
  USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  )
  WITH CHECK (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

CREATE POLICY "msg: admin SELECT"
  ON public.messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "msg: admin INSERT"
  ON public.messages FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "msg: admin DELETE"
  ON public.messages FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : notifications
-- =============================================================

DROP POLICY IF EXISTS "notif: own SELECT"    ON public.notifications;
DROP POLICY IF EXISTS "notif: own UPDATE"    ON public.notifications;
DROP POLICY IF EXISTS "notif: system INSERT" ON public.notifications;
DROP POLICY IF EXISTS "notif: admin SELECT"  ON public.notifications;
DROP POLICY IF EXISTS "notif: admin INSERT"  ON public.notifications;
DROP POLICY IF EXISTS "notif: admin DELETE"  ON public.notifications;

CREATE POLICY "notif: own SELECT"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- L'utilisateur marque ses notifications comme lues
CREATE POLICY "notif: own UPDATE"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Seuls les admins et le système envoient des notifications
CREATE POLICY "notif: system INSERT"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notif: admin SELECT"
  ON public.notifications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "notif: admin INSERT"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notif: admin DELETE"
  ON public.notifications FOR DELETE
  USING (public.is_admin());

-- =============================================================
-- TABLE : activity_log
-- =============================================================

DROP POLICY IF EXISTS "log: admin SELECT" ON public.activity_log;
DROP POLICY IF EXISTS "log: admin INSERT" ON public.activity_log;
DROP POLICY IF EXISTS "log: super DELETE" ON public.activity_log;

-- Seuls les admins lisent les logs
CREATE POLICY "log: admin SELECT"
  ON public.activity_log FOR SELECT
  USING (public.is_admin());

-- Les admins et le système journalisent des actions
CREATE POLICY "log: admin INSERT"
  ON public.activity_log FOR INSERT
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Seul super_admin peut purger les logs (RGPD)
CREATE POLICY "log: super DELETE"
  ON public.activity_log FOR DELETE
  USING (public.is_super_admin());

-- =============================================================
-- RÉSUMÉ DES PERMISSIONS PAR RÔLE
-- =============================================================
-- student     : son profil, son XP, ses badges, ses résultats
--               + questions publiées + matières/thèmes actifs
--               + sessions auxquelles il est inscrit
-- teacher     : idem student + ses élèves + ses questions (draft)
--               + ses sessions + résultats de ses élèves
-- parent      : idem student + ses enfants + résultats de ses enfants
-- admin       : tout READ/WRITE sauf purge logs et suppression profils
-- super_admin : tout sans restriction
-- =============================================================
