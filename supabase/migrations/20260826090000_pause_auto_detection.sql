-- 暂停“确认收货满 14 小时后自动进入检测中”。
do $$
declare
  scheduled_job_id bigint;
begin
  for scheduled_job_id in
    select jobid
    from cron.job
    where jobname = 'auto-start-repair-detection-after-14h'
  loop
    perform cron.unschedule(scheduled_job_id);
  end loop;
end;
$$;
