begin;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table if not exists app_private.accounting_record_backups (
  backup_id bigint generated always as identity primary key,
  migration_name text not null,
  backed_up_at timestamptz not null default now(),
  collection text not null,
  record_id text not null,
  client_id text,
  data jsonb not null,
  updated_at timestamptz,
  unique (migration_name, collection, record_id)
);

revoke all on table app_private.accounting_record_backups from public, anon, authenticated;

insert into app_private.accounting_record_backups (
  migration_name,
  collection,
  record_id,
  client_id,
  data,
  updated_at
)
select
  '20260920_reconcile_accounting_records',
  collection,
  record_id,
  client_id,
  data,
  updated_at
from public.app_records
where collection in ('payments', 'weeklyReports', 'monthlyReports', 'quarterlyReports', 'adsPlans')
on conflict (migration_name, collection, record_id) do nothing;

with normalized as (
  select
    collection,
    record_id,
    data,
    greatest(coalesce((data->>'amount')::numeric, 0), 0) as amount,
    least(
      greatest(coalesce((data->>'paidAmount')::numeric, 0), 0),
      greatest(coalesce((data->>'amount')::numeric, 0), 0)
    ) as partial_paid
  from public.app_records
  where collection = 'payments'
)
update public.app_records records
set
  data = records.data || jsonb_build_object(
    'paidAmount',
      case normalized.data->>'status'
        when 'paid' then normalized.amount
        when 'partial' then normalized.partial_paid
        else 0
      end,
    'remainingAmount',
      case normalized.data->>'status'
        when 'paid' then 0
        when 'partial' then normalized.amount - normalized.partial_paid
        else normalized.amount
      end,
    'category',
      case
        when nullif(normalized.data->>'category', '') is not null then normalized.data->>'category'
        when normalized.data ? 'agreementId' then 'media_buying_fees'
        else normalized.data->>'category'
      end
  ),
  updated_at = now()
from normalized
where records.collection = normalized.collection
  and records.record_id = normalized.record_id;

with report_metrics as (
  select
    collection,
    record_id,
    data,
    coalesce((data->>'totalSpent')::numeric, 0) as spend,
    coalesce((data->>'totalOrders')::numeric, 0) as orders,
    coalesce((data->>'totalRevenue')::numeric, 0) as revenue
  from public.app_records
  where collection in ('weeklyReports', 'monthlyReports', 'quarterlyReports')
), calculated as (
  select
    *,
    case when spend > 0 then round(revenue / spend, 2) else 0 end as roas,
    case when orders > 0 then round(spend / orders, 1) else null end as cpa,
    case when orders > 0 then round(revenue / orders, 1) else null end as aov
  from report_metrics
), prepared as (
  select
    *,
    case when cpa is null then '' else to_char(cpa, 'FM999999999990.0') || ' EGP' end as cpa_text,
    case when aov is null then '' else to_char(aov, 'FM999999999990.0') || ' EGP' end as aov_text,
    case collection
      when 'weeklyReports' then jsonb_build_object(
        'perf_spend', spend,
        'perf_orders', orders,
        'perf_revenue', revenue,
        'perf_roas', roas,
        'perf_cpa', case when cpa is null then '' else to_char(cpa, 'FM999999999990.0') || ' EGP' end,
        'perf_aov', case when aov is null then '' else to_char(aov, 'FM999999999990.0') || ' EGP' end
      )
      when 'monthlyReports' then jsonb_build_object(
        'm_perf_spend', spend,
        'm_perf_orders', orders,
        'm_perf_revenue', revenue,
        'm_perf_roas', roas,
        'm_perf_cpa', case when cpa is null then '' else to_char(cpa, 'FM999999999990.0') || ' EGP' end,
        'm_perf_aov', case when aov is null then '' else to_char(aov, 'FM999999999990.0') || ' EGP' end
      )
      else jsonb_build_object(
        'q_perf_spend', spend,
        'q_perf_orders', orders,
        'q_perf_revenue', revenue,
        'q_perf_roas', roas,
        'q_perf_cpa', case when cpa is null then '' else to_char(cpa, 'FM999999999990.0') || ' EGP' end,
        'q_perf_aov', case when aov is null then '' else to_char(aov, 'FM999999999990.0') || ' EGP' end
      )
    end as collection_metrics
  from calculated
)
update public.app_records records
set
  data = prepared.data
    || jsonb_build_object(
      'totalSpent', prepared.spend,
      'totalOrders', prepared.orders,
      'totalRevenue', prepared.revenue,
      'roas', prepared.roas,
      'cpa', prepared.cpa_text,
      'aov', prepared.aov_text,
      'customAnswers',
        coalesce(prepared.data->'customAnswers', '{}'::jsonb)
        || jsonb_build_object(
          'totalSpent', prepared.spend,
          'totalOrders', prepared.orders,
          'totalRevenue', prepared.revenue,
          'roas', prepared.roas,
          'cpa', prepared.cpa_text,
          'aov', prepared.aov_text
        )
        || prepared.collection_metrics,
      'questionsList',
        coalesce((
          select jsonb_agg(
            case question->>'standardKey'
              when 'totalSpent' then jsonb_set(question, '{answer}', to_jsonb(prepared.spend), true)
              when 'totalOrders' then jsonb_set(question, '{answer}', to_jsonb(prepared.orders), true)
              when 'totalRevenue' then jsonb_set(question, '{answer}', to_jsonb(prepared.revenue), true)
              when 'roas' then jsonb_set(question, '{answer}', to_jsonb(prepared.roas), true)
              when 'cpa' then jsonb_set(question, '{answer}', to_jsonb(prepared.cpa_text), true)
              when 'aov' then jsonb_set(question, '{answer}', to_jsonb(prepared.aov_text), true)
              else question
            end
            order by ordinal_position
          )
          from jsonb_array_elements(coalesce(prepared.data->'questionsList', '[]'::jsonb))
            with ordinality as items(question, ordinal_position)
        ), '[]'::jsonb)
    ),
  updated_at = now()
from prepared
where records.collection = prepared.collection
  and records.record_id = prepared.record_id;

with plan_budgets as (
  select
    collection,
    record_id,
    coalesce(sum(coalesce((campaign->>'campaignBudget')::numeric, 0)), 0) as campaign_total
  from public.app_records
  cross join lateral jsonb_array_elements(data->'campaigns') as campaign
  where collection = 'adsPlans'
    and jsonb_typeof(data->'campaigns') = 'array'
    and jsonb_array_length(data->'campaigns') > 0
  group by collection, record_id
)
update public.app_records records
set
  data = jsonb_set(
    jsonb_set(records.data, '{strategy,totalBudget}', to_jsonb(plan_budgets.campaign_total), true),
    '{campaignBudget}',
    to_jsonb(plan_budgets.campaign_total),
    true
  ),
  updated_at = now()
from plan_budgets
where records.collection = plan_budgets.collection
  and records.record_id = plan_budgets.record_id;

commit;
