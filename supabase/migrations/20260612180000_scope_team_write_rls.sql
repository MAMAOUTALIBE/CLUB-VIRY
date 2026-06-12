-- Durcissement RLS (revue securite espace educateur).
--
-- Probleme : les policies d'ecriture matches_staff_write et team_players_staff_write
-- autorisaient FOR ALL a tout role {SUPER_ADMIN, ADMIN_CLUB, DIRIGEANT, EDUCATEUR}
-- SANS scoping a l'equipe de l'educateur. Comme un educateur detient un JWT Supabase
-- valide (login signInWithPassword), il pouvait ecrire en direct via PostgREST sur les
-- matchs / effectifs de N'IMPORTE QUELLE equipe, contournant le controle applicatif
-- (canManageTeam dans /api/educator/*).
--
-- Toutes les ecritures applicatives passent par le service role (getSupabaseAdminClient),
-- qui BYPASSE la RLS : aucun chemin app ne depend de l'ecriture directe par un educateur.
-- On restreint donc ces policies d'ecriture aux seuls roles d'administration. Les
-- educateurs continuent d'agir via /api/educator/* (scopé par canManageTeam).

drop policy if exists "team_players_staff_write" on public.team_players;
create policy "team_players_staff_write"
on public.team_players
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));

drop policy if exists "matches_staff_write" on public.matches;
create policy "matches_staff_write"
on public.matches
for all
to authenticated
using (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]))
with check (public.has_role(array['SUPER_ADMIN', 'ADMIN_CLUB', 'DIRIGEANT']::public.app_role[]));
