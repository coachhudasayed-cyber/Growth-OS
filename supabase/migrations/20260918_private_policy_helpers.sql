create schema if not exists app_private;
grant usage on schema app_private to authenticated;
create or replace function app_private.is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role in ('admin','employee')
) $$;
create or replace function app_private.own_client_id()
returns text language sql stable security definer set search_path = ''
as $$ select p.client_id from public.profiles p where p.id = (select auth.uid()) $$;
revoke all on function app_private.is_staff(), app_private.own_client_id() from public, anon;
grant execute on function app_private.is_staff(), app_private.own_client_id() to authenticated;
drop policy if exists profiles_read on public.profiles;
drop policy if exists clients_read on public.clients;
drop policy if exists records_read on public.app_records;
drop policy if exists records_insert on public.app_records;
drop policy if exists records_update on public.app_records;
drop policy if exists records_delete on public.app_records;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select app_private.is_staff()));
create policy clients_read on public.clients for select to authenticated
using ((select app_private.is_staff()) or id = (select app_private.own_client_id()));
create policy records_read on public.app_records for select to authenticated
using ((select app_private.is_staff()) or (client_id is not null and client_id = (select app_private.own_client_id())));
create policy records_insert on public.app_records for insert to authenticated
with check ((select app_private.is_staff()));
create policy records_update on public.app_records for update to authenticated
using ((select app_private.is_staff())) with check ((select app_private.is_staff()));
create policy records_delete on public.app_records for delete to authenticated
using ((select app_private.is_staff()));
drop function if exists public.is_admin();
drop function if exists public.is_staff();
drop function if exists public.own_client_id();
