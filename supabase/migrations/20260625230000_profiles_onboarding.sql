-- B-02: Onboarding. Merkt sich Segment und ob der Erststart abgeschlossen ist.
alter table public.profiles
  add column if not exists segment text
    check (segment is null or segment in ('solo', 'freelancer', 'agentur', 'unternehmen')),
  add column if not exists onboarded_at timestamptz;
