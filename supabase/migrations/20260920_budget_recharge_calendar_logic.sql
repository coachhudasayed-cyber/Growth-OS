-- A campaign that starts on day one and runs for N calendar days is recharged
-- on day N before midnight, so the stored end date is start + (N - 1).
create table if not exists app_private.budget_alarm_migration_backups (
  migration_name text not null,
  collection text not null,
  record_id text not null,
  data jsonb not null,
  backed_up_at timestamptz not null default now(),
  primary key (migration_name, collection, record_id)
);

insert into app_private.budget_alarm_migration_backups (
  migration_name,
  collection,
  record_id,
  data
)
select
  'budget_recharge_calendar_logic',
  collection,
  record_id,
  data
from public.app_records
where collection = 'budgetAlarms'
on conflict (migration_name, collection, record_id) do nothing;

with recalculated as (
  select
    collection,
    record_id,
    case
      when jsonb_typeof(data->'rechargeHistory') = 'array' then
        jsonb_set(
          jsonb_set(
            data,
            '{endDate}',
            to_jsonb(((data->>'startDate')::date + greatest((data->>'expectedDays')::int - 1, 0))::text),
            true
          ),
          '{rechargeHistory}',
          (
          select coalesce(
            jsonb_agg(
              jsonb_set(
                history_item,
                '{endDate}',
                to_jsonb(((history_item->>'startDate')::date + greatest((history_item->>'expectedDays')::int - 1, 0))::text),
                true
              )
              order by position
            ),
            '[]'::jsonb
          )
          from jsonb_array_elements(data->'rechargeHistory') with ordinality as history(history_item, position)
          ),
          true
        )
      else
        jsonb_set(
          data,
          '{endDate}',
          to_jsonb(((data->>'startDate')::date + greatest((data->>'expectedDays')::int - 1, 0))::text),
          true
        )
    end as corrected_data
  from public.app_records
  where collection = 'budgetAlarms'
    and data->>'startDate' ~ '^\d{4}-\d{2}-\d{2}$'
    and data->>'expectedDays' ~ '^\d+$'
)
update public.app_records as records
set data = recalculated.corrected_data,
    updated_at = now()
from recalculated
where records.collection = recalculated.collection
  and records.record_id = recalculated.record_id;
