create table if not exists public.repair_records (
  id text primary key,
  created_time text not null default '',
  tracking_number text not null default '',
  region text not null default '',
  area text not null default '',
  device_number text not null default '',
  has_power text not null default '',
  company_name text not null default '',
  customer_issue text not null default '',
  repair_process text not null default '',
  return_time text not null default '',
  final_status text not null default '',
  return_tracking_number text not null default '',
  fault_ownership text not null default '',
  fault_category text not null default '',
  accessory_parts text not null default '',
  customer_address text not null default '',
  model text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists repair_records_created_time_idx
  on public.repair_records (created_time desc);

alter table public.repair_records
  add column if not exists accessory_parts text not null default '';

alter table public.repair_records enable row level security;

drop policy if exists "repair records are publicly readable"
  on public.repair_records;
drop policy if exists "only admin can insert repair records"
  on public.repair_records;
drop policy if exists "only admin can update repair records"
  on public.repair_records;
drop policy if exists "only admin can delete repair records"
  on public.repair_records;

create policy "repair records are publicly readable"
  on public.repair_records
  for select
  to anon, authenticated
  using (true);

create policy "only admin can insert repair records"
  on public.repair_records
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can update repair records"
  on public.repair_records
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'))
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can delete repair records"
  on public.repair_records
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

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
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));
