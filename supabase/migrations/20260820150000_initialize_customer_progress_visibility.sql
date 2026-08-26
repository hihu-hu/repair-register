begin;

alter table public.customer_repair_submissions
  add column if not exists progress_enabled boolean;

-- 上线时已有工单不向客户展示；尚未生成工单和以后新登记的记录允许展示。
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

commit;
