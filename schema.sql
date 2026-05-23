-- =============================================================
--  GESTU – Schéma SQL complet
--  Base : PostgreSQL / Supabase
--  Auteur : GESTU team
-- =============================================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- 0. TYPES ÉNUMÉRÉS
-- =============================================================

create type user_role     as enum ('student', 'teacher', 'parent', 'admin');
create type course_level  as enum ('debutant', 'intermediaire', 'avance');
create type exercise_type as enum ('qcm', 'vrai_faux', 'completion', 'redaction', 'calcul');
create type badge_trigger as enum ('first_course', 'first_perfect', 'streak_7', 'streak_30', 'courses_10', 'score_avg_90');
create type notif_type    as enum ('message', 'badge', 'result', 'reminder', 'system');

-- =============================================================
-- 1. PROFILES
--    Étend auth.users de Supabase.
--    Un profil est créé automatiquement à l'inscription via trigger.
-- =============================================================

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role    not null default 'student',
  first_name    text         not null,
  last_name     text         not null,
  username      text         unique,
  avatar_url    text,
  school_level  text,                        -- ex : "CM2", "6ème"
  bio           text,
  timezone      text         not null default 'UTC',
  locale        text         not null default 'fr',
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

comment on table public.profiles is
  'Profil utilisateur étendu lié à auth.users.';

-- Trigger : mettre à jour updated_at automatiquement
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger : créer un profil vide à chaque inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- 2. RELATIONS PARENT ↔ ENFANT
--    Un parent peut suivre plusieurs enfants (élèves).
-- =============================================================

create table public.parent_child (
  id         uuid primary key default uuid_generate_v4(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  child_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_parent_child unique (parent_id, child_id),
  constraint chk_not_self check (parent_id <> child_id)
);

comment on table public.parent_child is
  'Associe un parent (role=parent) à ses enfants (role=student).';

create index idx_parent_child_parent on public.parent_child(parent_id);
create index idx_parent_child_child  on public.parent_child(child_id);


-- =============================================================
-- 3. RELATIONS ENSEIGNANT ↔ ÉLÈVE
--    Un enseignant peut gérer plusieurs élèves et vice-versa.
-- =============================================================

create table public.teacher_student (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint uq_teacher_student unique (teacher_id, student_id),
  constraint chk_not_self check (teacher_id <> student_id)
);

create index idx_teacher_student_teacher on public.teacher_student(teacher_id);
create index idx_teacher_student_student on public.teacher_student(student_id);


-- =============================================================
-- 4. MATIÈRES
--    Référentiel des disciplines (Histoire, Maths, etc.)
-- =============================================================

create table public.subjects (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,           -- ex : "histoire", "calcul-mental"
  name        text not null,                  -- ex : "Histoire"
  description text,
  icon        text,                           -- emoji ou nom d'icône
  color       text,                           -- ex : "#6366f1"
  position    smallint not null default 0,    -- ordre d'affichage
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.subjects is
  'Disciplines enseignées : Histoire, Géographie, Sciences, etc.';

-- Données initiales
insert into public.subjects (slug, name, description, icon, color, position) values
  ('histoire',          'Histoire',           'Découverte des grandes périodes historiques',         '🏛️', '#f59e0b', 1),
  ('geographie',        'Géographie',         'Exploration du monde et des territoires',             '🌍', '#10b981', 2),
  ('sciences',          'Sciences',           'Physique, biologie, chimie adaptées aux enfants',     '🔬', '#ef4444', 3),
  ('instruction-civique','Instruction civique','La vie en société, les institutions, les droits',    '⚖️', '#8b5cf6', 4),
  ('orthographe',       'Orthographe',        'Règles d'écriture et dictées progressives',          '✏️', '#3b82f6', 5),
  ('conjugaison',       'Conjugaison',        'Temps, modes et personnes des verbes',                '📝', '#06b6d4', 6),
  ('grammaire',         'Grammaire',          'Structure de la langue française',                    '📖', '#6366f1', 7),
  ('calcul-mental',     'Calcul mental',      'Rapidité et précision en calcul',                    '🔢', '#ec4899', 8),
  ('culture-generale',  'Culture générale',   'Connaissances variées sur le monde',                 '🎓', '#14b8a6', 9);


-- =============================================================
-- 5. COURS
--    Un cours appartient à une matière et est créé par un enseignant.
-- =============================================================

create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  subject_id   uuid not null references public.subjects(id) on delete restrict,
  author_id    uuid not null references public.profiles(id) on delete restrict,
  title        text         not null,
  description  text,
  level        course_level not null default 'debutant',
  thumbnail_url text,
  duration_min  smallint,                     -- durée totale estimée en minutes
  is_published  boolean not null default false,
  position      smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.courses is
  'Cours pédagogiques rattachés à une matière.';

create trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create index idx_courses_subject    on public.courses(subject_id);
create index idx_courses_author     on public.courses(author_id);
create index idx_courses_published  on public.courses(is_published);


-- =============================================================
-- 6. CHAPITRES
--    Regroupe des leçons au sein d'un cours.
-- =============================================================

create table public.chapters (
  id         uuid primary key default uuid_generate_v4(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text     not null,
  position   smallint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_chapters_course on public.chapters(course_id);


-- =============================================================
-- 7. LEÇONS
--    Contenu pédagogique d'un chapitre.
-- =============================================================

create table public.lessons (
  id           uuid primary key default uuid_generate_v4(),
  chapter_id   uuid not null references public.chapters(id) on delete cascade,
  title        text     not null,
  content      text,                          -- HTML ou Markdown
  video_url    text,
  duration_min smallint not null default 5,
  position     smallint not null default 0,
  is_free      boolean  not null default false, -- accessible sans inscription
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create index idx_lessons_chapter on public.lessons(chapter_id);


-- =============================================================
-- 8. EXERCICES
--    Quiz associé à une leçon ou à un cours entier.
-- =============================================================

create table public.exercises (
  id           uuid primary key default uuid_generate_v4(),
  course_id    uuid references public.courses(id) on delete cascade,
  lesson_id    uuid references public.lessons(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete restrict,
  title        text          not null,
  description  text,
  type         exercise_type not null default 'qcm',
  duration_min smallint      not null default 10,
  xp_reward    smallint      not null default 50,
  is_published boolean       not null default false,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now(),
  constraint chk_exercise_parent check (
    (course_id is not null) or (lesson_id is not null)
  )
);

comment on table public.exercises is
  'Exercice rattaché soit à un cours, soit à une leçon spécifique.';

create trigger trg_exercises_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

create index idx_exercises_course  on public.exercises(course_id);
create index idx_exercises_lesson  on public.exercises(lesson_id);
create index idx_exercises_author  on public.exercises(author_id);


-- =============================================================
-- 9. QUESTIONS
--    Questions d'un exercice.
-- =============================================================

create table public.questions (
  id            uuid primary key default uuid_generate_v4(),
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  body          text     not null,            -- énoncé de la question
  explanation   text,                         -- explication de la bonne réponse
  points        smallint not null default 10,
  position      smallint not null default 0,
  image_url     text,
  created_at    timestamptz not null default now()
);

create index idx_questions_exercise on public.questions(exercise_id);


-- =============================================================
-- 10. CHOIX DE RÉPONSE
--     Options QCM, Vrai/Faux, etc. pour chaque question.
-- =============================================================

create table public.choices (
  id          uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  body        text    not null,
  is_correct  boolean not null default false,
  position    smallint not null default 0
);

create index idx_choices_question on public.choices(question_id);


-- =============================================================
-- 11. PROGRESSION DES LEÇONS
--     Suivi par élève : leçon commencée / terminée.
-- =============================================================

create table public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean     not null default false,
  completed_at timestamptz,
  time_spent_s integer     not null default 0,   -- secondes passées sur la leçon
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint uq_lesson_progress unique (user_id, lesson_id)
);

create trigger trg_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create index idx_lesson_progress_user   on public.lesson_progress(user_id);
create index idx_lesson_progress_lesson on public.lesson_progress(lesson_id);


-- =============================================================
-- 12. TENTATIVES D'EXERCICE
--     Chaque fois qu'un élève passe un exercice.
-- =============================================================

create table public.exercise_attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  score        smallint    not null default 0,   -- score en %
  xp_earned    smallint    not null default 0,
  duration_s   integer     not null default 0,   -- durée de la tentative
  is_completed boolean     not null default false,
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_attempts_user     on public.exercise_attempts(user_id);
create index idx_attempts_exercise on public.exercise_attempts(exercise_id);
create index idx_attempts_score    on public.exercise_attempts(score);


-- =============================================================
-- 13. RÉPONSES PAR TENTATIVE
--     Détail des réponses données par l'élève.
-- =============================================================

create table public.attempt_answers (
  id           uuid primary key default uuid_generate_v4(),
  attempt_id   uuid not null references public.exercise_attempts(id) on delete cascade,
  question_id  uuid not null references public.questions(id) on delete cascade,
  choice_id    uuid references public.choices(id) on delete set null,
  free_answer  text,                                -- pour les questions ouvertes
  is_correct   boolean not null default false,
  answered_at  timestamptz not null default now()
);

create index idx_attempt_answers_attempt  on public.attempt_answers(attempt_id);
create index idx_attempt_answers_question on public.attempt_answers(question_id);


-- =============================================================
-- 14. XP & NIVEAU UTILISATEUR
--     Cumul d'XP et niveau calculé automatiquement.
-- =============================================================

create table public.user_xp (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade unique,
  total_xp   integer not null default 0,
  level      smallint not null default 1,
  streak     smallint not null default 0,         -- jours consécutifs d'activité
  last_active_date date,
  updated_at timestamptz not null default now()
);

comment on table public.user_xp is
  'XP cumulé, niveau et streak quotidien de chaque utilisateur.';

create trigger trg_user_xp_updated_at
  before update on public.user_xp
  for each row execute function public.set_updated_at();

-- Trigger : créer une ligne xp à la création du profil
create or replace function public.init_user_xp()
returns trigger language plpgsql as $$
begin
  insert into public.user_xp (user_id) values (new.id);
  return new;
end;
$$;

create trigger trg_init_user_xp
  after insert on public.profiles
  for each row execute function public.init_user_xp();


-- =============================================================
-- 15. BADGES
--     Référentiel des badges disponibles.
-- =============================================================

create table public.badges (
  id          uuid primary key default uuid_generate_v4(),
  slug        text         not null unique,
  name        text         not null,
  description text,
  icon        text,
  trigger     badge_trigger not null,
  xp_bonus    smallint      not null default 0,
  created_at  timestamptz   not null default now()
);

insert into public.badges (slug, name, description, icon, trigger, xp_bonus) values
  ('first-course',   'Premier cours',         'Complétez votre premier cours',             '🚀', 'first_course',   50),
  ('first-perfect',  'Score parfait',          'Obtenez 100% à un exercice',                '🎯', 'first_perfect', 100),
  ('streak-7',       'Série de 7 jours',       '7 jours consécutifs d'activité',           '🔥', 'streak_7',      150),
  ('streak-30',      'Série de 30 jours',      '30 jours consécutifs d'activité',          '💎', 'streak_30',     500),
  ('courses-10',     'Lecteur assidu',          '10 cours complétés',                        '📚', 'courses_10',    200),
  ('score-avg-90',   'Excellence',             'Moyenne générale ≥ 90%',                   '⭐', 'score_avg_90',  300);


-- =============================================================
-- 16. BADGES UTILISATEUR
--     Badges gagnés par chaque élève.
-- =============================================================

create table public.user_badges (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   uuid not null references public.badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  constraint uq_user_badge unique (user_id, badge_id)
);

create index idx_user_badges_user  on public.user_badges(user_id);
create index idx_user_badges_badge on public.user_badges(badge_id);


-- =============================================================
-- 17. CONVERSATIONS
--     Canal entre deux utilisateurs.
-- =============================================================

create table public.conversations (
  id           uuid primary key default uuid_generate_v4(),
  participant1 uuid not null references public.profiles(id) on delete cascade,
  participant2 uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  constraint uq_conversation unique (
    least(participant1::text, participant2::text),
    greatest(participant1::text, participant2::text)
  ),
  constraint chk_conv_not_self check (participant1 <> participant2)
);

create index idx_conversations_p1 on public.conversations(participant1);
create index idx_conversations_p2 on public.conversations(participant2);


-- =============================================================
-- 18. MESSAGES
--     Messages dans une conversation.
-- =============================================================

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text        not null,
  is_read         boolean     not null default false,
  created_at      timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_sender       on public.messages(sender_id);
create index idx_messages_created      on public.messages(created_at desc);


-- =============================================================
-- 19. NOTIFICATIONS
--     Notifications in-app pour chaque utilisateur.
-- =============================================================

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       notif_type  not null,
  title      text        not null,
  body       text,
  link       text,                               -- route interne ex : "/results"
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user    on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(user_id, is_read);
create index idx_notifications_created on public.notifications(created_at desc);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Activer RLS sur toutes les tables
alter table public.profiles           enable row level security;
alter table public.parent_child        enable row level security;
alter table public.teacher_student     enable row level security;
alter table public.subjects            enable row level security;
alter table public.courses             enable row level security;
alter table public.chapters            enable row level security;
alter table public.lessons             enable row level security;
alter table public.exercises           enable row level security;
alter table public.questions           enable row level security;
alter table public.choices             enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.exercise_attempts   enable row level security;
alter table public.attempt_answers     enable row level security;
alter table public.user_xp             enable row level security;
alter table public.badges              enable row level security;
alter table public.user_badges         enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.notifications       enable row level security;

-- ─── Helpers ──────────────────────────────────────────────────

create or replace function public.my_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_teacher_of(student uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.teacher_student
    where teacher_id = auth.uid() and student_id = student
  );
$$;

create or replace function public.is_parent_of(child uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.parent_child
    where parent_id = auth.uid() and child_id = child
  );
$$;

-- ─── PROFILES ─────────────────────────────────────────────────

-- Chacun voit son propre profil
create policy "profiles: own read"
  on public.profiles for select
  using (id = auth.uid());

-- Les enseignants voient leurs élèves
create policy "profiles: teacher reads students"
  on public.profiles for select
  using (public.is_teacher_of(id));

-- Les parents voient leurs enfants
create policy "profiles: parent reads children"
  on public.profiles for select
  using (public.is_parent_of(id));

-- Les admins voient tout
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Chacun modifie seulement son profil
create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid());

-- ─── PARENT_CHILD ─────────────────────────────────────────────

create policy "parent_child: parent reads own"
  on public.parent_child for select
  using (parent_id = auth.uid() or child_id = auth.uid());

create policy "parent_child: admin all"
  on public.parent_child for all
  using (public.is_admin());

create policy "parent_child: parent insert"
  on public.parent_child for insert
  with check (parent_id = auth.uid() and public.my_role() = 'parent');

-- ─── TEACHER_STUDENT ──────────────────────────────────────────

create policy "teacher_student: own read"
  on public.teacher_student for select
  using (teacher_id = auth.uid() or student_id = auth.uid());

create policy "teacher_student: teacher insert"
  on public.teacher_student for insert
  with check (teacher_id = auth.uid() and public.my_role() = 'teacher');

create policy "teacher_student: admin all"
  on public.teacher_student for all
  using (public.is_admin());

-- ─── SUBJECTS ─────────────────────────────────────────────────
-- Lecture publique, écriture admin uniquement

create policy "subjects: read all"
  on public.subjects for select
  using (is_active = true or public.is_admin());

create policy "subjects: admin write"
  on public.subjects for all
  using (public.is_admin());

-- ─── COURSES ──────────────────────────────────────────────────

-- Cours publiés visibles par tout le monde authentifié
create policy "courses: read published"
  on public.courses for select
  using (
    is_published = true
    or author_id = auth.uid()
    or public.is_admin()
  );

-- Seuls les enseignants et admins créent des cours
create policy "courses: teacher insert"
  on public.courses for insert
  with check (
    author_id = auth.uid()
    and public.my_role() in ('teacher', 'admin')
  );

-- L'auteur ou un admin peut modifier/supprimer
create policy "courses: author or admin update"
  on public.courses for update
  using (author_id = auth.uid() or public.is_admin());

create policy "courses: author or admin delete"
  on public.courses for delete
  using (author_id = auth.uid() or public.is_admin());

-- ─── CHAPTERS ─────────────────────────────────────────────────

create policy "chapters: read if course visible"
  on public.chapters for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.is_published = true or c.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "chapters: teacher write"
  on public.chapters for all
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.author_id = auth.uid() or public.is_admin())
    )
  );

-- ─── LESSONS ──────────────────────────────────────────────────

create policy "lessons: read if course visible"
  on public.lessons for select
  using (
    exists (
      select 1 from public.chapters ch
      join public.courses c on c.id = ch.course_id
      where ch.id = chapter_id
        and (c.is_published = true or c.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "lessons: teacher write"
  on public.lessons for all
  using (
    exists (
      select 1 from public.chapters ch
      join public.courses c on c.id = ch.course_id
      where ch.id = chapter_id
        and (c.author_id = auth.uid() or public.is_admin())
    )
  );

-- ─── EXERCISES ────────────────────────────────────────────────

create policy "exercises: read published"
  on public.exercises for select
  using (
    is_published = true
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "exercises: teacher insert"
  on public.exercises for insert
  with check (
    author_id = auth.uid()
    and public.my_role() in ('teacher', 'admin')
  );

create policy "exercises: author or admin write"
  on public.exercises for update
  using (author_id = auth.uid() or public.is_admin());

create policy "exercises: author or admin delete"
  on public.exercises for delete
  using (author_id = auth.uid() or public.is_admin());

-- ─── QUESTIONS & CHOICES ──────────────────────────────────────

create policy "questions: read if exercise visible"
  on public.questions for select
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_id
        and (e.is_published = true or e.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "questions: teacher write"
  on public.questions for all
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_id
        and (e.author_id = auth.uid() or public.is_admin())
    )
  );

-- Les choix sont visibles si la question l'est
create policy "choices: read if question visible"
  on public.choices for select
  using (
    exists (
      select 1 from public.questions q
      join public.exercises e on e.id = q.exercise_id
      where q.id = question_id
        and (e.is_published = true or e.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "choices: teacher write"
  on public.choices for all
  using (
    exists (
      select 1 from public.questions q
      join public.exercises e on e.id = q.exercise_id
      where q.id = question_id
        and (e.author_id = auth.uid() or public.is_admin())
    )
  );

-- ─── LESSON_PROGRESS ──────────────────────────────────────────

create policy "lesson_progress: own read/write"
  on public.lesson_progress for all
  using (user_id = auth.uid());

create policy "lesson_progress: teacher reads students"
  on public.lesson_progress for select
  using (public.is_teacher_of(user_id));

create policy "lesson_progress: parent reads children"
  on public.lesson_progress for select
  using (public.is_parent_of(user_id));

create policy "lesson_progress: admin all"
  on public.lesson_progress for all
  using (public.is_admin());

-- ─── EXERCISE_ATTEMPTS ────────────────────────────────────────

create policy "attempts: own all"
  on public.exercise_attempts for all
  using (user_id = auth.uid());

create policy "attempts: teacher reads students"
  on public.exercise_attempts for select
  using (public.is_teacher_of(user_id));

create policy "attempts: parent reads children"
  on public.exercise_attempts for select
  using (public.is_parent_of(user_id));

create policy "attempts: admin all"
  on public.exercise_attempts for all
  using (public.is_admin());

-- ─── ATTEMPT_ANSWERS ──────────────────────────────────────────

create policy "attempt_answers: own all"
  on public.attempt_answers for all
  using (
    exists (
      select 1 from public.exercise_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

create policy "attempt_answers: teacher reads"
  on public.attempt_answers for select
  using (
    exists (
      select 1 from public.exercise_attempts a
      where a.id = attempt_id and public.is_teacher_of(a.user_id)
    )
  );

create policy "attempt_answers: admin all"
  on public.attempt_answers for all
  using (public.is_admin());

-- ─── USER_XP ──────────────────────────────────────────────────

create policy "user_xp: own read"
  on public.user_xp for select
  using (user_id = auth.uid());

create policy "user_xp: teacher/parent read"
  on public.user_xp for select
  using (public.is_teacher_of(user_id) or public.is_parent_of(user_id));

create policy "user_xp: system update"
  on public.user_xp for update
  using (user_id = auth.uid() or public.is_admin());

create policy "user_xp: admin all"
  on public.user_xp for all
  using (public.is_admin());

-- ─── BADGES ───────────────────────────────────────────────────

create policy "badges: read all"
  on public.badges for select
  to authenticated
  using (true);

create policy "badges: admin write"
  on public.badges for all
  using (public.is_admin());

-- ─── USER_BADGES ──────────────────────────────────────────────

create policy "user_badges: own read"
  on public.user_badges for select
  using (user_id = auth.uid());

create policy "user_badges: teacher/parent read"
  on public.user_badges for select
  using (public.is_teacher_of(user_id) or public.is_parent_of(user_id));

create policy "user_badges: system insert"
  on public.user_badges for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "user_badges: admin all"
  on public.user_badges for all
  using (public.is_admin());

-- ─── CONVERSATIONS ────────────────────────────────────────────

create policy "conversations: participant read"
  on public.conversations for select
  using (participant1 = auth.uid() or participant2 = auth.uid());

create policy "conversations: participant insert"
  on public.conversations for insert
  with check (participant1 = auth.uid() or participant2 = auth.uid());

create policy "conversations: admin all"
  on public.conversations for all
  using (public.is_admin());

-- ─── MESSAGES ─────────────────────────────────────────────────

create policy "messages: participant read"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1 = auth.uid() or c.participant2 = auth.uid())
    )
  );

create policy "messages: participant insert"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1 = auth.uid() or c.participant2 = auth.uid())
    )
  );

create policy "messages: sender update (mark read)"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant1 = auth.uid() or c.participant2 = auth.uid())
    )
  );

create policy "messages: admin all"
  on public.messages for all
  using (public.is_admin());

-- ─── NOTIFICATIONS ────────────────────────────────────────────

create policy "notifications: own read"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications: own update (mark read)"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "notifications: system insert"
  on public.notifications for insert
  with check (public.is_admin() or user_id = auth.uid());

create policy "notifications: admin all"
  on public.notifications for all
  using (public.is_admin());


-- =============================================================
-- VUES UTILITAIRES
-- =============================================================

-- Vue : progression globale d'un élève par cours
create or replace view public.v_course_progress as
select
  p.user_id,
  c.id          as course_id,
  c.title       as course_title,
  s.name        as subject_name,
  count(l.id)                                           as total_lessons,
  count(lp.id) filter (where lp.is_completed = true)   as done_lessons,
  round(
    count(lp.id) filter (where lp.is_completed = true)::numeric
    / nullif(count(l.id), 0) * 100
  )                                                     as progress_pct,
  sum(lp.time_spent_s)                                  as time_spent_s
from public.courses c
join public.subjects s          on s.id = c.subject_id
join public.chapters ch         on ch.course_id = c.id
join public.lessons l           on l.chapter_id = ch.id
left join public.lesson_progress lp
  on lp.lesson_id = l.id
left join public.profiles p     on p.id = lp.user_id
where c.is_published = true
group by p.user_id, c.id, c.title, s.name;

-- Vue : meilleur score par exercice et par élève
create or replace view public.v_best_scores as
select
  user_id,
  exercise_id,
  max(score)        as best_score,
  count(*)          as attempts,
  sum(xp_earned)    as total_xp,
  max(completed_at) as last_attempt
from public.exercise_attempts
where is_completed = true
group by user_id, exercise_id;


-- =============================================================
-- FIN DU SCHÉMA
-- =============================================================
