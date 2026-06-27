-- B-25 Multi-Mandant, Inkrement 1: Schreibrechte fuer Konto-Admins.
-- Modell: user_id = Konto-/Mandanten-ID (= Owner). Lesen = has_account_access
-- (jedes Mitglied), Schreiben = has_admin_access (Owner ODER Admin). Member bleiben
-- Nur-Ansicht. Rueckwaertskompatibel: fuer den Owner ist user_id = auth.uid().

-- Helper: hier nochmals sicherstellen (aus B-30 vorhanden).
-- has_account_access(owner) / has_admin_access(owner) existieren bereits.

-- abos
drop policy if exists "Eigene Abos anlegen" on public.abos;
drop policy if exists "Eigene Abos aendern" on public.abos;
drop policy if exists "Eigene Abos loeschen" on public.abos;
create policy "Konto-Abos anlegen" on public.abos for insert with check (has_admin_access(user_id));
create policy "Konto-Abos aendern" on public.abos for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Abos loeschen" on public.abos for delete using (has_admin_access(user_id));

-- kunden
drop policy if exists "Eigene Kunden anlegen" on public.kunden;
drop policy if exists "Eigene Kunden aendern" on public.kunden;
drop policy if exists "Eigene Kunden loeschen" on public.kunden;
create policy "Konto-Kunden anlegen" on public.kunden for insert with check (has_admin_access(user_id));
create policy "Konto-Kunden aendern" on public.kunden for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Kunden loeschen" on public.kunden for delete using (has_admin_access(user_id));

-- zahlungskanaele
drop policy if exists "Eigene Kanaele anlegen" on public.zahlungskanaele;
drop policy if exists "Eigene Kanaele aendern" on public.zahlungskanaele;
drop policy if exists "Eigene Kanaele loeschen" on public.zahlungskanaele;
create policy "Konto-Kanaele anlegen" on public.zahlungskanaele for insert with check (has_admin_access(user_id));
create policy "Konto-Kanaele aendern" on public.zahlungskanaele for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Kanaele loeschen" on public.zahlungskanaele for delete using (has_admin_access(user_id));

-- unternehmen (kein delete)
drop policy if exists "Eigenes Unternehmen anlegen" on public.unternehmen;
drop policy if exists "Eigenes Unternehmen aendern" on public.unternehmen;
create policy "Konto-Unternehmen anlegen" on public.unternehmen for insert with check (has_admin_access(user_id));
create policy "Konto-Unternehmen aendern" on public.unternehmen for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));

-- frist_quittungen
drop policy if exists "Eigene Quittungen anlegen" on public.frist_quittungen;
drop policy if exists "Eigene Quittungen aendern" on public.frist_quittungen;
drop policy if exists "Eigene Quittungen loeschen" on public.frist_quittungen;
create policy "Konto-Quittungen anlegen" on public.frist_quittungen for insert with check (has_admin_access(user_id));
create policy "Konto-Quittungen aendern" on public.frist_quittungen for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Quittungen loeschen" on public.frist_quittungen for delete using (has_admin_access(user_id));

-- personen
drop policy if exists "Personen anlegen" on public.personen;
drop policy if exists "Personen aendern" on public.personen;
drop policy if exists "Personen loeschen" on public.personen;
create policy "Konto-Personen anlegen" on public.personen for insert with check (has_admin_access(user_id));
create policy "Konto-Personen aendern" on public.personen for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Personen loeschen" on public.personen for delete using (has_admin_access(user_id));

-- tool_zugang
drop policy if exists "Zugaenge anlegen" on public.tool_zugang;
drop policy if exists "Zugaenge aendern" on public.tool_zugang;
drop policy if exists "Zugaenge loeschen" on public.tool_zugang;
create policy "Konto-Zugaenge anlegen" on public.tool_zugang for insert with check (has_admin_access(user_id));
create policy "Konto-Zugaenge aendern" on public.tool_zugang for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Zugaenge loeschen" on public.tool_zugang for delete using (has_admin_access(user_id));

-- freigabe_antrag
drop policy if exists "Antraege anlegen" on public.freigabe_antrag;
drop policy if exists "Antraege aendern" on public.freigabe_antrag;
drop policy if exists "Antraege loeschen" on public.freigabe_antrag;
create policy "Konto-Antraege anlegen" on public.freigabe_antrag for insert with check (has_admin_access(user_id));
create policy "Konto-Antraege aendern" on public.freigabe_antrag for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Antraege loeschen" on public.freigabe_antrag for delete using (has_admin_access(user_id));

-- ai_services
drop policy if exists "AI-Dienste anlegen" on public.ai_services;
drop policy if exists "AI-Dienste aendern" on public.ai_services;
drop policy if exists "AI-Dienste loeschen" on public.ai_services;
create policy "Konto-AI-Dienste anlegen" on public.ai_services for insert with check (has_admin_access(user_id));
create policy "Konto-AI-Dienste aendern" on public.ai_services for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-AI-Dienste loeschen" on public.ai_services for delete using (has_admin_access(user_id));

-- ai_spend
drop policy if exists "AI-Spend anlegen" on public.ai_spend;
drop policy if exists "AI-Spend aendern" on public.ai_spend;
drop policy if exists "AI-Spend loeschen" on public.ai_spend;
create policy "Konto-AI-Spend anlegen" on public.ai_spend for insert with check (has_admin_access(user_id));
create policy "Konto-AI-Spend aendern" on public.ai_spend for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-AI-Spend loeschen" on public.ai_spend for delete using (has_admin_access(user_id));

-- dokumente: Lesen auf Konto erweitern, Schreiben Admin
drop policy if exists "Eigene Dok-Meta lesen" on public.dokumente;
drop policy if exists "Eigene Dok-Meta anlegen" on public.dokumente;
drop policy if exists "Eigene Dok-Meta aendern" on public.dokumente;
drop policy if exists "Eigene Dok-Meta loeschen" on public.dokumente;
create policy "Konto-Dok-Meta lesen" on public.dokumente for select using (has_account_access(user_id));
create policy "Konto-Dok-Meta anlegen" on public.dokumente for insert with check (has_admin_access(user_id));
create policy "Konto-Dok-Meta aendern" on public.dokumente for update using (has_admin_access(user_id)) with check (has_admin_access(user_id));
create policy "Konto-Dok-Meta loeschen" on public.dokumente for delete using (has_admin_access(user_id));
