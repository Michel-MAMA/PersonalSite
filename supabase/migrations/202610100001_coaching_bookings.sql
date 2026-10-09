create table if not exists public.coaching_bookings (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('collectif', 'solo', 'elite')),
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  name text not null,
  email text not null,
  goal text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.coaching_booking_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.coaching_bookings(id) on delete cascade,
  session_date date not null,
  session_time time not null,
  created_at timestamptz not null default now(),
  unique (booking_id, session_date, session_time)
);
create index if not exists coaching_booking_sessions_slot_idx on public.coaching_booking_sessions (session_date, session_time);
create index if not exists coaching_bookings_capacity_idx on public.coaching_bookings (plan, status);

alter table public.coaching_bookings enable row level security;
alter table public.coaching_booking_sessions enable row level security;
revoke all on table public.coaching_bookings, public.coaching_booking_sessions from anon, authenticated;
grant all on table public.coaching_bookings, public.coaching_booking_sessions to service_role;

create or replace function public.create_coaching_booking(
  p_plan text, p_month text, p_name text, p_email text, p_goal text, p_sessions jsonb
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_booking_id uuid;
  v_item jsonb;
  v_date date;
  v_time time;
  v_start date;
  v_end date;
  v_session_count integer;
  v_distinct_count integer;
  v_remaining integer;
  v_week_keys text[] := array[]::text[];
  v_week_key text;
begin
  if p_plan not in ('collectif', 'solo', 'elite') then raise exception 'INVALID_PLAN'; end if;
  if p_month !~ '^\d{4}-(0[1-9]|1[0-2])$' then raise exception 'INVALID_MONTH'; end if;
  v_start := (p_month || '-01')::date;
  v_end := (v_start + interval '1 month')::date;
  if jsonb_typeof(p_sessions) <> 'array' then raise exception 'INVALID_SESSIONS'; end if;
  v_session_count := jsonb_array_length(p_sessions);
  if (p_plan = 'collectif' and v_session_count not between 1 and 4) or (p_plan <> 'collectif' and v_session_count <> 4) then raise exception 'INVALID_SESSION_COUNT'; end if;
  select count(distinct (value->>'date') || '|' || (value->>'time')) into v_distinct_count from jsonb_array_elements(p_sessions);
  if v_distinct_count <> v_session_count then raise exception 'DUPLICATE_SESSION'; end if;
  if length(trim(p_name)) not between 2 and 120 or p_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or length(trim(p_goal)) not between 10 and 1500 then raise exception 'INVALID_FIELDS'; end if;

  for v_item in select value from jsonb_array_elements(p_sessions) loop
    begin
      v_date := (v_item->>'date')::date;
      v_time := (v_item->>'time')::time;
    exception when others then raise exception 'INVALID_SESSION';
    end;
    if v_date < current_date or v_date < v_start or v_date >= v_end or extract(isodow from v_date) not in (6, 7) then raise exception 'INVALID_SESSION_DATE'; end if;
    if v_time not in (time '09:00', time '10:30', time '12:00', time '14:00', time '15:30', time '17:00') then raise exception 'INVALID_SESSION_TIME'; end if;
    v_week_key := date_trunc('week', v_date::timestamp)::date::text;
    if not v_week_key = any(v_week_keys) then v_week_keys := array_append(v_week_keys, v_week_key); end if;
  end loop;
  if p_plan <> 'collectif' and cardinality(v_week_keys) <> 4 then raise exception 'ONE_SESSION_PER_WEEK'; end if;

  insert into public.coaching_bookings (plan, month, name, email, goal)
  values (p_plan, p_month, trim(p_name), lower(trim(p_email)), trim(p_goal))
  returning id into v_booking_id;

  for v_item in select value from jsonb_array_elements(p_sessions) order by value->>'date', value->>'time' loop
    v_date := (v_item->>'date')::date;
    v_time := (v_item->>'time')::time;
    if p_plan = 'collectif' then
      perform pg_advisory_xact_lock(hashtext('coaching-group:' || v_date::text || ':' || to_char(v_time, 'HH24:MI'))::bigint);
      select 10 - count(*) into v_remaining
      from public.coaching_booking_sessions s
      join public.coaching_bookings b on b.id = s.booking_id
      where s.session_date = v_date and s.session_time = v_time and b.plan = 'collectif' and b.status in ('pending', 'confirmed');
      if v_remaining <= 0 then raise exception 'GROUP_SLOT_FULL'; end if;
    end if;
    insert into public.coaching_booking_sessions (booking_id, session_date, session_time) values (v_booking_id, v_date, v_time);
  end loop;
  return v_booking_id;
end;
$$;
revoke all on function public.create_coaching_booking(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_coaching_booking(text, text, text, text, text, jsonb) to service_role;