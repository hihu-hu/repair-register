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
      and step_index >= 5
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
