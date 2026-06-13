-- SÉCURITÉ (CRITIQUE) — escalade de privilèges via l'inscription.
-- Le trigger handle_new_auth_user() recopiait `raw_user_meta_data ->> 'role'` (entièrement
-- contrôlé par l'appelant de Supabase Auth signUp) dans profiles.role avec status='ACTIVE'.
-- Un attaquant pouvait donc se créer un compte SUPER_ADMIN actif via l'API Auth publique.
--
-- Correctif : l'auto-attribution de rôle est limitée aux rôles d'inscription PUBLICS
-- (FAMILLE / JOUEUR / MEMBRE — cf. PUBLIC_REGISTRATION_ROLES). Tout autre rôle demandé est
-- forcé à MEMBRE. La promotion vers un rôle privilégié reste exclusivement réservée au
-- service role (routes admin /api/admin/users, avec garde anti-élévation).

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  safe_role public.app_role;
begin
  -- N'accepte QUE les rôles d'inscription publics ; sinon, MEMBRE par défaut.
  if requested_role in ('FAMILLE', 'JOUEUR', 'MEMBRE') then
    safe_role := requested_role::public.app_role;
  else
    safe_role := 'MEMBRE'::public.app_role;
  end if;

  insert into public.profiles (id, email, display_name, first_name, last_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    safe_role,
    'ACTIVE'::public.profile_status
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
exception
  when invalid_text_representation then
    insert into public.profiles (id, email, display_name, role, status)
    values (new.id, new.email, coalesce(new.email, 'Membre'), 'MEMBRE', 'ACTIVE')
    on conflict (id) do nothing;
    return new;
end;
$$;
