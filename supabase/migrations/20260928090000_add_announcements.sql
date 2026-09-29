-- 管理员发布内部消息，服务中心账号只可查看。
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists announcements_created_at_idx
  on public.announcements (created_at desc);

alter table public.announcements enable row level security;
grant select, insert, delete on public.announcements to authenticated;

drop policy if exists "staff can read announcements" on public.announcements;
create policy "staff can read announcements"
  on public.announcements for select to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com',
    '1041852311+fuwuzhongxin@qq.com'
  ));

drop policy if exists "admins can publish announcements" on public.announcements;
create policy "admins can publish announcements"
  on public.announcements for insert to authenticated
  with check ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com'
  ));

drop policy if exists "admins can delete announcements" on public.announcements;
create policy "admins can delete announcements"
  on public.announcements for delete to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com'
  ));
