create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'daily-wecom-repair-stats-0930-cn';

select cron.schedule(
  'daily-wecom-repair-stats-0930-cn',
  '30 1 * * *',
  $$
  select net.http_post(
    url := 'https://olvkyqmlbpqzffypabzj.supabase.co/functions/v1/push-repair-stats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '填写 Supabase secret 里的 WECOM_PUSH_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
