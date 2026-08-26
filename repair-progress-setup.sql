begin;

alter table public.customer_repair_submissions
  add column if not exists progress_enabled boolean;

-- 只在第一次启用进度功能时分类，之后生成工单不会关闭进度。
update public.customer_repair_submissions as submission
set progress_enabled = not exists (
  select 1
  from public.repair_records as record
  where record.submission_id = submission.id
)
where submission.progress_enabled is null;

alter table public.customer_repair_submissions
  alter column progress_enabled set default true,
  alter column progress_enabled set not null;

create table if not exists public.repair_progress_events (
  submission_id text not null,
  step_index smallint not null,
  occurred_at timestamptz not null,
  detail_text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (submission_id, step_index),
  constraint repair_progress_events_step_index_check
    check (step_index between 0 and 8),
  constraint repair_progress_events_submission_id_fkey
    foreign key (submission_id)
    references public.customer_repair_submissions (id)
    on delete cascade
);

alter table public.repair_progress_events
  add column if not exists detail_text text not null default '';

create index if not exists repair_progress_events_occurred_at_idx
  on public.repair_progress_events (occurred_at);

alter table public.repair_progress_events enable row level security;

drop policy if exists "repair progress is publicly readable"
  on public.repair_progress_events;
drop policy if exists "only admin can insert repair progress"
  on public.repair_progress_events;
drop policy if exists "only admin can update repair progress"
  on public.repair_progress_events;
drop policy if exists "only admin can delete repair progress"
  on public.repair_progress_events;

create policy "repair progress is publicly readable"
  on public.repair_progress_events
  for select
  to anon, authenticated
  using (true);

create policy "only admin can insert repair progress"
  on public.repair_progress_events
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can update repair progress"
  on public.repair_progress_events
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'))
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can delete repair progress"
  on public.repair_progress_events
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

grant select on public.repair_progress_events to anon, authenticated;
grant insert, update, delete on public.repair_progress_events to authenticated;

create or replace function public.parse_repair_progress_time(
  value text,
  fallback_value timestamptz
)
returns timestamptz
language plpgsql
stable
as $$
begin
  if nullif(trim(value), '') is null then
    return fallback_value;
  end if;

  if value ~* '(z|[+-]\d{2}:?\d{2})$' then
    return value::timestamptz;
  end if;

  return value::timestamp at time zone 'Asia/Shanghai';
exception when others then
  return fallback_value;
end;
$$;

revoke all on function public.parse_repair_progress_time(text, timestamptz) from public;

create or replace function public.confirm_repair_payment(
  p_submission_id text,
  p_occurred_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  detection_at timestamptz;
  paid_at timestamptz;
  next_at timestamptz;
  requested_at timestamptz;
  operation_mark text;
begin
  if nullif(trim(p_submission_id), '') is null then
    raise exception 'missing submission id';
  end if;

  select occurred_at
  into detection_at
  from public.repair_progress_events
  where submission_id = p_submission_id
    and step_index = 4;

  if detection_at is null then
    raise exception 'detection result is not ready';
  end if;

  select occurred_at
  into paid_at
  from public.repair_progress_events
  where submission_id = p_submission_id
    and step_index = 5;

  requested_at := case
    when p_occurred_at is not null
      and (auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com')
      then p_occurred_at
    else now()
  end;

  paid_at := coalesce(paid_at, requested_at);
  if paid_at < detection_at then
    raise exception 'payment time is earlier than detection result';
  end if;

  next_at := greatest(requested_at, paid_at);
  operation_mark := case
    when (auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com')
      then '__payment_admin__'
    else '__payment_customer__'
  end;

  insert into public.repair_progress_events (
    submission_id,
    step_index,
    occurred_at,
    detail_text,
    updated_at
  )
  values (p_submission_id, 5, paid_at, operation_mark, now())
  on conflict (submission_id, step_index) do update
    set detail_text = case
          when public.repair_progress_events.detail_text = '' then excluded.detail_text
          else public.repair_progress_events.detail_text
        end,
        updated_at = now();

  insert into public.repair_progress_events (
    submission_id,
    step_index,
    occurred_at
  )
  values (p_submission_id, 6, next_at)
  on conflict (submission_id, step_index) do nothing;

  return jsonb_build_object(
    'paid_at', paid_at,
    'next_at', next_at
  );
end;
$$;

revoke all on function public.confirm_repair_payment(text, timestamptz) from public;
grant execute on function public.confirm_repair_payment(text, timestamptz) to anon, authenticated;

create or replace function public.skip_repair(
  p_submission_id text,
  p_occurred_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  detection_at timestamptz;
  skipped_at timestamptz;
  operation_mark text;
begin
  if nullif(trim(p_submission_id), '') is null then
    raise exception 'missing submission id';
  end if;

  select occurred_at
  into detection_at
  from public.repair_progress_events
  where submission_id = p_submission_id
    and step_index = 4;

  if detection_at is null then
    raise exception 'detection result is not ready';
  end if;

  if exists (
    select 1
    from public.repair_progress_events
    where submission_id = p_submission_id
      and step_index >= 6
      and detail_text not like '__no_repair%'
  ) then
    raise exception 'repair progress has already continued';
  end if;

  skipped_at := case
    when p_occurred_at is not null
      and (auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com')
      then p_occurred_at
    else now()
  end;

  if skipped_at < detection_at then
    raise exception 'skip time is earlier than detection result';
  end if;

  operation_mark := case
    when (auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com')
      then '__no_repair_admin__'
    else '__no_repair_customer__'
  end;

  insert into public.repair_progress_events (
    submission_id,
    step_index,
    occurred_at,
    detail_text,
    updated_at
  )
  select
    p_submission_id,
    step_index,
    skipped_at,
    detail_text,
    now()
  from (values
    (5, operation_mark),
    (6, '__no_repair__'),
    (7, '__no_repair__')
  ) as skipped(step_index, detail_text)
  on conflict (submission_id, step_index) do update
    set occurred_at = excluded.occurred_at,
        detail_text = excluded.detail_text,
        updated_at = excluded.updated_at;

  return jsonb_build_object('skipped_at', skipped_at);
end;
$$;

revoke all on function public.skip_repair(text, timestamptz) from public;
grant execute on function public.skip_repair(text, timestamptz) to anon, authenticated;

create or replace function public.seed_customer_repair_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  submitted_at timestamptz;
begin
  submitted_at := public.parse_repair_progress_time(
    new.created_time,
    coalesce(new.updated_at, now())
  );

  insert into public.repair_progress_events (submission_id, step_index, occurred_at)
  values
    (new.id, 0, submitted_at),
    (new.id, 1, submitted_at)
  on conflict (submission_id, step_index) do nothing;

  return new;
end;
$$;

drop trigger if exists seed_customer_repair_progress_trigger
  on public.customer_repair_submissions;

create trigger seed_customer_repair_progress_trigger
after insert on public.customer_repair_submissions
for each row execute function public.seed_customer_repair_progress();

insert into public.repair_progress_events (submission_id, step_index, occurred_at)
select
  submission.id,
  step.step_index,
  public.parse_repair_progress_time(submission.created_time, submission.updated_at)
from public.customer_repair_submissions as submission
cross join (values (0), (1)) as step(step_index)
on conflict (submission_id, step_index) do nothing;

commit;
