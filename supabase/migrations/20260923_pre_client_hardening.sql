begin;

-- Keep repository migrations aligned with the production collection list.
alter table public.app_records
  drop constraint if exists app_records_collection_check;

alter table public.app_records
  add constraint app_records_collection_check
  check (collection in (
    'todos',
    'budgetAlarms',
    'agreements',
    'payments',
    'dailyWorkLogs',
    'brandAudits',
    'brandAuditSchemas',
    'contentPlans',
    'adsPlans',
    'clientAdsStrategies',
    'clientDailyReports',
    'weeklyReports',
    'monthlyReports',
    'quarterlyReports',
    'adminDailyReports',
    'notes'
  ));

-- Clients may read their financial records but must not create, alter or delete them.
-- Client-authored Daily Reports and shared Notes remain writable.
drop policy if exists records_insert on public.app_records;
drop policy if exists records_update on public.app_records;
drop policy if exists records_delete on public.app_records;

create policy records_insert on public.app_records for insert to authenticated
with check (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and (
      (collection = 'payments' and coalesce(data->>'category', 'media_buying_fees') = 'media_buying_fees')
      or (collection = 'notes' and data->>'authorRole' = 'client'
        and (data->>'authorId' is null or data->>'authorId' = (select auth.uid())::text))
      or collection = 'clientDailyReports'
    )
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
    and (
      (collection = 'payments' and coalesce(data->>'category', 'media_buying_fees') = 'media_buying_fees')
      or (collection = 'notes' and data->>'authorRole' = 'client'
        and (data->>'authorId' is null or data->>'authorId' = (select auth.uid())::text))
      or collection = 'clientDailyReports'
    )
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
)
with check (
  (select app_private.is_admin())
  or (client_id is not null and (select app_private.is_assigned_client(client_id)))
  or (
    client_id = (select app_private.own_client_id())
    and (
      (collection = 'payments' and coalesce(data->>'category', 'media_buying_fees') = 'media_buying_fees')
      or (collection = 'notes' and data->>'authorRole' = 'client'
        and (data->>'authorId' is null or data->>'authorId' = (select auth.uid())::text))
      or collection = 'clientDailyReports'
    )
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
    and (
      (collection = 'payments' and coalesce(data->>'category', 'media_buying_fees') = 'media_buying_fees')
      or (collection = 'notes' and data->>'authorRole' = 'client'
        and (data->>'authorId' is null or data->>'authorId' = (select auth.uid())::text))
      or collection = 'clientDailyReports'
    )
    and data->>'clientId' = client_id
  )
  or (collection = 'todos' and client_id is null and (select app_private.is_staff()))
);

commit;
