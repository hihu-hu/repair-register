begin;

create sequence if not exists public.repair_record_number_seq;
create sequence if not exists public.customer_submission_number_seq;

alter table public.repair_records
  add column if not exists record_number bigint;

alter table public.customer_repair_submissions
  add column if not exists submission_number bigint;

create or replace function public.parse_display_order_time(
  value text,
  fallback_value timestamptz
)
returns timestamptz
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  normalized_value text;
begin
  normalized_value := nullif(trim(value), '');
  if normalized_value is null then
    return fallback_value;
  end if;

  normalized_value := replace(
    replace(
      replace(
        replace(normalized_value, '年', '-'),
        '月',
        '-'
      ),
      '日',
      ''
    ),
    '/',
    '-'
  );

  if normalized_value ~* '(z|[+-][0-9]{2}:?[0-9]{2})$' then
    return normalized_value::timestamptz;
  end if;

  return normalized_value::timestamp at time zone 'Asia/Shanghai';
exception when others then
  return fallback_value;
end;
$$;

revoke all on function public.parse_display_order_time(text, timestamptz) from public;

lock table public.repair_records in share row exclusive mode;
lock table public.customer_repair_submissions in share row exclusive mode;

-- 临时负数保证已有唯一编号在重排过程中不会互相冲突。
with number_offset as (
  select coalesce(max(abs(record_number)), 0)::bigint as value
  from public.repair_records
), numbered as (
  select
    id,
    row_number() over (
      order by public.parse_display_order_time(created_time, updated_at), created_time, id
    )::bigint as next_number
  from public.repair_records
)
update public.repair_records as target
set record_number = -(number_offset.value + numbered.next_number)
from numbered
cross join number_offset
where target.id = numbered.id;

with numbered as (
  select
    id,
    row_number() over (
      order by public.parse_display_order_time(created_time, updated_at), created_time, id
    )::bigint as next_number
  from public.repair_records
)
update public.repair_records as target
set record_number = numbered.next_number
from numbered
where target.id = numbered.id;

with number_offset as (
  select coalesce(max(abs(submission_number)), 0)::bigint as value
  from public.customer_repair_submissions
), numbered as (
  select
    id,
    row_number() over (
      order by public.parse_display_order_time(created_time, updated_at), created_time, id
    )::bigint as next_number
  from public.customer_repair_submissions
)
update public.customer_repair_submissions as target
set submission_number = -(number_offset.value + numbered.next_number)
from numbered
cross join number_offset
where target.id = numbered.id;

with numbered as (
  select
    id,
    row_number() over (
      order by public.parse_display_order_time(created_time, updated_at), created_time, id
    )::bigint as next_number
  from public.customer_repair_submissions
)
update public.customer_repair_submissions as target
set submission_number = numbered.next_number
from numbered
where target.id = numbered.id;

select setval(
  'public.repair_record_number_seq',
  coalesce((select max(record_number) from public.repair_records), 0) + 1,
  false
);

select setval(
  'public.customer_submission_number_seq',
  coalesce((select max(submission_number) from public.customer_repair_submissions), 0) + 1,
  false
);

alter sequence public.repair_record_number_seq
  owned by public.repair_records.record_number;

alter sequence public.customer_submission_number_seq
  owned by public.customer_repair_submissions.submission_number;

alter table public.repair_records
  alter column record_number set default nextval('public.repair_record_number_seq'),
  alter column record_number set not null;

alter table public.customer_repair_submissions
  alter column submission_number set default nextval('public.customer_submission_number_seq'),
  alter column submission_number set not null;

create unique index if not exists repair_records_record_number_uidx
  on public.repair_records (record_number);

create unique index if not exists customer_submissions_submission_number_uidx
  on public.customer_repair_submissions (submission_number);

grant usage, select on sequence public.repair_record_number_seq
  to anon, authenticated;

grant usage, select on sequence public.customer_submission_number_seq
  to anon, authenticated;

commit;
