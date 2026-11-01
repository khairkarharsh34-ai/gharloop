-- Ghar Loop · 002 Modules
-- Resolve, Community, Activities, Services, Need Help, Funds, Gate & SOS, photos, privacy fix.
-- Run once, after 001: Supabase → SQL Editor → New query → paste → Run.

-- =====================================================================
-- Helpers
-- =====================================================================
alter table public.societies add column if not exists maintenance_amount integer not null default 3000;

create or replace function public.is_member(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select sid is not null and sid = public.my_society()
$$;

create or replace function public.is_staff(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or public.is_society_admin(sid)
$$;

create or replace function public.is_guard(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'guard' and status = 'approved' and society_id = sid)
$$;

-- =====================================================================
-- Privacy: neighbours can see names and flats, but not phone numbers
-- =====================================================================
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, society_id, tower, flat, role, status, created_at) on public.profiles to authenticated;

create or replace function public.my_phone() returns text
language sql stable security definer set search_path = public as $$
  select phone from profiles where id = auth.uid()
$$;

-- =====================================================================
-- RESOLVE: issues with owner, deadline, status and proof photo
-- =====================================================================
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (length(title) between 3 and 120),
  description text,
  category text not null default 'other',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'assigned', 'in_progress', 'resolved')),
  owner_name text,
  due_date date,
  photo_url text,
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index issues_society_idx on public.issues (society_id, status, created_at desc);

create table public.issue_updates (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  society_id uuid not null default public.my_society(),
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  note text not null check (length(note) between 1 and 500),
  created_at timestamptz not null default now()
);
create index issue_updates_issue_idx on public.issue_updates (issue_id, created_at);

-- Keeps status honest and writes the timeline automatically.
create or replace function public.issue_before() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  if new.owner_name is not null and new.status = 'open' then new.status := 'assigned'; end if;
  if new.status = 'resolved' then
    if new.proof_url is null and auth.uid() is not null then
      raise exception 'Add a proof photo before marking this resolved';
    end if;
    new.resolved_at := coalesce(new.resolved_at, now());
  else
    new.resolved_at := null;
  end if;
  return new;
end $$;

create or replace function public.issue_after() returns trigger
language plpgsql security definer set search_path = public as $$
declare msg text;
begin
  if tg_op = 'INSERT' then
    insert into issue_updates (issue_id, society_id, author_id, note) values (new.id, new.society_id, new.created_by, 'Reported');
    return new;
  end if;
  if new.owner_name is distinct from old.owner_name and new.owner_name is not null then
    msg := 'Owner assigned: ' || new.owner_name;
    if new.due_date is not null then msg := msg || ' · due ' || to_char(new.due_date, 'DD Mon'); end if;
    insert into issue_updates (issue_id, society_id, author_id, note) values (new.id, new.society_id, auth.uid(), msg);
  elsif new.due_date is distinct from old.due_date and new.due_date is not null then
    insert into issue_updates (issue_id, society_id, author_id, note)
    values (new.id, new.society_id, auth.uid(), 'Deadline set to ' || to_char(new.due_date, 'DD Mon'));
  end if;
  if new.status is distinct from old.status then
    msg := case new.status
      when 'in_progress' then 'Work started'
      when 'resolved' then 'Resolved with proof photo'
      when 'open' then 'Reopened'
      else null end;
    if msg is not null then
      insert into issue_updates (issue_id, society_id, author_id, note) values (new.id, new.society_id, auth.uid(), msg);
    end if;
  end if;
  return new;
end $$;

create trigger issue_before before insert or update on public.issues for each row execute function public.issue_before();
create trigger issue_after after insert or update on public.issues for each row execute function public.issue_after();

-- =====================================================================
-- COMMUNITY: announcements + RSVP, board, group chats
-- =====================================================================
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  title text not null check (length(title) between 3 and 120),
  body text,
  event_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table public.rsvps (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  society_id uuid not null default public.my_society(),
  created_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null default 'general' check (kind in ('ask', 'lend', 'recommend', 'general')),
  body text not null check (length(body) between 3 and 1000),
  created_at timestamptz not null default now()
);

create table public.chat_groups (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  name text not null check (length(name) between 2 and 60),
  description text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.chat_groups (id) on delete cascade,
  society_id uuid not null default public.my_society(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_group_idx on public.messages (group_id, created_at);

-- =====================================================================
-- ACTIVITIES: free go live instantly, paid wait for admin approval
-- =====================================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (length(title) between 3 and 80),
  description text,
  starts_at timestamptz not null,
  location text,
  capacity integer check (capacity is null or capacity > 0),
  price integer not null default 0 check (price >= 0),
  status text not null default 'live' check (status in ('live', 'pending', 'rejected', 'cancelled')),
  created_at timestamptz not null default now()
);
create index activities_society_idx on public.activities (society_id, starts_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  purpose text not null check (purpose in ('maintenance', 'activity')),
  ref_id uuid,
  period text,
  amount integer not null check (amount > 0),
  is_test boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.activity_joins (
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  society_id uuid not null default public.my_society(),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (activity_id, user_id)
);

create or replace function public.activity_before() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;            -- SQL editor / seed data
  if tg_op = 'INSERT' then
    new.status := case when new.price > 0 then 'pending' else 'live' end;
  elsif not public.is_staff(old.society_id) then
    -- Organisers can only cancel; approvals are for admins.
    new.status := case when new.status = 'cancelled' then 'cancelled' else old.status end;
    new.price := old.price;
  end if;
  return new;
end $$;
create trigger activity_before before insert or update on public.activities for each row execute function public.activity_before();

create or replace function public.join_before() returns trigger
language plpgsql security definer set search_path = public as $$
declare a activities%rowtype; taken int;
begin
  select * into a from activities where id = new.activity_id;
  if a.id is null or a.status <> 'live' then raise exception 'This activity is not open for joining'; end if;
  if a.capacity is not null then
    select count(*) into taken from activity_joins where activity_id = a.id;
    if taken >= a.capacity then raise exception 'Sorry, this activity is full'; end if;
  end if;
  new.paid := exists (select 1 from payments where user_id = new.user_id and purpose = 'activity' and ref_id = a.id);
  if a.price > 0 and not new.paid and auth.uid() is not null then raise exception 'Please pay first'; end if;
  return new;
end $$;
create trigger join_before before insert on public.activity_joins for each row execute function public.join_before();

-- =====================================================================
-- FUNDS: ledger + maintenance payments (test mode)
-- =====================================================================
create table public.fund_entries (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  category text not null,
  amount integer not null check (amount > 0),
  note text,
  entry_date date not null default current_date,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index fund_entries_society_idx on public.fund_entries (society_id, entry_date desc);

-- A maintenance payment shows up in the society ledger automatically.
create or replace function public.payment_after() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if new.purpose = 'maintenance' then
    select coalesce(nullif(concat_ws('-', tower, flat), ''), full_name) into who from profiles where id = new.user_id;
    insert into fund_entries (society_id, kind, category, amount, note, created_by)
    values (new.society_id, 'income', 'Maintenance', new.amount, 'Paid by ' || coalesce(who, 'resident') || ' (test)', new.user_id);
  end if;
  return new;
end $$;
create trigger payment_after after insert on public.payments for each row execute function public.payment_after();

-- =====================================================================
-- SERVICES & SHOPS: neighbour-shared contacts, resident businesses
-- =====================================================================
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  added_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 2 and 60),
  service text not null,
  phone text not null check (phone ~ '^[0-9+ -]{8,16}$'),
  note text,
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 2 and 60),
  category text not null,
  description text,
  phone text,
  is_food boolean not null default false,
  fssai text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint food_needs_fssai check (not is_food or (fssai is not null and fssai ~ '^[0-9]{14}$'))
);

create or replace function public.business_before() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null then new.status := 'pending'; end if;   -- every new listing is reviewed
  return new;
end $$;
create trigger business_before before insert on public.businesses for each row execute function public.business_before();

-- =====================================================================
-- NEED HELP: service requests tracked to done
-- =====================================================================
create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category text not null,
  details text not null check (length(details) between 3 and 1000),
  preferred text not null default 'flexible' check (preferred in ('today', 'tomorrow', 'flexible')),
  status text not null default 'open' check (status in ('open', 'assigned', 'done', 'cancelled')),
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.help_before() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is not null and not public.is_staff(old.society_id) then
    -- Residents can only cancel their own request.
    new.status := case when new.status = 'cancelled' then 'cancelled' else old.status end;
    new.assigned_to := old.assigned_to;
  end if;
  if new.assigned_to is not null and new.status = 'open' then new.status := 'assigned'; end if;
  return new;
end $$;
create trigger help_before before update on public.help_requests for each row execute function public.help_before();

-- =====================================================================
-- GATE & SOS: visitor codes, guard console, emergency alerts
-- =====================================================================
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  resident_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 2 and 60),
  purpose text not null default 'guest' check (purpose in ('guest', 'delivery', 'service', 'cab', 'other')),
  expected_at timestamptz not null default now(),
  code text not null default '',
  status text not null default 'expected' check (status in ('expected', 'inside', 'left', 'cancelled')),
  entered_at timestamptz,
  left_at timestamptz,
  created_at timestamptz not null default now()
);
create index visitors_society_idx on public.visitors (society_id, status, expected_at);
create unique index visitors_active_code on public.visitors (society_id, code) where status in ('expected', 'inside');

create or replace function public.visitor_before() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'expected';
    loop   -- unique 6-digit code among this society's active passes
      new.code := lpad(floor(random() * 1000000)::int::text, 6, '0');
      exit when not exists (select 1 from visitors where society_id = new.society_id and code = new.code and status in ('expected', 'inside'));
    end loop;
    return new;
  end if;
  if auth.uid() is not null and not (public.is_guard(old.society_id) or public.is_staff(old.society_id)) then
    -- Residents can only cancel their own pass.
    new.status := case when new.status = 'cancelled' and old.status = 'expected' then 'cancelled' else old.status end;
  end if;
  if new.status = 'inside' and old.status <> 'inside' then new.entered_at := now(); end if;
  if new.status = 'left' and old.status <> 'left' then new.left_at := now(); end if;
  new.code := old.code;
  return new;
end $$;
create trigger visitor_before before insert or update on public.visitors for each row execute function public.visitor_before();

create table public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null default public.my_society() references public.societies (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  note text,
  status text not null default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

create or replace function public.sos_before() returns trigger
language plpgsql as $$
begin
  if new.status = 'resolved' and old.status <> 'resolved' then
    new.resolved_at := now();
    new.resolved_by := auth.uid();
  end if;
  return new;
end $$;
create trigger sos_before before update on public.sos_alerts for each row execute function public.sos_before();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.issues enable row level security;
alter table public.issue_updates enable row level security;
alter table public.announcements enable row level security;
alter table public.rsvps enable row level security;
alter table public.board_posts enable row level security;
alter table public.chat_groups enable row level security;
alter table public.messages enable row level security;
alter table public.activities enable row level security;
alter table public.activity_joins enable row level security;
alter table public.payments enable row level security;
alter table public.fund_entries enable row level security;
alter table public.contacts enable row level security;
alter table public.businesses enable row level security;
alter table public.help_requests enable row level security;
alter table public.visitors enable row level security;
alter table public.sos_alerts enable row level security;

-- Resolve
create policy "members read issues" on public.issues for select to authenticated using (public.is_member(society_id));
create policy "members report issues" on public.issues for insert to authenticated
  with check (public.is_member(society_id) and created_by = auth.uid());
create policy "staff manage issues" on public.issues for update to authenticated
  using (public.is_staff(society_id)) with check (public.is_staff(society_id));
create policy "staff delete issues" on public.issues for delete to authenticated using (public.is_staff(society_id));
create policy "members read updates" on public.issue_updates for select to authenticated using (public.is_member(society_id));
create policy "members comment" on public.issue_updates for insert to authenticated
  with check (public.is_member(society_id) and author_id = auth.uid());

-- Community
create policy "members read announcements" on public.announcements for select to authenticated using (public.is_member(society_id));
create policy "staff post announcements" on public.announcements for insert to authenticated with check (public.is_staff(society_id));
create policy "staff edit announcements" on public.announcements for update to authenticated using (public.is_staff(society_id));
create policy "staff delete announcements" on public.announcements for delete to authenticated using (public.is_staff(society_id));
create policy "members read rsvps" on public.rsvps for select to authenticated using (public.is_member(society_id));
create policy "members rsvp" on public.rsvps for insert to authenticated with check (public.is_member(society_id) and user_id = auth.uid());
create policy "members un-rsvp" on public.rsvps for delete to authenticated using (user_id = auth.uid());

create policy "members read board" on public.board_posts for select to authenticated using (public.is_member(society_id));
create policy "members post board" on public.board_posts for insert to authenticated
  with check (public.is_member(society_id) and author_id = auth.uid());
create policy "author or staff delete board" on public.board_posts for delete to authenticated
  using (author_id = auth.uid() or public.is_staff(society_id));

create policy "members read groups" on public.chat_groups for select to authenticated using (public.is_member(society_id));
create policy "members create groups" on public.chat_groups for insert to authenticated
  with check (public.is_member(society_id) and created_by = auth.uid());
create policy "creator or staff delete groups" on public.chat_groups for delete to authenticated
  using (created_by = auth.uid() or public.is_staff(society_id));
create policy "members read messages" on public.messages for select to authenticated using (public.is_member(society_id));
create policy "members send messages" on public.messages for insert to authenticated
  with check (public.is_member(society_id) and author_id = auth.uid()
              and exists (select 1 from public.chat_groups g where g.id = group_id and g.society_id = messages.society_id));
create policy "author or staff delete messages" on public.messages for delete to authenticated
  using (author_id = auth.uid() or public.is_staff(society_id));

-- Activities
create policy "members read activities" on public.activities for select to authenticated
  using (public.is_member(society_id) and (status = 'live' or created_by = auth.uid() or public.is_staff(society_id)));
create policy "members create activities" on public.activities for insert to authenticated
  with check (public.is_member(society_id) and created_by = auth.uid());
create policy "organiser or staff update activities" on public.activities for update to authenticated
  using (created_by = auth.uid() or public.is_staff(society_id));
create policy "members read joins" on public.activity_joins for select to authenticated using (public.is_member(society_id));
create policy "members join" on public.activity_joins for insert to authenticated
  with check (public.is_member(society_id) and user_id = auth.uid());
create policy "members leave" on public.activity_joins for delete to authenticated using (user_id = auth.uid());

-- Payments & funds
create policy "own or staff read payments" on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_staff(society_id));
create policy "members pay (test)" on public.payments for insert to authenticated
  with check (public.is_member(society_id) and user_id = auth.uid());
create policy "members read ledger" on public.fund_entries for select to authenticated using (public.is_member(society_id));
create policy "staff write ledger" on public.fund_entries for insert to authenticated with check (public.is_staff(society_id));
create policy "staff delete ledger" on public.fund_entries for delete to authenticated using (public.is_staff(society_id));

-- Services & shops
create policy "members read contacts" on public.contacts for select to authenticated using (public.is_member(society_id));
create policy "members share contacts" on public.contacts for insert to authenticated
  with check (public.is_member(society_id) and added_by = auth.uid());
create policy "adder or staff delete contacts" on public.contacts for delete to authenticated
  using (added_by = auth.uid() or public.is_staff(society_id));
create policy "members read approved businesses" on public.businesses for select to authenticated
  using (public.is_member(society_id) and (status = 'approved' or owner_id = auth.uid() or public.is_staff(society_id)));
create policy "members list a business" on public.businesses for insert to authenticated
  with check (public.is_member(society_id) and owner_id = auth.uid());
create policy "staff review businesses" on public.businesses for update to authenticated using (public.is_staff(society_id));
create policy "owner or staff delete businesses" on public.businesses for delete to authenticated
  using (owner_id = auth.uid() or public.is_staff(society_id));

-- Need help
create policy "own or staff read help" on public.help_requests for select to authenticated
  using (user_id = auth.uid() or public.is_staff(society_id));
create policy "members ask for help" on public.help_requests for insert to authenticated
  with check (public.is_member(society_id) and user_id = auth.uid());
create policy "own or staff update help" on public.help_requests for update to authenticated
  using (user_id = auth.uid() or public.is_staff(society_id));

-- Gate & SOS
create policy "resident, guard or staff read visitors" on public.visitors for select to authenticated
  using (resident_id = auth.uid() or public.is_guard(society_id) or public.is_staff(society_id));
create policy "residents pre-approve" on public.visitors for insert to authenticated
  with check (public.is_member(society_id) and resident_id = auth.uid());
create policy "resident, guard or staff update visitors" on public.visitors for update to authenticated
  using (resident_id = auth.uid() or public.is_guard(society_id) or public.is_staff(society_id));
create policy "own, guard or staff read sos" on public.sos_alerts for select to authenticated
  using (user_id = auth.uid() or public.is_guard(society_id) or public.is_staff(society_id));
create policy "members raise sos" on public.sos_alerts for insert to authenticated
  with check (public.is_member(society_id) and user_id = auth.uid());
create policy "guard or staff resolve sos" on public.sos_alerts for update to authenticated
  using (public.is_guard(society_id) or public.is_staff(society_id));

-- =====================================================================
-- Live updates (chat, SOS, gate) and photo storage
-- =====================================================================
alter publication supabase_realtime add table public.messages, public.sos_alerts, public.visitors;

insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
create policy "members upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "anyone reads photos" on storage.objects for select using (bucket_id = 'photos');
