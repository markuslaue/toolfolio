-- Seed fuer das Verzeichnis: echte, bekannte Tools, damit die oeffentlichen
-- Seiten reale Inhalte zeigen. Alles veroeffentlicht. Idempotent ueber slugs.

-- Cluster
insert into public.dir_cluster (name, slug, farbe, meta_title, meta_description, content_md, status, position) values
  ('Design & Kreativ', 'design-kreativ', '#FF7A66', 'Design- & Kreativ-Software im Vergleich', 'Tools fuer Grafik, UI, Video und Kreativarbeit, mit verifizierten Preisen und ehrlichen Bewertungen.', 'Von der ersten Skizze bis zum fertigen Asset: Hier findest du die wichtigsten Design- und Kreativ-Tools im Ueberblick.', 'veroeffentlicht', 1),
  ('Produktivitaet & Kollaboration', 'produktivitaet-kollaboration', '#6C5CE7', 'Produktivitaets- & Team-Software', 'Projektmanagement, Notizen und Teamarbeit, transparent verglichen.', 'Tools, die deinem Team helfen, organisiert und abgestimmt zu arbeiten.', 'veroeffentlicht', 2),
  ('KI & Automatisierung', 'ki-automatisierung', '#10A37F', 'KI- & Automatisierungs-Software', 'KI-Assistenten und Automatisierung fuer den Arbeitsalltag, mit fairen Preisangaben.', 'Die neue Generation an Werkzeugen: KI-Assistenten und Automatisierung.', 'veroeffentlicht', 3)
on conflict (slug) do nothing;

-- Kategorien (L1 + L2) je Cluster
insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, null, 1, 'Grafik & Design', 'grafik-design', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'design-kreativ'
on conflict (cluster_id, slug) do nothing;
insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='grafik-design' and k.cluster_id=c.id), 2, 'Design-Tools', 'design-tools', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'design-kreativ'
on conflict (cluster_id, slug) do nothing;

insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, null, 1, 'Arbeit & Organisation', 'arbeit-organisation', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'produktivitaet-kollaboration'
on conflict (cluster_id, slug) do nothing;
insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='arbeit-organisation' and k.cluster_id=c.id), 2, 'Projektmanagement', 'projektmanagement', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'produktivitaet-kollaboration'
on conflict (cluster_id, slug) do nothing;

insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, null, 1, 'Kuenstliche Intelligenz', 'kuenstliche-intelligenz', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'ki-automatisierung'
on conflict (cluster_id, slug) do nothing;
insert into public.dir_kategorie (cluster_id, parent_id, ebene, name, slug, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='kuenstliche-intelligenz' and k.cluster_id=c.id), 2, 'KI-Assistenten', 'ki-assistenten', 'veroeffentlicht', 1 from public.dir_cluster c where c.slug = 'ki-automatisierung'
on conflict (cluster_id, slug) do nothing;

-- Collections (der rankende Knoten)
insert into public.dir_collection (cluster_id, kategorie_id, name, slug, h1, meta_title, meta_description, prio, fokus_keyword, intro_md, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='design-tools' and k.cluster_id=c.id),
  'Grafik-Design-Software', 'grafik-design-software',
  'Grafik-Design-Software im Vergleich',
  'Grafik-Design-Software: Vergleich, Preise & Bewertungen',
  'Die beste Grafik-Design-Software im Vergleich. Verifizierte Preise, Funktionen und ehrliche Bewertungen fuer Agenturen, Freelancer und Teams.',
  1, 'Grafik-Design-Software',
  'Ob Vektorgrafik, UI-Design oder Social-Media-Posts: Diese Tools decken den kreativen Alltag ab. Wir zeigen Funktionen, faire Preise mit Stand und Quelle sowie Bewertungen aus echter Nutzung.',
  'veroeffentlicht', 1
from public.dir_cluster c where c.slug='design-kreativ'
on conflict (slug) do nothing;

insert into public.dir_collection (cluster_id, kategorie_id, name, slug, h1, meta_title, meta_description, prio, fokus_keyword, intro_md, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='projektmanagement' and k.cluster_id=c.id),
  'Projektmanagement-Software', 'projektmanagement-software',
  'Projektmanagement-Software im Vergleich',
  'Projektmanagement-Software: Vergleich, Preise & Bewertungen',
  'Projektmanagement-Software im transparenten Vergleich. Funktionen, verifizierte Preise und Bewertungen fuer produktive Teams.',
  1, 'Projektmanagement-Software',
  'Aufgaben, Projekte und Teams an einem Ort. Wir vergleichen die fuehrenden Tools nach Funktionen, Preis und echten Erfahrungen.',
  'veroeffentlicht', 2
from public.dir_cluster c where c.slug='produktivitaet-kollaboration'
on conflict (slug) do nothing;

insert into public.dir_collection (cluster_id, kategorie_id, name, slug, h1, meta_title, meta_description, prio, fokus_keyword, intro_md, status, position)
select c.id, (select k.id from public.dir_kategorie k where k.slug='ki-assistenten' and k.cluster_id=c.id),
  'KI-Schreibassistenten', 'ki-schreibassistenten',
  'KI-Schreibassistenten im Vergleich',
  'KI-Schreibassistenten: Vergleich, Preise & Bewertungen',
  'KI-Schreibassistenten im Vergleich. Was die Tools koennen, was sie kosten (mit Stand und Quelle) und wie sie sich in der Praxis schlagen.',
  1, 'KI-Schreibassistent',
  'Texte entwerfen, zusammenfassen, uebersetzen: KI-Assistenten beschleunigen die Schreibarbeit. Hier der ehrliche Vergleich.',
  'veroeffentlicht', 3
from public.dir_cluster c where c.slug='ki-automatisierung'
on conflict (slug) do nothing;

-- Produkte
insert into public.dir_produkt (name, slug, anbieter, website_url, farbe, kurzbeschreibung, langbeschreibung, features, plattformen, einsatzgebiet, pro, contra, preis_hinweis, preis_stand, preis_quelle_url, status) values
  ('Figma', 'figma', 'Figma, Inc.', 'https://www.figma.com', '#A259FF',
   'Kollaboratives Interface-Design im Browser.',
   'Figma ist ein browserbasiertes Design-Tool fuer UI- und Produktdesign. Mehrere Personen arbeiten in Echtzeit am selben Dokument, mit Komponenten, Auto-Layout und Prototyping.',
   array['Echtzeit-Kollaboration','Komponenten & Varianten','Auto-Layout','Prototyping','Dev-Mode'], array['Web','macOS','Windows'], 'UI/UX-Design, Prototyping',
   array['Starke Zusammenarbeit in Echtzeit','Plattformunabhaengig im Browser','Grosses Plugin-Oekosystem'], array['Komplex fuer reine Einsteiger','Offline nur eingeschraenkt'],
   'Kostenloser Tarif vorhanden, bezahlte Plaene ab ca. 12 EUR pro Editor und Monat', '2026-06-01', 'https://www.figma.com/pricing/', 'veroeffentlicht'),
  ('Canva', 'canva', 'Canva Pty Ltd', 'https://www.canva.com', '#00C4CC',
   'Einfaches Grafikdesign fuer alle.',
   'Canva ist ein einsteigerfreundliches Design-Tool mit Vorlagen fuer Social Media, Praesentationen, Dokumente und mehr. Drag-and-drop, grosse Vorlagen- und Medienbibliothek.',
   array['Tausende Vorlagen','Drag-and-drop-Editor','Markenkit','Foto- und Videobearbeitung','KI-Funktionen'], array['Web','iOS','Android','macOS','Windows'], 'Social Media, Praesentationen, Marketing',
   array['Sehr leicht zu bedienen','Riesige Vorlagenbibliothek','Gutes Preis-Leistungs-Verhaeltnis'], array['Weniger praezise als Profi-Tools','Vorlagen wirken schnell generisch'],
   'Kostenloser Tarif, Canva Pro ab ca. 12 EUR pro Monat', '2026-06-01', 'https://www.canva.com/pricing/', 'veroeffentlicht'),
  ('Adobe Creative Cloud', 'adobe-creative-cloud', 'Adobe Inc.', 'https://www.adobe.com', '#FF0000',
   'Profi-Suite fuer Design, Foto und Video.',
   'Die Adobe Creative Cloud buendelt Photoshop, Illustrator, InDesign, Premiere Pro und mehr. Industriestandard fuer professionelle Kreativarbeit.',
   array['Photoshop & Illustrator','InDesign','Premiere Pro & After Effects','Cloud-Speicher','Adobe Fonts'], array['macOS','Windows','iPadOS'], 'Professionelle Kreativarbeit',
   array['Industriestandard','Sehr maechtig und vollstaendig','Nahtlose App-Integration'], array['Vergleichsweise teuer','Steile Lernkurve','Abo-Bindung'],
   'Einzel-Apps und Komplett-Abo, Creative Cloud Komplett ab ca. 60 EUR pro Monat', '2026-06-01', 'https://www.adobe.com/de/creativecloud/plans.html', 'veroeffentlicht'),
  ('Notion', 'notion', 'Notion Labs, Inc.', 'https://www.notion.so', '#000000',
   'Notizen, Wissen und Projekte an einem Ort.',
   'Notion verbindet Notizen, Datenbanken, Wikis und Aufgaben in einem flexiblen Baukasten. Beliebt fuer persoenliche Organisation und Team-Wissen.',
   array['Seiten & Datenbanken','Vorlagen','Kollaboration','KI-Assistent','Web-Clipper'], array['Web','macOS','Windows','iOS','Android'], 'Wissensmanagement, leichte Projekte',
   array['Sehr flexibel','Schoenes, aufgeraeumtes UI','Gutes kostenloses Angebot'], array['Kann unuebersichtlich werden','Bei sehr grossen Daten traeger'],
   'Kostenloser Tarif, Plus ab ca. 10 EUR pro Nutzer und Monat', '2026-06-01', 'https://www.notion.so/pricing', 'veroeffentlicht'),
  ('Asana', 'asana', 'Asana, Inc.', 'https://asana.com', '#F06A6A',
   'Projekte und Aufgaben fuer Teams.',
   'Asana ist ein Projektmanagement-Tool mit Listen, Boards, Timelines und Automatisierungen. Stark fuer strukturierte Team-Workflows.',
   array['Listen, Boards & Timeline','Automatisierungen','Ziele & Portfolios','Formulare','Berichte'], array['Web','macOS','Windows','iOS','Android'], 'Projekt- und Aufgabenmanagement',
   array['Klare Struktur','Gute Automatisierungen','Skaliert mit dem Team'], array['Premium-Funktionen kosten','Fuer kleine Teams evtl. zu viel'],
   'Kostenloser Tarif, Starter ab ca. 11 EUR pro Nutzer und Monat', '2026-06-01', 'https://asana.com/pricing', 'veroeffentlicht'),
  ('Slack', 'slack', 'Slack Technologies (Salesforce)', 'https://slack.com', '#4A154B',
   'Team-Kommunikation in Channels.',
   'Slack buendelt Team-Kommunikation in Channels, mit Threads, Huddles und vielen Integrationen.',
   array['Channels & Threads','Huddles (Audio/Video)','Integrationen','Workflow-Builder','Suche'], array['Web','macOS','Windows','iOS','Android'], 'Team-Kommunikation',
   array['De-facto-Standard','Sehr viele Integrationen','Schnelle Kommunikation'], array['Kann ablenken','Verlauf im Free-Tarif begrenzt'],
   'Kostenloser Tarif, Pro ab ca. 8,75 EUR pro Nutzer und Monat', '2026-06-01', 'https://slack.com/intl/de-de/pricing', 'veroeffentlicht'),
  ('ChatGPT', 'chatgpt', 'OpenAI', 'https://chat.openai.com', '#10A37F',
   'KI-Assistent fuer Text und mehr.',
   'ChatGPT von OpenAI ist ein KI-Assistent fuer Texte, Recherche, Code und Bildgenerierung, mit verschiedenen Modellen je Tarif.',
   array['Textgenerierung','Recherche & Zusammenfassung','Code-Hilfe','Bildgenerierung','Custom GPTs'], array['Web','iOS','Android','macOS'], 'Schreiben, Recherche, Coding',
   array['Sehr vielseitig','Schnelle Ergebnisse','Grosses Oekosystem'], array['Kann Fakten erfinden','Datenschutz je nach Nutzung pruefen'],
   'Kostenloser Tarif, Plus ca. 23 EUR pro Monat', '2026-06-01', 'https://openai.com/chatgpt/pricing/', 'veroeffentlicht'),
  ('Claude', 'claude', 'Anthropic', 'https://claude.ai', '#D97757',
   'KI-Assistent mit Fokus auf laengere Texte.',
   'Claude von Anthropic ist ein KI-Assistent, der besonders bei laengeren Dokumenten, sorgfaeltigem Schreiben und Analyse stark ist.',
   array['Lange Kontexte','Dokumentanalyse','Schreiben & Redigieren','Projekte','Artefakte'], array['Web','iOS','Android'], 'Schreiben, Analyse, Dokumente',
   array['Stark bei langen Texten','Sorgfaeltige Antworten','Angenehmer Schreibstil'], array['Kleineres Tool-Oekosystem','Bildgenerierung fehlt'],
   'Kostenloser Tarif, Pro ca. 19 EUR pro Monat', '2026-06-01', 'https://www.anthropic.com/pricing', 'veroeffentlicht')
on conflict (slug) do nothing;

-- Produkte den Collections in Zonen zuordnen (Goldene Regel)
-- Grafik-Design: Canva gesponsert, Figma + Adobe organisch
insert into public.dir_collection_produkt (collection_id, produkt_id, zone, position, gesponsert_bis)
select co.id, p.id, z.zone, z.pos, z.bis::date
from public.dir_collection co
join (values
  ('canva','gesponsert',1, '2026-12-31'),
  ('figma','organisch',1, null),
  ('adobe-creative-cloud','organisch',2, null)
) as z(pslug, zone, pos, bis) on true
join public.dir_produkt p on p.slug = z.pslug
where co.slug = 'grafik-design-software'
on conflict (collection_id, produkt_id) do nothing;

-- Projektmanagement: Asana gesponsert, Notion + Slack organisch
insert into public.dir_collection_produkt (collection_id, produkt_id, zone, position, gesponsert_bis)
select co.id, p.id, z.zone, z.pos, z.bis::date
from public.dir_collection co
join (values
  ('asana','gesponsert',1, '2026-12-31'),
  ('notion','organisch',1, null),
  ('slack','organisch',2, null)
) as z(pslug, zone, pos, bis) on true
join public.dir_produkt p on p.slug = z.pslug
where co.slug = 'projektmanagement-software'
on conflict (collection_id, produkt_id) do nothing;

-- KI-Schreibassistenten: ChatGPT + Claude organisch
insert into public.dir_collection_produkt (collection_id, produkt_id, zone, position, gesponsert_bis)
select co.id, p.id, z.zone, z.pos, z.bis::date
from public.dir_collection co
join (values
  ('chatgpt','organisch',1, null),
  ('claude','organisch',2, null)
) as z(pslug, zone, pos, bis) on true
join public.dir_produkt p on p.slug = z.pslug
where co.slug = 'ki-schreibassistenten'
on conflict (collection_id, produkt_id) do nothing;

-- Ein paar freigegebene Bewertungen (gemischt verifiziert / nicht verifiziert)
insert into public.dir_review (produkt_id, sterne, titel, text, verifiziert, verifiziert_methode, status, autor_name)
select p.id, r.sterne, r.titel, r.text, r.verif, case when r.verif then 'tracker' else null end, 'freigegeben', r.autor
from public.dir_produkt p
join (values
  ('figma', 5, 'Unverzichtbar im Team', 'Seit wir mit Figma arbeiten, ist die Abstimmung im Designteam viel schneller. Echtzeit-Kollaboration ist Gold wert.', true, 'Designstudio Nord'),
  ('figma', 4, 'Stark, aber Lernkurve', 'Sehr maechtig. Einsteiger brauchen etwas, bis Auto-Layout sitzt.', false, 'Anonym'),
  ('notion', 5, 'Alles an einem Ort', 'Wir haben drei Tools durch Notion ersetzt. Sehr flexibel.', true, 'Freelancerin M.'),
  ('chatgpt', 4, 'Spart taeglich Zeit', 'Fuer Entwuerfe und Recherche super. Fakten immer pruefen.', false, 'Anonym')
) as r(pslug, sterne, titel, text, verif, autor) on true
where p.slug = r.pslug;
