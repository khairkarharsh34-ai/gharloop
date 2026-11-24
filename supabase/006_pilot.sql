-- 006: Ready for society pilots.
-- * Each society gets an invite code and link (gharloop.com style: app.gharloop.com/join/CODE).
-- * Demo / test societies can be hidden from the sign-up list.
-- * Society Admins can set their own maintenance amount.
-- * In-app feedback to the Ghar Loop team.
-- * Pilot health numbers per society for the Super Admin (counts only, no personal data).

-- ---------- Invite codes and listing ----------
alter table public.societies add column if not exists join_code text;
alter table public.societies add column if not exists is_listed boolean not null default true;

create or replace function public.new_join_code() returns text
language plpgsql security definer set search_path = public as $$
declare
  chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- no 0/O, 1/I/L
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.societies where join_code = code);
  end loop;
  return code;
end $$;

update public.societies set join_code = public.new_join_code() where join_code is null;
alter table public.societies alter column join_code set not null;
create unique index if not exists societies_join_code_key on public.societies (join_code);

create or replace function public.society_before_insert() returns trigger
language plpgsql as $$
begin
  if new.join_code is null then new.join_code := public.new_join_code(); end if;
  new.join_code := upper(new.join_code);
  return new;
end $$;
drop trigger if exists society_before_insert on public.societies;
create trigger society_before_insert before insert on public.societies
  for each row execute function public.society_before_insert();

-- The demo society stays usable for demos but is hidden from real residents.
update public.societies set is_listed = false where name = 'Green Valley Heights';

-- Codes are not shown in the public society list; only via the functions below.
revoke select on public.societies from anon, authenticated;
grant select (id, name, city, created_at, maintenance_amount, is_listed) on public.societies to anon, authenticated;

-- Anyone (even logged out) can look up a society by its invite code.
create or replace function public.society_by_code(code text) returns table (id uuid, name text, city text)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.city from societies s where s.join_code = upper(trim(code))
$$;

-- Invite code of a society, for its Society Admin or a Super Admin.
create or replace function public.society_invite_code(sid uuid) returns text
language sql stable security definer set search_path = public as $$
  select join_code from societies
  where id = sid and (public.is_super_admin() or public.is_society_admin(sid))
$$;

-- Society Admins set their maintenance amount (Super Admins can already edit societies).
create or replace function public.set_maintenance_amount(sid uuid, amount integer) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_super_admin() or public.is_society_admin(sid)) then raise exception 'Not allowed'; end if;
  if amount is null or amount < 0 or amount > 100000 then raise exception 'Enter an amount between 0 and 1,00,000'; end if;
  update societies set maintenance_amount = amount where id = sid;
end $$;

-- ---------- Feedback ----------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  society_id uuid references public.societies (id) on delete set null,
  kind text not null check (kind in ('idea', 'problem', 'praise')),
  message text not null check (length(trim(message)) between 3 and 2000),
  status text not null default 'new' check (status in ('new', 'seen', 'done')),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "send feedback" on public.feedback;
drop policy if exists "read own or all feedback" on public.feedback;
drop policy if exists "super admin updates feedback" on public.feedback;
create policy "send feedback" on public.feedback for insert to authenticated
  with check (user_id = auth.uid());
create policy "read own or all feedback" on public.feedback for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin());
create policy "super admin updates feedback" on public.feedback for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------- Pilot health (counts only) ----------
create or replace function public.pilot_stats() returns table (
  society_id uuid, name text, city text, join_code text, is_listed boolean, maintenance_amount numeric,
  members int, pending int, admins int, guards int,
  issues_7d int, notices_7d int, messages_7d int, visitors_7d int, open_issues int, feedback_new int
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'Not allowed'; end if;
  return query
  select s.id, s.name, s.city, s.join_code, s.is_listed, s.maintenance_amount::numeric,
    (select count(*)::int from profiles p where p.society_id = s.id and p.status = 'approved'),
    (select count(*)::int from profiles p where p.society_id = s.id and p.status = 'pending'),
    (select count(*)::int from profiles p where p.society_id = s.id and p.status = 'approved' and p.role = 'society_admin'),
    (select count(*)::int from profiles p where p.society_id = s.id and p.status = 'approved' and p.role = 'guard'),
    (select count(*)::int from issues x where x.society_id = s.id and x.created_at > now() - interval '7 days'),
    (select count(*)::int from announcements x where x.society_id = s.id and x.created_at > now() - interval '7 days'),
    (select count(*)::int from messages x where x.society_id = s.id and x.created_at > now() - interval '7 days'),
    (select count(*)::int from visitors x where x.society_id = s.id and x.created_at > now() - interval '7 days'),
    (select count(*)::int from issues x where x.society_id = s.id and x.status <> 'resolved'),
    (select count(*)::int from feedback f where f.society_id = s.id and f.status = 'new')
  from societies s
  order by s.created_at desc;
end $$;

-- ---------- Download my data now includes feedback ----------
create or replace function public.export_my_data() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'Not signed in'; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('email', email, 'created_at', created_at, 'last_sign_in_at', last_sign_in_at) from auth.users where id = me),
    'profile', (select to_jsonb(p) from profiles p where id = me),
    'issues', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from issues x where created_by = me),
    'issue_updates', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from issue_updates x where author_id = me),
    'announcements', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from announcements x where author_id = me),
    'rsvps', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from rsvps x where user_id = me),
    'board_posts', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from board_posts x where author_id = me),
    'chat_messages', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from messages x where author_id = me),
    'activities', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from activities x where created_by = me),
    'activity_joins', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from activity_joins x where user_id = me),
    'payments', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from payments x where user_id = me),
    'contacts_shared', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from contacts x where added_by = me),
    'businesses', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from businesses x where owner_id = me),
    'help_requests', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from help_requests x where user_id = me),
    'visitors', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from visitors x where resident_id = me),
    'sos_alerts', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from sos_alerts x where user_id = me),
    'feedback', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from feedback x where user_id = me)
  );
end $$;

revoke all on function public.new_join_code() from public, anon;
revoke all on function public.society_invite_code(uuid) from public, anon;
revoke all on function public.set_maintenance_amount(uuid, integer) from public, anon;
revoke all on function public.pilot_stats() from public, anon;
grant execute on function public.society_by_code(text) to anon, authenticated;
grant execute on function public.society_invite_code(uuid) to authenticated;
grant execute on function public.set_maintenance_amount(uuid, integer) to authenticated;
grant execute on function public.pilot_stats() to authenticated;
