-- =============================================================
--  NEKH XËL — Données de démonstration (seed)
--  Format Génie en Herbe — Programme CM2 Sénégal
--  30 questions réparties sur 5 matières (6 par matière)
-- =============================================================
-- À exécuter APRÈS supabase/schema.sql et supabase/rls-policies.sql
-- Toutes les questions sont publiées (status = 'published')
-- =============================================================

-- ─── Nettoyage (évite les doublons si seed relancé) ───────────
TRUNCATE public.quiz_results    RESTART IDENTITY CASCADE;
TRUNCATE public.questions       RESTART IDENTITY CASCADE;

-- ─── Helper : récupère l'id d'un sujet par slug ───────────────
DO $$
DECLARE
  -- UUIDs des matières
  v_maths    UUID;
  v_francais UUID;
  v_histoire UUID;
  v_geo      UUID;
  v_sciences UUID;
BEGIN
  SELECT id INTO v_maths    FROM public.subjects WHERE slug = 'maths';
  SELECT id INTO v_francais FROM public.subjects WHERE slug = 'francais';
  SELECT id INTO v_histoire FROM public.subjects WHERE slug = 'histoire';
  SELECT id INTO v_geo      FROM public.subjects WHERE slug = 'geo';
  SELECT id INTO v_sciences FROM public.subjects WHERE slug = 'sciences';

-- =============================================================
-- MATHÉMATIQUES — 6 questions
-- Programme CM2 sénégalais — calcul, géométrie, mesures, problèmes
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q1 : Calcul QCM facile
  (v_maths, 'maths', 'Nombres et opérations', 'qcm', 'facile',
   'Quel est le résultat de 8 × 9 ?',
   '["63", "72", "81", "56"]', 1,
   '8 × 9 = 72. Astuce : 8 × 9 = 8 × 10 − 8 = 80 − 8 = 72.',
   10, 'published'),

  -- Q2 : Géométrie QCM moyen
  (v_maths, 'maths', 'Géométrie', 'qcm', 'moyen',
   'Quelle est l''aire d''un rectangle de 7 cm de long et 4 cm de large ?',
   '["22 cm²", "24 cm²", "28 cm²", "32 cm²"]', 2,
   'Aire d''un rectangle = longueur × largeur = 7 × 4 = 28 cm².',
   15, 'published'),

  -- Q3 : Vrai/Faux mesures facile
  (v_maths, 'maths', 'Mesures', 'vrai_faux', 'facile',
   '1 heure = 60 minutes et 1 minute = 60 secondes.',
   NULL, NULL,
   'Vrai ! C''est le système sexagésimal utilisé pour mesurer le temps : 1 h = 60 min = 3 600 secondes.',
   8, 'published');

UPDATE public.questions
SET answer_bool = TRUE
WHERE subject = 'maths' AND theme = 'Mesures' AND type = 'vrai_faux';

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, pairs, explanation, xp, status)
VALUES
  -- Q4 : Association mesures moyen
  (v_maths, 'maths', 'Mesures', 'association', 'moyen',
   'Associe chaque unité à la grandeur qu''elle mesure :',
   '[["Kilogramme (kg)","Masse"],["Mètre (m)","Longueur"],["Litre (L)","Volume"]]',
   'Chaque grandeur physique a son unité officielle dans le Système International (SI).',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q5 : Problème QCM difficile
  (v_maths, 'maths', 'Problèmes', 'qcm', 'difficile',
   'Moussa achète 6 cahiers à 350 F CFA chacun et 3 stylos à 200 F CFA chacun. Combien dépense-t-il en tout ?',
   '["2 100 F", "2 500 F", "2 700 F", "3 000 F"]', 2,
   '6 × 350 = 2 100 F. 3 × 200 = 600 F. Total = 2 100 + 600 = 2 700 F CFA.',
   25, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, hints, answer_text, explanation, xp, status)
VALUES
  -- Q6 : Identification difficile
  (v_maths, 'maths', 'Géométrie', 'identification', 'difficile',
   'Quelle figure géométrique suis-je ?',
   '["J''ai 4 côtés égaux","Tous mes angles font 90°","Mes diagonales se coupent en angle droit et sont égales"]',
   'carré',
   'Le carré est un quadrilatère avec 4 côtés égaux et 4 angles droits. Ses diagonales sont égales et se croisent perpendiculairement.',
   20, 'published');

-- =============================================================
-- FRANÇAIS — 6 questions
-- Programme CM2 : grammaire, conjugaison, vocabulaire, lecture
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q7 : Grammaire QCM facile
  (v_francais, 'francais', 'Vocabulaire', 'qcm', 'facile',
   'Quel est le contraire (antonyme) du mot « rapide » ?',
   '["Vite", "Fort", "Lent", "Grand"]', 2,
   '"Lent" est le contraire de "rapide". Ces deux mots sont des antonymes : ils ont des sens opposés.',
   10, 'published'),

  -- Q8 : Conjugaison QCM moyen
  (v_francais, 'francais', 'Conjugaison', 'qcm', 'moyen',
   'Quelle est la forme correcte du passé composé ? « Hier, Aminata ___ à l''école. »',
   '["a allé", "est allée", "a été allée", "est allé"]', 1,
   '"Aller" se conjugue avec l''auxiliaire "être". Le participe "allée" s''accorde avec le sujet féminin Aminata.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  -- Q9 : Vrai/Faux vocabulaire facile
  (v_francais, 'francais', 'Vocabulaire', 'vrai_faux', 'facile',
   'Les mots « contente » et « heureuse » sont des synonymes.',
   TRUE,
   'Vrai ! "Contente" et "heureuse" expriment le même sentiment de joie. Ce sont des synonymes.',
   8, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, pairs, explanation, xp, status)
VALUES
  -- Q10 : Association vocabulaire moyen
  (v_francais, 'francais', 'Vocabulaire', 'association', 'moyen',
   'Associe chaque mot à son contraire :',
   '[["Chaud","Froid"],["Jour","Nuit"],["Ami","Ennemi"]]',
   'Les antonymes sont des mots de sens opposés. Ils permettent d''enrichir son vocabulaire et ses écrits.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q11 : Orthographe QCM difficile
  (v_francais, 'francais', 'Orthographe', 'qcm', 'difficile',
   'Choisissez la phrase correctement orthographiée :',
   '["Les élèves sont contentes de leurs résultat.","Les élèves sont contentes de leurs résultats.","Les élèves sont content de leurs résultats.","Les élèves sont contente de leurs résultats."]', 1,
   '"Élèves" est féminin pluriel → "contentes" (accord adj.). "Résultats" prend un s car il y en a plusieurs.',
   25, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, hints, answer_text, explanation, xp, status)
VALUES
  -- Q12 : Identification vocabulaire difficile
  (v_francais, 'francais', 'Lecture et compréhension', 'identification', 'difficile',
   'Quel type de texte suis-je ?',
   '["Je raconte une histoire imaginaire avec des personnages fictifs","Je commence souvent par « Il était une fois »","Dans ma tradition africaine, je mets en scène des animaux qui parlent et transmettent une leçon de vie"]',
   'conte',
   'Le conte est un récit imaginaire (souvent oral dans la tradition africaine) qui transmet des valeurs morales. Ex : les contes de Birago Diop avec Leuk le Lièvre.',
   20, 'published');

-- =============================================================
-- HISTOIRE — 6 questions
-- Empires africains, colonisation, indépendance, Sénégal
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q13 : Empire QCM facile
  (v_histoire, 'histoire', 'Empires africains médiévaux', 'qcm', 'facile',
   'Qui a fondé l''Empire du Mali au XIIIe siècle, vainqueur de la bataille de Kirina ?',
   '["Kankou Moussa","Soundiata Keïta","Askia Mohamed","Gaoussou Kouyaté"]', 1,
   'Soundiata Keïta fonda l''Empire du Mali vers 1235 après sa victoire sur Soumaoro Kanté à Kirina. Son histoire est contée dans l''épopée mandingue.',
   10, 'published'),

  -- Q14 : Indépendance QCM moyen
  (v_histoire, 'histoire', 'Indépendances africaines', 'qcm', 'moyen',
   'En quelle année le Sénégal a-t-il proclamé son indépendance ?',
   '["1958","1960","1962","1945"]', 1,
   'Le Sénégal a proclamé son indépendance le 4 avril 1960. Cette date est célébrée comme fête nationale.',
   12, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  -- Q15 : Vrai/Faux histoire facile
  (v_histoire, 'histoire', 'Histoire du Sénégal', 'vrai_faux', 'facile',
   'Dakar est la capitale du Sénégal depuis l''indépendance en 1960.',
   TRUE,
   'Vrai ! Dakar, fondée en 1857, est devenue la capitale du Sénégal indépendant en 1960. Elle se trouve sur la presqu''île du Cap-Vert.',
   8, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, pairs, explanation, xp, status)
VALUES
  -- Q16 : Association empires moyen
  (v_histoire, 'histoire', 'Empires africains médiévaux', 'association', 'moyen',
   'Associe chaque empire africain à son grand souverain :',
   '[["Empire du Mali","Kankou Moussa"],["Empire Songhaï","Askia Mohamed"],["Empire du Ghana","Soundiata Keïta"]]',
   'Ces trois grands empereurs ont dirigé les empires médiévaux les plus puissants de l''Afrique de l''Ouest.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q17 : Résistance QCM difficile
  (v_histoire, 'histoire', 'Histoire du Sénégal', 'qcm', 'difficile',
   'Lors de quelle bataille Lat Dior Ngoné Latyr Diop trouva-t-il la mort en résistant à la colonisation française ?',
   '["Bataille de Médine","Bataille de Dekhele","Bataille de Casamance","Bataille de Saint-Louis"]', 1,
   'Lat Dior mourut à la bataille de Dekhele le 26 octobre 1886. Il préférait mourir plutôt que de voir le chemin de fer traverser son royaume du Cayor.',
   25, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, hints, answer_text, explanation, xp, status)
VALUES
  -- Q18 : Identification difficile
  (v_histoire, 'histoire', 'Histoire du Sénégal', 'identification', 'difficile',
   'Qui suis-je ?',
   '["Né à Joal-Fadiouth en 1906","Poète et fondateur du mouvement de la Négritude avec Aimé Césaire","Premier président de la République du Sénégal, en poste de 1960 à 1980"]',
   'Léopold Sédar Senghor',
   'Léopold Sédar Senghor (1906–2001) : poète, philosophe et homme d''État. Co-fondateur du mouvement de la Négritude, il défendit les valeurs africaines à travers sa poésie.',
   20, 'published');

-- =============================================================
-- GÉOGRAPHIE — 6 questions
-- Sénégal, Afrique de l'Ouest, monde
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q19 : Sénégal QCM facile
  (v_geo, 'geo', 'Le Sénégal', 'qcm', 'facile',
   'Quel est le plus long fleuve qui forme la frontière nord du Sénégal avec la Mauritanie ?',
   '["Le fleuve Gambie","La Casamance","Le fleuve Sénégal","Le Sine"]', 2,
   'Le fleuve Sénégal (1 700 km) naît en Guinée et se jette dans l''Atlantique à Saint-Louis. Il borde la frontière nord du pays.',
   10, 'published'),

  -- Q20 : Afrique QCM moyen
  (v_geo, 'geo', 'L''Afrique de l''Ouest', 'qcm', 'moyen',
   'Quelle est la capitale du Mali, pays voisin du Sénégal ?',
   '["Niamey","Conakry","Bamako","Ouagadougou"]', 2,
   'Bamako est la capitale et la plus grande ville du Mali, située sur le fleuve Niger. Le Mali partage une longue frontière est avec le Sénégal.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  -- Q21 : Vrai/Faux facile
  (v_geo, 'geo', 'Le Sénégal', 'vrai_faux', 'facile',
   'La Gambie est un pays entièrement entouré par le Sénégal sauf sur sa côte atlantique.',
   TRUE,
   'Vrai ! La Gambie est un micro-État enclavé dans le Sénégal qui suit le cours du fleuve Gambie. Elle a une petite ouverture sur l''Atlantique.',
   8, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, pairs, explanation, xp, status)
VALUES
  -- Q22 : Association capitales moyen
  (v_geo, 'geo', 'L''Afrique de l''Ouest', 'association', 'moyen',
   'Associe chaque pays à sa capitale :',
   '[["Guinée","Conakry"],["Côte d''Ivoire","Yamoussoukro"],["Mauritanie","Nouakchott"]]',
   'Ces pays d''Afrique de l''Ouest partagent des frontières avec le Sénégal. Connaître leurs capitales est essentiel en CM2.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q23 : Sénégal QCM difficile
  (v_geo, 'geo', 'Le Sénégal', 'qcm', 'difficile',
   'Combien de régions administratives compte le Sénégal depuis la réforme de 2008 ?',
   '["10","12","14","16"]', 2,
   'Depuis 2008, le Sénégal est divisé en 14 régions administratives : Dakar, Thiès, Saint-Louis, Diourbel, Fatick, Kaolack, Kaffrine, Louga, Tambacounda, Kédougou, Kolda, Sédhiou, Ziguinchor et Matam.',
   25, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, hints, answer_text, explanation, xp, status)
VALUES
  -- Q24 : Identification ville sénégalaise difficile
  (v_geo, 'geo', 'Le Sénégal', 'identification', 'difficile',
   'Quelle ville sénégalaise suis-je ?',
   '["Ancienne capitale de l''AOF (Afrique Occidentale Française)","Je suis classée au Patrimoine Mondial de l''UNESCO","Fondée au XVIIe siècle sur une île du fleuve Sénégal, à l''embouchure"]',
   'Saint-Louis',
   'Saint-Louis (Ndar en wolof) fut fondée par les Français vers 1659. Première ville d''Afrique subsaharienne, ancienne capitale du Sénégal, elle est classée au patrimoine de l''UNESCO depuis 2000.',
   20, 'published');

-- =============================================================
-- SCIENCES — 6 questions
-- Le vivant, corps humain, matière, énergie
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q25 : Le vivant QCM facile
  (v_sciences, 'sciences', 'Le monde du vivant', 'qcm', 'facile',
   'Quel gaz les plantes rejettent-elles lors de la photosynthèse, utile à notre respiration ?',
   '["Dioxyde de carbone (CO₂)","Azote (N₂)","Oxygène (O₂)","Vapeur d''eau"]', 2,
   'Les plantes absorbent le CO₂ et l''eau, et grâce à la lumière solaire produisent du sucre (leur nourriture) et rejettent de l''oxygène (O₂) que nous respirons.',
   10, 'published'),

  -- Q26 : Corps humain QCM moyen
  (v_sciences, 'sciences', 'Corps humain', 'qcm', 'moyen',
   'Quel organe du corps humain filtre le sang et produit l''urine pour éliminer les déchets ?',
   '["Le foie","Le cœur","Les reins","Les poumons"]', 2,
   'Les deux reins filtrent environ 180 litres de sang par jour et produisent 1 à 2 litres d''urine. Ils régulent aussi la pression artérielle.',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  -- Q27 : Vrai/Faux vivant facile
  (v_sciences, 'sciences', 'Le monde du vivant', 'vrai_faux', 'facile',
   'Les chauves-souris sont des oiseaux car elles volent.',
   FALSE,
   'Faux ! Les chauves-souris sont des mammifères : elles ont des poils, allaitent leurs petits et ont du sang chaud. Elles volent grâce à des ailes membraneuses, non des plumes.',
   8, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, pairs, explanation, xp, status)
VALUES
  -- Q28 : Association reproduction animale moyen
  (v_sciences, 'sciences', 'Le monde du vivant', 'association', 'moyen',
   'Associe chaque animal à son mode de reproduction :',
   '[["Poule","Ovipare (pond des œufs)"],["Baleine","Vivipare (naissance directe)"],["Grenouille","Ovipare (dans l''eau)"]]',
   'Les animaux ovipares pondent des œufs (oiseaux, poissons, reptiles, amphibiens). Les vivipares donnent naissance à des petits formés (mammifères).',
   15, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  -- Q29 : Matière QCM difficile
  (v_sciences, 'sciences', 'La matière', 'qcm', 'difficile',
   'À quelle température l''eau pure bout-elle au niveau de la mer ?',
   '["0°C","50°C","100°C","120°C"]', 2,
   'L''eau bout à 100°C à pression atmosphérique normale (au niveau de la mer). Elle gèle à 0°C. En altitude, elle bout à une température plus basse car la pression diminue.',
   20, 'published');

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, hints, answer_text, explanation, xp, status)
VALUES
  -- Q30 : Identification corps humain difficile
  (v_sciences, 'sciences', 'Corps humain', 'identification', 'difficile',
   'Quel organe suis-je ?',
   '["Je suis le plus grand organe du corps humain","Je protège les autres organes de l''extérieur et régule la température","Je contiens environ 2 millions de glandes sudoripares et des récepteurs sensoriels"]',
   'la peau',
   'La peau est le plus grand organe du corps (environ 2 m², 5 kg). Elle protège contre les microbes et les UV, régule la température par la transpiration, et possède des millions de récepteurs tactiles.',
   20, 'published');

-- ─── Fin du bloc DO $$ ────────────────────────────────────────
END $$;

-- =============================================================
-- VÉRIFICATION — compte des questions insérées
-- =============================================================
SELECT
  subject,
  COUNT(*)           AS nombre_questions,
  COUNT(*) FILTER (WHERE difficulty = 'facile')    AS facile,
  COUNT(*) FILTER (WHERE difficulty = 'moyen')     AS moyen,
  COUNT(*) FILTER (WHERE difficulty = 'difficile') AS difficile
FROM public.questions
WHERE status = 'published'
GROUP BY subject
ORDER BY subject;

-- Résultat attendu : 5 matières × 6 questions = 30 total
SELECT COUNT(*) AS total_questions FROM public.questions WHERE status = 'published';
