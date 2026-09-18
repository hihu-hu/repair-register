-- 服务中心账号：只允许读取维修记录、客户提交和维修进度，不能新增、修改或删除。
-- 这个账号在 Supabase Auth 里的内部邮箱是：1041852311+fuwuzhongxin@qq.com

begin;

-- 清理早期版本里允许访客读取的旧策略，避免新旧策略同时存在时“只读账号”失效。
drop policy if exists "repair records are publicly readable" on public.repair_records;
drop policy if exists "customer submissions are publicly readable" on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly insertable" on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly updatable" on public.customer_repair_submissions;
drop policy if exists "repair progress is publicly readable" on public.repair_progress_events;

drop policy if exists "only admin can read repair records" on public.repair_records;
create policy "only admin or service center can read repair records"
  on public.repair_records
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com',
    '1041852311+fuwuzhongxin@qq.com'
  ));

drop policy if exists "only admin can read customer submissions" on public.customer_repair_submissions;
create policy "only admin or service center can read customer submissions"
  on public.customer_repair_submissions
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com',
    '1041852311+fuwuzhongxin@qq.com'
  ));

drop policy if exists "only admin can read repair progress" on public.repair_progress_events;
create policy "only admin or service center can read repair progress"
  on public.repair_progress_events
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com',
    '1041852311+fuwuzhongxin@qq.com'
  ));

commit;
