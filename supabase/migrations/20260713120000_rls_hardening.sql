-- Durcissement RLS : active la sécurité niveau ligne sur les 3 tables qui ne l'avaient
-- pas (préférences de notification, abonnements push, souscriptions). Accès limité au
-- propriétaire (profile_id = auth.uid()) ou aux admins. L'application écrit via le client
-- service-role (qui contourne RLS) : ces policies ne changent donc pas son comportement,
-- elles ferment l'accès direct anon/authenticated (défense en profondeur).

alter table public.notification_preferences enable row level security;
drop policy if exists "notification_preferences_self" on public.notification_preferences;
create policy "notification_preferences_self"
on public.notification_preferences
for all
to authenticated
using (profile_id = auth.uid() or public.is_admin_role())
with check (profile_id = auth.uid() or public.is_admin_role());

alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_self" on public.push_subscriptions;
create policy "push_subscriptions_self"
on public.push_subscriptions
for all
to authenticated
using (profile_id = auth.uid() or public.is_admin_role())
with check (profile_id = auth.uid() or public.is_admin_role());

alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_self_read" on public.subscriptions;
create policy "subscriptions_self_read"
on public.subscriptions
for select
to authenticated
using (profile_id = auth.uid() or public.is_admin_role());

drop policy if exists "subscriptions_admin_write" on public.subscriptions;
create policy "subscriptions_admin_write"
on public.subscriptions
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());
