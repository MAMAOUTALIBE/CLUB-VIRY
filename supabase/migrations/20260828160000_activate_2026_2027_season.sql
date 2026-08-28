-- La saison active pilote les inscriptions publiques et les nouveaux dossiers CRM.
update public.seasons
set is_active = false
where is_active = true
  and name <> '2026 / 2027';

insert into public.seasons (name, starts_on, ends_on, is_active)
values ('2026 / 2027', '2026-07-01', '2027-06-30', true)
on conflict (name) do update
set starts_on = excluded.starts_on,
    ends_on = excluded.ends_on,
    is_active = true,
    deleted_at = null,
    deleted_by = null;
