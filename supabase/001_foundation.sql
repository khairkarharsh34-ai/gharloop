-- Ghar Loop · 001 Foundation
-- Societies, user profiles, roles, join approval and Row Level Security.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

-- ---------- Types ----------
create type public.user_role as enum ('resident', 'guard', 'society_admin', 'super_admin');
create type public.member_status as enum ('pending', 'approved', 'rejected');

-- ---------- Tables ----------
create table public.societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  society_id uuid references public.societies (id) on delete set null,
  tower text,
  flat text,
  role public.user_role not null default 'resident',
  status public.member_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index profiles_society_idx on public.profiles (society_id, status);

-- ---------- Helper functions ----------
-- "security definer" lets these read profiles without tripping over RLS.
create or replace function public.my_society() returns uuid
language sql stable security definer set search_path = public as $$
  select society_id from profiles where id = auth.uid() and status = 'approved'
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'super_admin' and status = 'approved')
$$;

create or replace function public.is_society_admin(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'society_admin' and status = 'approved' and society_id = sid
  )
$$;

-- ---------- New user → profile row ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, society_id, tower, flat)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    (select s.id from societies s where s.id::text = new.raw_user_meta_data ->> 'society_id'),
    nullif(new.raw_user_meta_data ->> 'tower', ''),
    nullif(new.raw_user_meta_data ->> 'flat', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Guard sensitive profile columns ----------
-- Residents can edit their name/phone/flat, but not their own role or approval.
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- SQL Editor / service role (no logged-in user): allow anything.
  if auth.uid() is null or public.is_super_admin() then
    return new;
  end if;

  if public.is_society_admin(old.society_id) and old.id <> auth.uid() then
    -- Society admins manage their own society only, and cannot create super admins.
    if new.society_id is distinct from old.society_id or new.role = 'super_admin' then
      raise exception 'Not allowed';
    end if;
    return new;
  end if;

  -- Everyone else editing their own row.
  new.role := old.role;
  if old.status = 'approved' then
    new.society_id := old.society_id;
    new.status := old.status;
  elsif new.society_id is distinct from old.society_id or old.status = 'rejected' then
    new.status := 'pending';          -- choosing a society again sends a fresh request
  else
    new.status := old.status;
  end if;
  return new;
end $$;

create trigger protect_profile_before_update
  before update on public.profiles
  for each row execute function public.protect_profile();

-- ---------- Row Level Security ----------
alter table public.societies enable row level security;
alter table public.profiles enable row level security;

-- Society names are public so the sign-up screen can list them.
create policy "societies readable" on public.societies
  for select to anon, authenticated using (true);
create policy "super admin manages societies" on public.societies
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "read neighbours" on public.profiles
  for select to authenticated using (
    society_id = public.my_society()
    and (status = 'approved' or public.is_society_admin(society_id))
  );
create policy "super admin reads all" on public.profiles
  for select to authenticated using (public.is_super_admin());

create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "admins update members" on public.profiles
  for update to authenticated
  using (public.is_super_admin() or public.is_society_admin(society_id))
  with check (public.is_super_admin() or public.is_society_admin(society_id));

-- ---------- Demo society ----------
insert into public.societies (name, city) values ('Green Valley Heights', 'Pune');
