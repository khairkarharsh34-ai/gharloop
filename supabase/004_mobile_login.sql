-- 004: Mobile number login (free, no SMS).
-- Mobile accounts sign in with number + password. They have no inbox for reset emails,
-- so admins can give a member a temporary password instead.

create or replace function public.reset_member_password(target uuid, new_password text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  t profiles%rowtype;
begin
  select * into t from profiles where id = target;
  if not found then raise exception 'Member not found'; end if;
  if length(coalesce(new_password, '')) < 6 then raise exception 'Password must be at least 6 characters'; end if;
  -- Super admins: anyone. Society admins: residents and guards of their own society only.
  if not (
    public.is_super_admin()
    or (public.is_society_admin(t.society_id) and t.role in ('resident', 'guard'))
  ) then
    raise exception 'Not allowed';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = target;
end $$;

revoke all on function public.reset_member_password(uuid, text) from public, anon;
grant execute on function public.reset_member_password(uuid, text) to authenticated;
