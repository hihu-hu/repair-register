-- 在 Supabase SQL Editor 运行一次。
-- 已收货满 14 小时后，如果仍未开始检测，数据库会自动进入“检测中”。

create extension if not exists pg_cron with schema extensions;

create or replace function public.auto_start_overdue_detection()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  started_count integer;
begin
  insert into public.repair_progress_events (
    submission_id,
    step_index,
    occurred_at,
    updated_at
  )
  select
    received.submission_id,
    3,
    received.occurred_at + interval '14 hours',
    now()
  from public.repair_progress_events as received
  where received.step_index = 2
    and received.occurred_at <= now() - interval '14 hours'
    and not exists (
      select 1
      from public.repair_progress_events as later
      where later.submission_id = received.submission_id
        and later.step_index >= 3
    )
  on conflict (submission_id, step_index) do nothing;

  get diagnostics started_count = row_count;
  return started_count;
end;
$$;

revoke all on function public.auto_start_overdue_detection() from public;

select cron.unschedule(jobid)
from cron.job
where jobname = 'auto-start-repair-detection-after-14h';

select cron.schedule(
  'auto-start-repair-detection-after-14h',
  '* * * * *',
  $$select public.auto_start_overdue_detection();$$
);
