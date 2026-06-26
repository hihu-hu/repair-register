create table if not exists public.customer_repair_submissions (
  id text primary key,
  created_time text not null default '',
  device_number text not null default '',
  model text not null default '',
  company_name text not null default '',
  contact_name text not null default '',
  phone text not null default '',
  tracking_number text not null default '',
  customer_issue text not null default '',
  customer_address text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists customer_repair_submissions_created_time_idx
  on public.customer_repair_submissions (created_time desc);

create index if not exists customer_repair_submissions_device_number_idx
  on public.customer_repair_submissions (device_number);

alter table public.customer_repair_submissions enable row level security;

drop policy if exists "customer submissions are publicly insertable"
  on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly readable"
  on public.customer_repair_submissions;
drop policy if exists "only admin can read customer submissions"
  on public.customer_repair_submissions;
drop policy if exists "only admin can update customer submissions"
  on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly updatable"
  on public.customer_repair_submissions;
drop policy if exists "only admin can delete customer submissions"
  on public.customer_repair_submissions;

create policy "customer submissions are publicly insertable"
  on public.customer_repair_submissions
  for insert
  to anon, authenticated
  with check (true);

create policy "customer submissions are publicly readable"
  on public.customer_repair_submissions
  for select
  to anon, authenticated
  using (true);

create policy "customer submissions are publicly updatable"
  on public.customer_repair_submissions
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "only admin can delete customer submissions"
  on public.customer_repair_submissions
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = '1041852311@qq.com');
