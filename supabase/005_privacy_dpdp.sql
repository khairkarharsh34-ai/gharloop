-- 005: Privacy rights under India's DPDP Act 2023 / DPDP Rules 2025.
-- * Records each person's consent to the privacy notice and that they are 18 or older.
-- * Lets people download all their data and delete their account themselves.
-- * Adds a clean-up function for old visitor and SOS records (data is not kept forever).

alter table public.profiles add column if not exists adult_confirmed boolean not null default false;
alter table public.profiles add column if not exists consent_version text;
alter table public.profiles add column if not exists consented_at timestamptz;

-- New sign-ups: store the consent given on the sign-up screen.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  consent text := nullif(new.raw_user_meta_data ->> 'consent_version', '');
begin
  insert into profiles (id, full_name, phone, society_id, tower, flat, adult_confirmed, consent_version, consented_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    (select s.id from societies s where s.id::text = new.raw_user_meta_data ->> 'society_id'),
    nullif(new.raw_user_meta_data ->> 'tower', ''),
    nullif(new.raw_user_meta_data ->> 'flat', ''),
    coalesce((new.raw_user_meta_data ->> 'adult')::boolean, false),
    consent,
    case when consent is null then null else now() end
  );
  return new;
end $$;

-- The privacy notice version this person accepted (null = not yet, or not confirmed 18+).
create or replace function public.my_consent() returns text
language sql stable security definer set search_path = public as $$
  select case when adult_confirmed then consent_version end from profiles where id = auth.uid()
$$;

-- Existing users accept the (new) privacy notice once.
create or replace function public.accept_privacy_notice(version text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if coalesce(version, '') = '' then raise exception 'Missing notice version'; end if;
  update profiles set adult_confirmed = true, consent_version = version, consented_at = now() where id = auth.uid();
end $$;

-- Right to access: everything Ghar Loop stores about you, as JSON.
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
    'sos_alerts', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from sos_alerts x where user_id = me)
  );
end $$;

-- Right to erasure: deletes the login, the profile and everything linked to it.
-- Official notices and society ledger entries stay, without the author's name.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from profiles where id = auth.uid() and role = 'super_admin') then
    raise exception 'Super admin accounts must be removed by Ghar Loop support';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Storage limitation: visitor passes older than 180 days and resolved SOS alerts older than 1 year
-- are no longer needed. Run "select public.purge_expired_data();" monthly (or schedule it with pg_cron).
create or replace function public.purge_expired_data() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v int; s int;
begin
  if auth.uid() is not null and not public.is_super_admin() then raise exception 'Not allowed'; end if;
  delete from visitors where created_at < now() - interval '180 days';
  get diagnostics v = row_count;
  delete from sos_alerts where status = 'resolved' and created_at < now() - interval '1 year';
  get diagnostics s = row_count;
  return jsonb_build_object('visitors_deleted', v, 'sos_deleted', s);
end $$;

revoke all on function public.my_consent() from public, anon;
revoke all on function public.accept_privacy_notice(text) from public, anon;
revoke all on function public.export_my_data() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.purge_expired_data() from public, anon, authenticated;
grant execute on function public.my_consent() to authenticated;
grant execute on function public.accept_privacy_notice(text) to authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- Let people delete their own uploaded photos (used when deleting an account).
drop policy if exists "delete own photos" on storage.objects;
create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
