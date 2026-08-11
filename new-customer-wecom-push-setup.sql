-- 只需要在 Supabase 的 SQL Editor 运行一次。
-- 这个字段用来记住某条客户登记是否已经推送过，防止企微收到重复消息。

alter table public.customer_repair_submissions
  add column if not exists wecom_notified_at timestamptz;

comment on column public.customer_repair_submissions.wecom_notified_at
  is '新客户登记成功推送到企业微信的时间';
