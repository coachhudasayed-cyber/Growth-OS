create policy records_client_insert on public.app_records
for insert to authenticated
with check (
  collection in ('clientDailyReports', 'notes')
  and client_id = (select app_private.own_client_id())
  and data->>'clientId' = client_id
);

create policy records_client_update on public.app_records
for update to authenticated
using (
  collection in ('clientDailyReports', 'notes')
  and client_id = (select app_private.own_client_id())
  and data->>'clientId' = client_id
)
with check (
  collection in ('clientDailyReports', 'notes')
  and client_id = (select app_private.own_client_id())
  and data->>'clientId' = client_id
);

create policy records_client_delete on public.app_records
for delete to authenticated
using (
  collection in ('clientDailyReports', 'notes')
  and client_id = (select app_private.own_client_id())
  and data->>'clientId' = client_id
);
