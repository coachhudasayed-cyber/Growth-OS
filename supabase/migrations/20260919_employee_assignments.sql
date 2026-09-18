alter table public.profiles add column if not exists phone text not null default '';

create table if not exists public.employee_assignments (
  employee_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  compensation numeric(12, 2) not null check (compensation >= 0),
  created_at timestamptz not null default now(),
  primary key (employee_id, client_id)
);
create index if not exists employee_assignments_client_id_idx
  on public.employee_assignments (client_id);

create or replace function app_private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
) $$;

create or replace function app_private.is_assigned_client(target_client_id text)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.employee_assignments a
  join public.profiles p on p.id = a.employee_id
  where a.employee_id = (select auth.uid())
    and a.client_id = target_client_id and p.role = 'employee'
) $$;

revoke all on function app_private.is_admin(), app_private.is_assigned_client(text) from public, anon;
grant execute on function app_private.is_admin(), app_private.is_assigned_client(text) to authenticated;

alter table public.employee_assignments enable row level security;
grant select on public.employee_assignments to authenticated;
create policy employee_assignments_admin_read on public.employee_assignments
  for select to authenticated using ((select app_private.is_admin()));

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select app_private.is_admin()));

drop policy if exists clients_read on public.clients;
create policy clients_read on public.clients for select to authenticated
  using ((select app_private.is_admin())
    or id = (select app_private.own_client_id())
    or (select app_private.is_assigned_client(id)));

drop policy if exists records_read on public.app_records;
create policy records_read on public.app_records for select to authenticated
  using ((select app_private.is_admin())
    or (client_id is not null and
      (client_id = (select app_private.own_client_id())
       or (select app_private.is_assigned_client(client_id)))));

drop policy if exists records_insert on public.app_records;
create policy records_insert on public.app_records for insert to authenticated
  with check ((select app_private.is_admin())
    or (client_id is not null and (select app_private.is_assigned_client(client_id))));

drop policy if exists records_update on public.app_records;
create policy records_update on public.app_records for update to authenticated
  using ((select app_private.is_admin())
    or (client_id is not null and (select app_private.is_assigned_client(client_id))))
  with check ((select app_private.is_admin())
    or (client_id is not null and (select app_private.is_assigned_client(client_id))));

drop policy if exists records_delete on public.app_records;
create policy records_delete on public.app_records for delete to authenticated
  using ((select app_private.is_admin())
    or (client_id is not null and (select app_private.is_assigned_client(client_id))));
