create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin','employee','client')),
  client_id text,
  created_at timestamptz not null default now()
);
create table if not exists public.clients (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.profiles add constraint profiles_client_id_fkey foreign key (client_id) references public.clients(id) on delete set null;
create table if not exists public.app_records (
  collection text not null,
  record_id text not null,
  client_id text references public.clients(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, record_id),
  constraint app_records_collection_check check (collection in (
    'todos','budgetAlarms','agreements','payments','dailyWorkLogs',
    'brandAudits','contentPlans','adsPlans','clientAdsStrategies',
    'clientDailyReports','weeklyReports','monthlyReports',
    'quarterlyReports','adminDailyReports','notes'
  ))
);
create index if not exists app_records_client_id_idx on public.app_records(client_id);
create table if not exists public.bootstrap_tokens (
  email text primary key,
  token_hash text not null,
  used_at timestamptz,
  expires_at timestamptz not null
);
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role in ('admin','employee')
) $$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
) $$;
create or replace function public.own_client_id()
returns text language sql stable security definer set search_path = ''
as $$ select p.client_id from public.profiles p where p.id = (select auth.uid()) $$;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.app_records enable row level security;
alter table public.bootstrap_tokens enable row level security;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_staff()));
create policy clients_read on public.clients for select to authenticated
using ((select public.is_staff()) or id = (select public.own_client_id()));
create policy records_read on public.app_records for select to authenticated
using ((select public.is_staff()) or (client_id is not null and client_id = (select public.own_client_id())));
create policy records_insert on public.app_records for insert to authenticated
with check ((select public.is_staff()));
create policy records_update on public.app_records for update to authenticated
using ((select public.is_staff())) with check ((select public.is_staff()));
create policy records_delete on public.app_records for delete to authenticated
using ((select public.is_staff()));
grant usage on schema public to authenticated;
grant select on public.profiles, public.clients, public.app_records to authenticated;
grant insert, update, delete on public.app_records to authenticated;
revoke all on public.bootstrap_tokens from anon, authenticated;
grant execute on function public.is_staff(), public.is_admin(), public.own_client_id() to authenticated;
