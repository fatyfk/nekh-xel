-- =============================================================
--  NEKH XËL — Données de démonstration (seed)
--  Format Génie en Herbe — Programme CM2 Sénégal
--  50 questions : 10 par matière × 5 matières
-- =============================================================
-- À exécuter APRÈS supabase/schema.sql et supabase/rls-policies.sql
-- Aucun bloc DO $$ — uniquement des INSERT avec sous-requêtes SELECT.
-- =============================================================

-- ─── Nettoyage (idempotent si seed relancé) ───────────────────
TRUNCATE public.quiz_results CASCADE;
TRUNCATE public.questions    CASCADE;

-- =============================================================
-- MATHÉMATIQUES — 10 questions
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Nombres et opérations', 'qcm', 'facile',
    'Quel est le résultat de 8 × 9 ?',
    '["63", "72", "81", "56"]', 1,
    '8 × 9 = 72. Astuce : 8 × 10 = 80, puis 80 − 8 = 72.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Géométrie', 'qcm', 'facile',
    'Quel est le périmètre d''un carré de côté 5 cm ?',
    '["10 cm", "15 cm", "20 cm", "25 cm"]', 2,
    'Périmètre d''un carré = 4 × côté = 4 × 5 = 20 cm.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Géométrie', 'qcm', 'moyen',
    'Quelle est l''aire d''un rectangle de 7 cm de long et 4 cm de large ?',
    '["22 cm²", "24 cm²", "28 cm²", "32 cm²"]', 2,
    'Aire = longueur × largeur = 7 × 4 = 28 cm².',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Nombres et opérations', 'qcm', 'moyen',
    '2,5 + 3,7 = ?',
    '["5,2", "6,2", "6,12", "7,2"]', 1,
    '2,5 + 3,7 : on aligne les décimales. 5 + 7 = 12, je pose 2 et retiens 1. 2 + 3 + 1 = 6. Résultat : 6,2.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Problèmes', 'qcm', 'moyen',
    'Un triangle a des côtés de 6 cm, 8 cm et 10 cm. Quel est son périmètre ?',
    '["14 cm", "20 cm", "24 cm", "30 cm"]', 2,
    'Périmètre = somme des 3 côtés = 6 + 8 + 10 = 24 cm.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Problèmes', 'qcm', 'difficile',
    'Moussa achète 6 cahiers à 350 F CFA et 3 stylos à 200 F CFA. Combien dépense-t-il en tout ?',
    '["2 100 F", "2 500 F", "2 700 F", "3 000 F"]', 2,
    '6 × 350 = 2 100 F. 3 × 200 = 600 F. Total = 2 100 + 600 = 2 700 F CFA.',
    25, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Fractions', 'qcm', 'difficile',
    '1/2 + 1/4 = ?',
    '["1/6", "3/4", "2/4", "2/6"]', 1,
    '1/2 = 2/4. Donc 2/4 + 1/4 = 3/4.',
    25, 'published'
  );

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Mesures', 'vrai_faux', 'facile',
    '1 heure = 60 minutes et 1 minute = 60 secondes.',
    TRUE,
    'Vrai ! C''est le système sexagésimal : 1 h = 60 min et 1 min = 60 s, donc 1 h = 3 600 secondes.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Géométrie', 'vrai_faux', 'facile',
    'Un carré est un rectangle particulier dont tous les côtés sont égaux.',
    TRUE,
    'Vrai ! Le carré est bien un rectangle (4 angles droits) avec la propriété supplémentaire d''avoir 4 côtés égaux.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'maths'),
    'maths', 'Géométrie', 'vrai_faux', 'moyen',
    'La somme des angles d''un triangle est toujours égale à 180°.',
    TRUE,
    'Vrai ! Quelle que soit la forme du triangle (équilatéral, isocèle, scalène), la somme de ses 3 angles vaut toujours 180°.',
    12, 'published'
  );

-- =============================================================
-- FRANÇAIS — 10 questions
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'qcm', 'facile',
    'Quel est le contraire (antonyme) du mot « rapide » ?',
    '["Vite", "Fort", "Lent", "Grand"]', 2,
    '"Lent" est l''antonyme de "rapide". Ces deux mots ont des sens opposés.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'qcm', 'facile',
    'Quel est le pluriel du mot « cheval » ?',
    '["chevals", "chevaux", "chevales", "cheval"]', 1,
    '"Cheval" fait "chevaux" au pluriel. Les noms en -al font généralement leur pluriel en -aux.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Conjugaison', 'qcm', 'moyen',
    'Quelle est la forme correcte du passé composé ? « Hier, Aminata ___ à l''école. »',
    '["a allé", "est allée", "a été allée", "est allé"]', 1,
    '"Aller" se conjugue avec "être". Le participe "allée" s''accorde avec Aminata (féminin singulier).',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'qcm', 'moyen',
    'Quelle est la nature du mot « rapidement » dans cette phrase : « Il court rapidement. » ?',
    '["un nom", "un adjectif", "un adverbe", "un verbe"]', 2,
    '"Rapidement" est un adverbe : il modifie le verbe "court" et indique comment il court.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Conjugaison', 'qcm', 'moyen',
    'À quel temps est conjugué le verbe dans « je mangeais » ?',
    '["à l''imparfait", "au passé composé", "au futur simple", "au présent"]', 0,
    '"Je mangeais" est à l''imparfait de l''indicatif. L''imparfait exprime une action passée qui dure ou se répète.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Expression écrite', 'qcm', 'difficile',
    'Choisissez la phrase correctement orthographiée :',
    '["Les élèves sont contentes de leurs résultat.", "Les élèves sont contentes de leurs résultats.", "Les élèves sont content de leurs résultats.", "Les élèves sont contente de leurs résultats."]', 1,
    '"Élèves" est féminin pluriel → "contentes" (accord adjectif). "Résultats" prend un s (pluriel).',
    25, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'qcm', 'difficile',
    'Dans « Le chat mange la souris », quel est le sujet du verbe « mange » ?',
    '["La souris", "mange", "Le chat", "la"]', 2,
    '"Le chat" est le sujet : c''est lui qui fait l''action de manger. On trouve le sujet en posant la question : "Qui est-ce qui mange ?"',
    20, 'published'
  );

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'vrai_faux', 'facile',
    'Les mots « contente » et « heureuse » sont des synonymes.',
    TRUE,
    'Vrai ! "Contente" et "heureuse" expriment le même sentiment de joie. Ce sont bien des synonymes.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Vocabulaire', 'vrai_faux', 'facile',
    'Un adjectif qualificatif sert à décrire ou préciser un nom.',
    TRUE,
    'Vrai ! L''adjectif qualificatif donne une qualité au nom : "une belle maison" (belle = adjectif qualifiant "maison").',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'francais'),
    'francais', 'Conjugaison', 'vrai_faux', 'moyen',
    'Au passé composé, le verbe « partir » se conjugue avec l''auxiliaire « avoir ».',
    FALSE,
    'Faux ! "Partir" se conjugue avec "être" : "je suis parti(e)". Les verbes de mouvement et les verbes pronominaux utilisent "être".',
    12, 'published'
  );

-- =============================================================
-- HISTOIRE — 10 questions
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Empires africains médiévaux', 'qcm', 'facile',
    'Qui a fondé l''Empire du Mali au XIIIe siècle après sa victoire à la bataille de Kirina ?',
    '["Kankou Moussa", "Soundiata Keïta", "Askia Mohamed", "Gaoussou Kouyaté"]', 1,
    'Soundiata Keïta fonda l''Empire du Mali vers 1235 après sa victoire sur Soumaoro Kanté. Son épopée est l''une des plus grandes de la tradition orale africaine.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Indépendances africaines', 'qcm', 'facile',
    'En quelle année le Sénégal a-t-il proclamé son indépendance ?',
    '["1958", "1960", "1962", "1945"]', 1,
    'Le Sénégal a proclamé son indépendance le 4 avril 1960. Cette date est célébrée chaque année comme fête nationale.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Histoire du Sénégal', 'qcm', 'moyen',
    'Lors de quelle bataille Lat Dior Ngoné Latyr Diop mourut-il en résistant à la colonisation française en 1886 ?',
    '["La bataille de Médine", "La bataille de Dekhele", "La bataille de Casamance", "La bataille de Saint-Louis"]', 1,
    'Lat Dior mourut à Dekhele le 26 octobre 1886. Il refusait que le chemin de fer colonise son royaume du Cayor.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Histoire du Sénégal', 'qcm', 'moyen',
    'Qui fut le premier président de la République du Sénégal ?',
    '["Léopold Sédar Senghor", "Abdou Diouf", "Abdoulaye Wade", "Mamadou Dia"]', 0,
    'Léopold Sédar Senghor (1906–2001) fut le premier président du Sénégal indépendant, de 1960 à 1980. Poète et co-fondateur du mouvement de la Négritude.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Empires africains médiévaux', 'qcm', 'moyen',
    'Quel grand souverain a dirigé l''Empire Songhaï à son apogée au XVIe siècle ?',
    '["Soundiata Keïta", "Kankou Moussa", "Askia Mohamed", "El Hadj Omar Tall"]', 2,
    'Askia Mohamed (vers 1493–1528) porta l''Empire Songhaï à son apogée. Il était aussi un grand lettré et fit le pèlerinage à La Mecque.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Empires africains médiévaux', 'qcm', 'difficile',
    'Kankou Moussa, roi du Mali, est surtout célèbre pour avoir accompli :',
    '["La conquête de l''Empire Ghana", "Un fastueux pèlerinage à La Mecque en 1324", "La fondation de la ville de Tombouctou", "La destruction de l''Empire Songhaï"]', 1,
    'En 1324, Kankou Moussa fit un pèlerinage à La Mecque avec 60 000 hommes et des tonnes d''or, marquant l''histoire du monde médiéval.',
    25, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Histoire du Sénégal', 'qcm', 'difficile',
    'Quelle ville fut la première capitale du Sénégal avant que Dakar ne prenne ce rôle en 1958 ?',
    '["Thiès", "Ziguinchor", "Saint-Louis", "Kaolack"]', 2,
    'Saint-Louis (Ndar en wolof), fondée vers 1659, fut la capitale du Sénégal et de l''AOF avant Dakar. Elle est classée au Patrimoine mondial de l''UNESCO.',
    25, 'published'
  );

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Histoire du Sénégal', 'vrai_faux', 'facile',
    'Dakar est la capitale du Sénégal depuis l''indépendance en 1960.',
    TRUE,
    'Vrai ! Dakar est devenue la capitale du Sénégal indépendant en 1960. Elle se trouve sur la presqu''île du Cap-Vert.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Histoire du Sénégal', 'vrai_faux', 'facile',
    'Le Sénégal est situé en Afrique de l''Ouest.',
    TRUE,
    'Vrai ! Le Sénégal est un pays d''Afrique de l''Ouest, bordé par l''océan Atlantique à l''ouest et entouré de Mauritanie, Mali, Guinée, Guinée-Bissau et Gambie.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'histoire'),
    'histoire', 'Traite négrière et colonisation', 'vrai_faux', 'moyen',
    'La colonisation française au Sénégal a débuté au XXe siècle (après 1900).',
    FALSE,
    'Faux ! La colonisation française au Sénégal a commencé au XIXe siècle. Saint-Louis fut fondée dès 1659. La conquête militaire s''intensifia vers 1850–1890.',
    12, 'published'
  );

-- =============================================================
-- GÉOGRAPHIE — 10 questions
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'qcm', 'facile',
    'Quel fleuve forme la frontière nord du Sénégal avec la Mauritanie ?',
    '["Le fleuve Gambie", "La Casamance", "Le fleuve Sénégal", "Le Sine"]', 2,
    'Le fleuve Sénégal (1 700 km) naît en Guinée et se jette dans l''Atlantique à Saint-Louis, formant la frontière nord du pays.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'qcm', 'facile',
    'Quelle est la capitale du Sénégal ?',
    '["Saint-Louis", "Thiès", "Dakar", "Ziguinchor"]', 2,
    'Dakar est la capitale et la plus grande ville du Sénégal. Située sur la presqu''île du Cap-Vert, c''est aussi le centre économique du pays.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'L''Afrique de l''Ouest', 'qcm', 'moyen',
    'Quelle est la capitale du Mali, pays voisin à l''est du Sénégal ?',
    '["Niamey", "Conakry", "Bamako", "Ouagadougou"]', 2,
    'Bamako est la capitale du Mali, située sur le fleuve Niger. Le Mali partage une longue frontière avec le Sénégal à l''est.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'qcm', 'moyen',
    'Combien de régions administratives compte le Sénégal depuis la réforme de 2008 ?',
    '["10", "12", "14", "16"]', 2,
    'Depuis 2008, le Sénégal est divisé en 14 régions : Dakar, Thiès, Saint-Louis, Diourbel, Fatick, Kaolack, Kaffrine, Louga, Tambacounda, Kédougou, Kolda, Sédhiou, Ziguinchor et Matam.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'L''Afrique de l''Ouest', 'qcm', 'moyen',
    'Lequel de ces pays ne partage PAS de frontière avec le Sénégal ?',
    '["La Mauritanie", "Le Nigeria", "La Guinée", "La Gambie"]', 1,
    'Le Nigeria est en Afrique de l''Ouest mais ne borde pas le Sénégal. Les voisins du Sénégal sont : Mauritanie, Mali, Guinée, Guinée-Bissau et Gambie.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'qcm', 'difficile',
    'Quelle île sénégalaise est classée au Patrimoine mondial de l''UNESCO et fut un centre majeur de la traite négrière ?',
    '["L''île de Carabane", "L''île aux Oiseaux", "L''île de Gorée", "L''île de Saint-Louis"]', 2,
    'L''île de Gorée (au large de Dakar) est classée par l''UNESCO depuis 1978. La Maison des Esclaves y symbolise la mémoire de la traite atlantique.',
    25, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'qcm', 'difficile',
    'Quel océan borde la côte ouest du Sénégal ?',
    '["L''océan Indien", "La mer Méditerranée", "L''océan Atlantique", "La mer Rouge"]', 2,
    'L''océan Atlantique borde toute la façade ouest du Sénégal sur environ 700 km, de Saint-Louis au nord à Ziguinchor au sud.',
    20, 'published'
  );

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'vrai_faux', 'facile',
    'La Gambie est un pays presque entièrement entouré par le Sénégal, sauf sur sa côte atlantique.',
    TRUE,
    'Vrai ! La Gambie est un micro-État allongé qui suit le cours du fleuve Gambie, entouré de toutes parts par le Sénégal sauf à l''ouest où elle ouvre sur l''Atlantique.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le Sénégal', 'vrai_faux', 'facile',
    'Le Sénégal est bordé par l''océan Atlantique à l''ouest.',
    TRUE,
    'Vrai ! La façade atlantique du Sénégal s''étend sur environ 700 km, des embouchures du fleuve Sénégal à la Casamance.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'geo'),
    'geo', 'Le monde', 'vrai_faux', 'moyen',
    'L''Afrique est le plus grand continent du monde.',
    FALSE,
    'Faux ! L''Asie est le plus grand continent (environ 44 millions de km²). L''Afrique est le deuxième (environ 30 millions de km²).',
    12, 'published'
  );

-- =============================================================
-- SCIENCES — 10 questions
-- =============================================================

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, choices, answer_index, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'qcm', 'facile',
    'Quel gaz les plantes rejettent-elles lors de la photosynthèse, indispensable à notre respiration ?',
    '["Le dioxyde de carbone (CO₂)", "L''azote (N₂)", "L''oxygène (O₂)", "La vapeur d''eau"]', 2,
    'Les plantes absorbent CO₂ + eau + lumière solaire et produisent glucose (leur nourriture) + oxygène (O₂) que nous respirons.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'qcm', 'facile',
    'À quelle classe d''animaux appartiennent les chauves-souris ?',
    '["Les oiseaux", "Les mammifères", "Les reptiles", "Les insectes"]', 1,
    'Les chauves-souris sont des mammifères : elles ont des poils, allaitent leurs petits et sont à sang chaud. Elles volent grâce à des ailes membraneuses, non des plumes.',
    10, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Corps humain', 'qcm', 'moyen',
    'Quel organe du corps humain filtre le sang et produit l''urine pour éliminer les déchets ?',
    '["Le foie", "Le cœur", "Les reins", "Les poumons"]', 2,
    'Les reins filtrent environ 180 litres de sang par jour et produisent 1 à 2 litres d''urine. Ils régulent aussi la pression artérielle.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'La matière', 'qcm', 'moyen',
    'À quelle température l''eau pure bout-elle au niveau de la mer (à pression atmosphérique normale) ?',
    '["0 °C", "50 °C", "100 °C", "120 °C"]', 2,
    'L''eau bout à 100 °C à pression atmosphérique normale. Elle gèle à 0 °C. En altitude, la pression diminue et l''eau bout à une température plus basse.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'qcm', 'moyen',
    'Combien de planètes compte notre système solaire depuis 2006 ?',
    '["7", "8", "9", "10"]', 1,
    'Depuis 2006, l''Union Astronomique Internationale a classé Pluton comme planète naine. Notre système solaire compte donc 8 planètes.',
    15, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Corps humain', 'qcm', 'difficile',
    'Quel est le plus grand organe du corps humain ?',
    '["Le foie", "Le cerveau", "La peau", "Les intestins"]', 2,
    'La peau est le plus grand organe du corps humain : environ 2 m² et 5 kg. Elle protège des microbes et des UV, régule la température et contient des millions de récepteurs tactiles.',
    25, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'qcm', 'difficile',
    'Quelle est la principale différence entre une cellule végétale et une cellule animale ?',
    '["La cellule végétale possède une paroi cellulaire et des chloroplastes", "La cellule végétale n''a pas de noyau", "La cellule animale fabrique sa propre nourriture", "La cellule végétale est plus petite"]', 0,
    'La cellule végétale possède une paroi rigide (cellulose) et des chloroplastes (pour la photosynthèse) que n''a pas la cellule animale.',
    25, 'published'
  );

INSERT INTO public.questions
  (subject_id, subject, theme, type, difficulty, enonce, answer_bool, explanation, xp, status)
VALUES
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'vrai_faux', 'facile',
    'Les plantes fabriquent leur propre nourriture grâce à la photosynthèse.',
    TRUE,
    'Vrai ! Grâce à la chlorophylle, les plantes utilisent la lumière du soleil, l''eau et le CO₂ pour produire du glucose (leur nourriture) et de l''oxygène.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Corps humain', 'vrai_faux', 'facile',
    'Le cœur est un muscle.',
    TRUE,
    'Vrai ! Le cœur est un muscle creux appelé myocarde. Il se contracte environ 60 à 100 fois par minute pour pomper le sang dans tout le corps.',
    8, 'published'
  ),
  (
    (SELECT id FROM public.subjects WHERE slug = 'sciences'),
    'sciences', 'Le monde du vivant', 'vrai_faux', 'moyen',
    'Les virus sont un type de bactérie.',
    FALSE,
    'Faux ! Les virus et les bactéries sont deux types de micro-organismes très différents. Les bactéries sont des cellules vivantes ; les virus ne sont pas des cellules et ne peuvent se reproduire qu''en infectant une cellule hôte.',
    12, 'published'
  );

-- =============================================================
-- VÉRIFICATION — comptage des questions insérées
-- =============================================================
SELECT
  subject,
  COUNT(*)                                            AS total,
  COUNT(*) FILTER (WHERE difficulty = 'facile')       AS facile,
  COUNT(*) FILTER (WHERE difficulty = 'moyen')        AS moyen,
  COUNT(*) FILTER (WHERE difficulty = 'difficile')    AS difficile
FROM public.questions
WHERE status = 'published'
GROUP BY subject
ORDER BY subject;

SELECT COUNT(*) AS total_questions FROM public.questions WHERE status = 'published';
-- Résultat attendu : 5 matières × 10 questions = 50 total
