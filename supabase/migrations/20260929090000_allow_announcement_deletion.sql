grant delete on public.announcements to authenticated;

drop policy if exists "admins can delete announcements" on public.announcements;
create policy "admins can delete announcements"
  on public.announcements for delete to authenticated
  using ((auth.jwt() ->> 'email') in (
    '1041852311@qq.com',
    '1041852311+cccc@qq.com'
  ));
