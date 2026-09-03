-- Suppression définitive de l'équipe féminine et de son planning.
-- Les contenus éditoriaux non rattachés à cette équipe sont conservés.

begin;

create temporary table removed_feminine_teams on commit drop as
select id, category_id
from public.teams
where slug = 'feminines';

create temporary table removed_feminine_categories on commit drop as
select id
from public.categories
where name in ('FÉMININES', 'Féminines', 'Feminines')
union
select category_id
from removed_feminine_teams
where category_id is not null;

create temporary table removed_feminine_only_passes on commit drop as
select link.pass_id
from public.family_media_pass_teams as link
group by link.pass_id
having bool_and(link.team_id in (select id from removed_feminine_teams));

delete from public.family_media_passes
where id in (select pass_id from removed_feminine_only_passes);

delete from public.family_media_pass_teams
where team_id in (select id from removed_feminine_teams);

delete from public.club_events
where team_id in (select id from removed_feminine_teams)
   or category_id in (select id from removed_feminine_categories);

delete from public.matches
where team_id in (select id from removed_feminine_teams)
   or category_id in (select id from removed_feminine_categories);

delete from public.teams
where id in (select id from removed_feminine_teams);

delete from public.categories
where id in (select id from removed_feminine_categories);

update public.site_settings
set value = replace(value::text, ', féminines', '')::jsonb
where key = 'organigramme';

-- Ancien planning statique, déjà remplacé par les événements du calendrier CRM.
delete from public.site_settings
where key = 'home_sports';

commit;
