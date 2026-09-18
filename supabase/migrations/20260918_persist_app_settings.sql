create table public.app_settings (
  key text primary key,
  client_id text references public.clients(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint app_settings_scope_check check (
    (key = 'content_library_categories_v2' and client_id is null)
    or (key <> 'content_library_categories_v2' and client_id is not null)
  )
);
create index app_settings_client_id_idx on public.app_settings(client_id);
alter table public.app_settings enable row level security;

create policy settings_read on public.app_settings for select to authenticated
using (
  (select app_private.is_staff())
  or key = 'content_library_categories_v2'
  or (client_id is not null and client_id = (select app_private.own_client_id()))
);
create policy settings_insert on public.app_settings for insert to authenticated
with check ((select app_private.is_staff()));
create policy settings_update on public.app_settings for update to authenticated
using ((select app_private.is_staff())) with check ((select app_private.is_staff()));
create policy settings_delete on public.app_settings for delete to authenticated
using ((select app_private.is_staff()));

grant select, insert, update, delete on public.app_settings to authenticated;
