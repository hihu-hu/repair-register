-- 在 Supabase SQL Editor 运行一次。
-- 暂停“确认收货满 14 小时后自动进入检测中”。

select cron.unschedule(jobid)
from cron.job
where jobname = 'auto-start-repair-detection-after-14h';
