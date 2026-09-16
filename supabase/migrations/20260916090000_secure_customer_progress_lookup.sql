begin;

create or replace function public.is_repair_admin()
returns boolean
language sql
stable
set search_path = pg_catalog
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'),
    false
  );
$$;

revoke all on function public.is_repair_admin() from public;

create or replace function public.customer_submission_json(
  value public.customer_repair_submissions
)
returns jsonb
language sql
stable
set search_path = pg_catalog
as $$
  select jsonb_build_object(
    'id', value.id,
    'submission_number', value.submission_number,
    'created_time', value.created_time,
    'device_number', value.device_number,
    'model', value.model,
    'company_name', value.company_name,
    'contact_name', value.contact_name,
    'phone', value.phone,
    'tracking_number', value.tracking_number,
    'customer_issue', value.customer_issue,
    'customer_address', value.customer_address,
    'progress_enabled', value.progress_enabled,
    'updated_at', value.updated_at
  );
$$;

revoke all on function public.customer_submission_json(public.customer_repair_submissions) from public;

create or replace function public.create_customer_repair_submission(
  p_device_number text,
  p_model text,
  p_company_name text,
  p_contact_name text,
  p_phone text,
  p_tracking_number text,
  p_customer_issue text,
  p_customer_address text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  saved public.customer_repair_submissions%rowtype;
  new_id text;
begin
  if trim(coalesce(p_device_number, '')) !~ '^[0-9]{10}$' then
    raise exception 'invalid device number';
  end if;
  if trim(coalesce(p_phone, '')) !~ '^[0-9]{11}$' then
    raise exception 'invalid phone';
  end if;
  if nullif(trim(coalesce(p_tracking_number, '')), '') is null
    or nullif(trim(coalesce(p_company_name, '')), '') is null
    or nullif(trim(coalesce(p_contact_name, '')), '') is null
    or nullif(trim(coalesce(p_customer_issue, '')), '') is null
    or nullif(trim(coalesce(p_customer_address, '')), '') is null then
    raise exception 'missing required field';
  end if;

  new_id := 'customer-'
    || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text
    || '-'
    || substr(md5(random()::text || clock_timestamp()::text), 1, 12);

  insert into public.customer_repair_submissions (
    id,
    created_time,
    device_number,
    model,
    company_name,
    contact_name,
    phone,
    tracking_number,
    customer_issue,
    customer_address,
    progress_enabled,
    updated_at
  ) values (
    new_id,
    to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    left(trim(p_device_number), 10),
    left(trim(coalesce(p_model, '')), 40),
    left(trim(p_company_name), 120),
    left(trim(p_contact_name), 60),
    trim(p_phone),
    left(trim(p_tracking_number), 120),
    left(trim(p_customer_issue), 1000),
    left(trim(p_customer_address), 300),
    true,
    now()
  )
  returning * into saved;

  return public.customer_submission_json(saved);
end;
$$;

revoke all on function public.create_customer_repair_submission(text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_customer_repair_submission(text, text, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.update_customer_repair_submission(
  p_submission_number bigint,
  p_current_phone text,
  p_device_number text,
  p_model text,
  p_company_name text,
  p_contact_name text,
  p_new_phone text,
  p_tracking_number text,
  p_customer_issue text,
  p_customer_address text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing public.customer_repair_submissions%rowtype;
  saved public.customer_repair_submissions%rowtype;
begin
  select *
  into existing
  from public.customer_repair_submissions
  where submission_number = p_submission_number
    and phone = trim(coalesce(p_current_phone, ''))
  limit 1;

  if not found then
    raise exception 'submission not found';
  end if;
  if exists (
    select 1
    from public.repair_records
    where submission_id = existing.id
      and final_status in ('已寄出', '邮寄并结束')
  ) then
    raise exception 'submission locked';
  end if;
  if trim(coalesce(p_device_number, '')) !~ '^[0-9]{10}$' then
    raise exception 'invalid device number';
  end if;
  if trim(coalesce(p_new_phone, '')) !~ '^[0-9]{11}$' then
    raise exception 'invalid phone';
  end if;
  if nullif(trim(coalesce(p_tracking_number, '')), '') is null
    or nullif(trim(coalesce(p_company_name, '')), '') is null
    or nullif(trim(coalesce(p_contact_name, '')), '') is null
    or nullif(trim(coalesce(p_customer_issue, '')), '') is null
    or nullif(trim(coalesce(p_customer_address, '')), '') is null then
    raise exception 'missing required field';
  end if;

  update public.customer_repair_submissions
  set device_number = left(trim(p_device_number), 10),
      model = left(trim(coalesce(p_model, '')), 40),
      company_name = left(trim(p_company_name), 120),
      contact_name = left(trim(p_contact_name), 60),
      phone = trim(p_new_phone),
      tracking_number = left(trim(p_tracking_number), 120),
      customer_issue = left(trim(p_customer_issue), 1000),
      customer_address = left(trim(p_customer_address), 300),
      updated_at = now()
  where id = existing.id
  returning * into saved;

  return public.customer_submission_json(saved);
end;
$$;

revoke all on function public.update_customer_repair_submission(bigint, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_customer_repair_submission(bigint, text, text, text, text, text, text, text, text, text) to anon, authenticated;

drop function if exists public.lookup_customer_repair_progress(bigint, text);

create or replace function public.lookup_customer_repair_progress(
  p_submission_number bigint,
  p_query_method text,
  p_query_value text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submission_row public.customer_repair_submissions%rowtype;
  repair_json jsonb;
  events_json jsonb;
begin
  select *
  into submission_row
  from public.customer_repair_submissions as submission
  where submission_number = p_submission_number
    and nullif(trim(coalesce(p_query_value, '')), '') is not null
    and case trim(coalesce(p_query_method, ''))
      when 'device_number' then trim(p_query_value) ~ '^[0-9]{10}$'
        and submission.device_number = trim(p_query_value)
      when 'tracking_number' then nullif(regexp_replace(p_query_value, '[^0-9]', '', 'g'), '') is not null
        and regexp_replace(submission.tracking_number, '[^0-9]', '', 'g') = regexp_replace(p_query_value, '[^0-9]', '', 'g')
      else false
    end
  limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  select jsonb_build_object(
    'id', record.id,
    'created_time', record.created_time,
    'final_status', record.final_status,
    'return_time', record.return_time,
    'return_tracking_number', record.return_tracking_number,
    'updated_at', record.updated_at,
    'accessory_parts', record.accessory_parts,
    'model', record.model,
    'region', record.region,
    'customer_address', record.customer_address
  )
  into repair_json
  from public.repair_records as record
  where record.submission_id = submission_row.id
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'submission_id', event.submission_id,
        'step_index', event.step_index,
        'occurred_at', event.occurred_at,
        'detail_text', event.detail_text,
        'updated_at', event.updated_at
      ) order by event.step_index
    ),
    '[]'::jsonb
  )
  into events_json
  from public.repair_progress_events as event
  where event.submission_id = submission_row.id;

  return jsonb_build_object(
    'found', true,
    'submission', public.customer_submission_json(submission_row),
    'record', repair_json,
    'events', events_json
  );
end;
$$;

revoke all on function public.lookup_customer_repair_progress(bigint, text, text) from public;
grant execute on function public.lookup_customer_repair_progress(bigint, text, text) to anon, authenticated;

drop function if exists public.confirm_customer_repair_payment(bigint, text);

create or replace function public.confirm_customer_repair_payment(
  p_submission_number bigint,
  p_query_method text,
  p_query_value text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submission_id text;
begin
  select id
  into submission_id
  from public.customer_repair_submissions as submission
  where submission_number = p_submission_number
    and nullif(trim(coalesce(p_query_value, '')), '') is not null
    and case trim(coalesce(p_query_method, ''))
      when 'device_number' then trim(p_query_value) ~ '^[0-9]{10}$'
        and submission.device_number = trim(p_query_value)
      when 'tracking_number' then nullif(regexp_replace(p_query_value, '[^0-9]', '', 'g'), '') is not null
        and regexp_replace(submission.tracking_number, '[^0-9]', '', 'g') = regexp_replace(p_query_value, '[^0-9]', '', 'g')
      else false
    end
    and progress_enabled = true
  limit 1;

  if submission_id is null then
    raise exception 'submission not found';
  end if;

  return public.confirm_repair_payment(submission_id, null);
end;
$$;

revoke all on function public.confirm_customer_repair_payment(bigint, text, text) from public;
grant execute on function public.confirm_customer_repair_payment(bigint, text, text) to anon, authenticated;

drop function if exists public.skip_customer_repair(bigint, text);

create or replace function public.skip_customer_repair(
  p_submission_number bigint,
  p_query_method text,
  p_query_value text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submission_id text;
  result jsonb;
begin
  select id
  into submission_id
  from public.customer_repair_submissions as submission
  where submission_number = p_submission_number
    and nullif(trim(coalesce(p_query_value, '')), '') is not null
    and case trim(coalesce(p_query_method, ''))
      when 'device_number' then trim(p_query_value) ~ '^[0-9]{10}$'
        and submission.device_number = trim(p_query_value)
      when 'tracking_number' then nullif(regexp_replace(p_query_value, '[^0-9]', '', 'g'), '') is not null
        and regexp_replace(submission.tracking_number, '[^0-9]', '', 'g') = regexp_replace(p_query_value, '[^0-9]', '', 'g')
      else false
    end
    and progress_enabled = true
  limit 1;

  if submission_id is null then
    raise exception 'submission not found';
  end if;

  result := public.skip_repair(submission_id, null);

  update public.customer_repair_submissions
  set customer_issue = case
        when customer_issue like '%' || E'客户选择：无需维修' || '%' then customer_issue
        when nullif(trim(customer_issue), '') is null then '客户选择：无需维修'
        else rtrim(customer_issue) || E'\n客户选择：无需维修'
      end,
      updated_at = now()
  where id = submission_id;

  return result;
end;
$$;

revoke all on function public.skip_customer_repair(bigint, text, text) from public;
grant execute on function public.skip_customer_repair(bigint, text, text) to anon, authenticated;

create or replace function public.admin_confirm_repair_payment(
  p_submission_id text,
  p_occurred_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_repair_admin() then
    raise exception 'admin required';
  end if;
  return public.confirm_repair_payment(p_submission_id, p_occurred_at);
end;
$$;

create or replace function public.admin_skip_repair(
  p_submission_id text,
  p_occurred_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_repair_admin() then
    raise exception 'admin required';
  end if;
  return public.skip_repair(p_submission_id, p_occurred_at);
end;
$$;

revoke all on function public.confirm_repair_payment(text, timestamptz) from public, anon, authenticated;
revoke all on function public.skip_repair(text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_confirm_repair_payment(text, timestamptz) from public, anon;
revoke all on function public.admin_skip_repair(text, timestamptz) from public, anon;
grant execute on function public.admin_confirm_repair_payment(text, timestamptz) to authenticated;
grant execute on function public.admin_skip_repair(text, timestamptz) to authenticated;

drop policy if exists "repair records are publicly readable" on public.repair_records;
drop policy if exists "only admin can read repair records" on public.repair_records;
create policy "only admin can read repair records"
  on public.repair_records
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

drop policy if exists "customer submissions are publicly insertable" on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly readable" on public.customer_repair_submissions;
drop policy if exists "customer submissions are publicly updatable" on public.customer_repair_submissions;
drop policy if exists "only admin can read customer submissions" on public.customer_repair_submissions;
drop policy if exists "only admin can insert customer submissions" on public.customer_repair_submissions;
drop policy if exists "only admin can update customer submissions" on public.customer_repair_submissions;

create policy "only admin can read customer submissions"
  on public.customer_repair_submissions
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can insert customer submissions"
  on public.customer_repair_submissions
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

create policy "only admin can update customer submissions"
  on public.customer_repair_submissions
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'))
  with check ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

drop policy if exists "repair progress is publicly readable" on public.repair_progress_events;
drop policy if exists "only admin can read repair progress" on public.repair_progress_events;
create policy "only admin can read repair progress"
  on public.repair_progress_events
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') in ('1041852311@qq.com', '1041852311+cccc@qq.com'));

revoke all on table public.repair_records from anon;
revoke all on table public.customer_repair_submissions from anon;
revoke all on table public.repair_progress_events from anon;
revoke usage, select on sequence public.customer_submission_number_seq from anon;

grant select, insert, update, delete on table public.repair_records to authenticated;
grant select, insert, update, delete on table public.customer_repair_submissions to authenticated;
grant select, insert, update, delete on table public.repair_progress_events to authenticated;
grant usage, select on sequence public.customer_submission_number_seq to authenticated;

commit;
