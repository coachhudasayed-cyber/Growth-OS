drop policy if exists records_read on public.app_records;
drop policy if exists records_insert on public.app_records;
drop policy if exists records_update on public.app_records;
drop policy if exists records_delete on public.app_records;
drop policy if exists records_staff_todos_read on public.app_records;
drop policy if exists records_staff_todos_insert on public.app_records;
drop policy if exists records_staff_todos_update on public.app_records;
drop policy if exists records_staff_todos_delete on public.app_records;
drop policy if exists records_client_insert on public.app_records;
drop policy if exists records_client_update on public.app_records;
drop policy if exists records_client_delete on public.app_records;

create policy records_read on public.app_records for select to authenticated
using (
  (select app_private.is_admin())
  or (client_id is not null and (
    client_id = (select app_private.own_client_id())
    or (select app_private.is_assigned_client(client_id))
  ))
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
);

create policy records_insert on public.app_records for insert to authenticated
with check (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and collection in ('payments', 'clientDailyReports', 'notes')
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
);

create policy records_update on public.app_records for update to authenticated
using (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and collection in ('payments', 'clientDailyReports', 'notes')
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
)
with check (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and collection in ('payments', 'clientDailyReports', 'notes')
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
);

create policy records_delete on public.app_records for delete to authenticated
using (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and collection in ('payments', 'clientDailyReports', 'notes')
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
);

create index if not exists profiles_client_id_idx on public.profiles(client_id);
