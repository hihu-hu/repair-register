begin;

create sequence if not exists public.repair_record_number_seq;
create sequence if not exists public.customer_submission_number_seq;

alter table public.repair_records
  add column if not exists record_number bigint;

alter table public.repair_records
  add column if not exists submission_id text;

alter table public.customer_repair_submissions
  add column if not exists submission_number bigint;

with numbered as (
  select
    id,
    row_number() over (order by created_time, updated_at, id)
      + (select coalesce(max(record_number), 0) from public.repair_records) as next_number
  from public.repair_records
  where record_number is null
)
update public.repair_records as target
set record_number = numbered.next_number
from numbered
where target.id = numbered.id;

with numbered as (
  select
    id,
    row_number() over (order by created_time, updated_at, id)
      + (select coalesce(max(submission_number), 0) from public.customer_repair_submissions) as next_number
  from public.customer_repair_submissions
  where submission_number is null
)
update public.customer_repair_submissions as target
set submission_number = numbered.next_number
from numbered
where target.id = numbered.id;

update public.repair_records
set submission_id = null
where submission_id = '';

-- 历史资料只补 A/B 编号，不自动关联，避免同一台机器多次维修时配错记录。

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

create unique index if not exists repair_records_submission_id_uidx
  on public.repair_records (submission_id)
  where submission_id is not null;

create index if not exists repair_records_submission_id_idx
  on public.repair_records (submission_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'repair_records_submission_id_fkey'
      and conrelid = 'public.repair_records'::regclass
  ) then
    alter table public.repair_records
      add constraint repair_records_submission_id_fkey
      foreign key (submission_id)
      references public.customer_repair_submissions (id)
      on delete set null;
  end if;
end
$$;

grant usage, select on sequence public.repair_record_number_seq
  to anon, authenticated;

grant usage, select on sequence public.customer_submission_number_seq
  to anon, authenticated;

commit;
