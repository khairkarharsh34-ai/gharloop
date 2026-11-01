-- Ghar Loop · 003 Demo data for "Green Valley Heights"
-- Fills the demo society with neighbours, issues, notices, chats, activities, shops, funds and visitors,
-- so a demo never starts on empty screens. Run once, after 002.
--
-- Demo logins (password for all: GharLoop@2026)
--   admin@demo.gharloop.app    Suresh Kulkarni · Society Admin (Treasurer)
--   guard@demo.gharloop.app    Ramesh Yadav · Guard (main gate)
--   priya@demo.gharloop.app    Priya Nair · Resident A-302
--   rohan@demo.gharloop.app    Rohan Mehta · Resident B-904

create or replace function public._demo_user(p_email text, p_name text, p_tower text, p_flat text, p_soc uuid)
returns uuid language plpgsql security definer set search_path = public, auth, extensions as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = p_email;
  if uid is not null then return uid; end if;
  uid := gen_random_uuid();
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
    extensions.crypt('GharLoop@2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_name, 'tower', p_tower, 'flat', p_flat, 'society_id', p_soc),
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', p_email), 'email', now(), now(), now());
  update profiles set status = 'approved' where id = uid;
  return uid;
end $$;

do $$
declare
  soc uuid;
  suresh uuid; ramesh uuid; priya uuid; rohan uuid; neha uuid; kavita uuid; meera uuid; anil uuid;
  lift uuid; leak uuid; light uuid; gym uuid;
  meeting uuid; tank uuid; diwali uuid;
  g_tower uuid; g_yoga uuid; g_pets uuid;
  yoga uuid; badminton uuid; cake uuid; art uuid;
  sun date := current_date + case when extract(isodow from current_date) = 7 then 7 else 7 - extract(isodow from current_date)::int end;
  sat date := current_date + case when extract(isodow from current_date) = 6 then 7 else (6 - extract(isodow from current_date)::int + 7) % 7 end;
  ist text := 'Asia/Kolkata';
begin
  select id into soc from societies where name = 'Green Valley Heights' order by created_at limit 1;
  if soc is null then raise exception 'Run 001_foundation.sql first (Green Valley Heights not found)'; end if;
  if exists (select 1 from issues where society_id = soc and title = 'Lift B2 stuck between floors') then
    raise notice 'Demo data already loaded'; return;
  end if;
  update societies set maintenance_amount = 3500 where id = soc;

  -- People
  suresh := _demo_user('admin@demo.gharloop.app', 'Suresh Kulkarni', 'B', '1102', soc);
  ramesh := _demo_user('guard@demo.gharloop.app', 'Ramesh Yadav', 'Main gate', null, soc);
  priya  := _demo_user('priya@demo.gharloop.app', 'Priya Nair', 'A', '302', soc);
  rohan  := _demo_user('rohan@demo.gharloop.app', 'Rohan Mehta', 'B', '904', soc);
  neha   := _demo_user('neha@demo.gharloop.app', 'Neha Kapoor', 'A', '504', soc);
  kavita := _demo_user('kavita@demo.gharloop.app', 'Kavita Joshi', 'C', '203', soc);
  meera  := _demo_user('meera@demo.gharloop.app', 'Meera Iyer', 'B', '604', soc);
  anil   := _demo_user('anil@demo.gharloop.app', 'Anil Deshmukh', 'C', '1001', soc);
  update profiles set role = 'society_admin' where id = suresh;
  update profiles set role = 'guard' where id = ramesh;
  update profiles set status = 'pending' where id = anil;      -- shows up in "Resident requests"

  -- Resolve
  insert into issues (society_id, created_by, title, description, category, priority, created_at)
  values (soc, rohan, 'Lift B2 stuck between floors', 'Lift stopped between 6th and 7th floor twice this week. 43 flats depend on it.', 'lift', 'high', now() - interval '3 days')
  returning id into lift;
  update issues set owner_name = 'Maintenance Committee', due_date = current_date + 2 where id = lift;
  update issues set status = 'in_progress' where id = lift;
  insert into issue_updates (issue_id, society_id, author_id, note, created_at)
  values (lift, soc, suresh, 'Otis technician visiting tomorrow 10 AM. Discussed in weekly meeting.', now() - interval '1 day');

  insert into issues (society_id, created_by, title, description, category, priority, created_at)
  values (soc, priya, 'Water leakage in B-1204 ceiling', 'Seepage from the terrace tank line into the bedroom ceiling.', 'plumbing', 'medium', now() - interval '9 days')
  returning id into leak;
  update issues set owner_name = 'Plumbing vendor (Shree Services)', due_date = current_date - 4 where id = leak;
  update issues set status = 'resolved', proof_url = null where id = leak;

  insert into issues (society_id, created_by, title, description, category, priority, created_at)
  values (soc, meera, 'Streetlight near Gate 2 not working', 'Very dark near the parking ramp after 8 PM.', 'electrical', 'medium', now() - interval '20 hours')
  returning id into light;

  insert into issues (society_id, created_by, title, description, category, priority, created_at)
  values (soc, kavita, 'Gym treadmill belt slipping', null, 'amenities', 'low', now() - interval '2 days')
  returning id into gym;
  update issues set owner_name = 'Facilities Lead', due_date = current_date + 5 where id = gym;

  -- Community: notices + RSVP
  insert into announcements (society_id, author_id, title, body, event_at, location, created_at)
  values (soc, suresh, 'Weekly community meeting', 'Open issues review: every issue needs an owner, a next step and a date. All residents welcome.',
          (sun + time '11:00') at time zone ist, 'Clubhouse', now() - interval '1 day') returning id into meeting;
  insert into announcements (society_id, author_id, title, body, event_at, location, created_at)
  values (soc, suresh, 'Water tank cleaning', 'Water supply will be off in Towers A and B. Please store water the night before.',
          (sun + time '14:00') at time zone ist, 'Towers A & B', now() - interval '2 days') returning id into tank;
  insert into announcements (society_id, author_id, title, body, event_at, location, created_at)
  values (soc, suresh, 'Diwali Milan 🪔', 'Rangoli competition, potluck dinner and a kids'' lantern walk. Bring one dish to share!',
          (current_date + 6 + time '18:30') at time zone ist, 'Central lawn', now() - interval '3 hours') returning id into diwali;
  insert into rsvps (announcement_id, user_id, society_id)
  select diwali, u, soc from unnest(array[priya, rohan, neha, kavita, meera]) u
  union all select meeting, u, soc from unnest(array[rohan, priya, suresh]) u;

  insert into board_posts (society_id, author_id, kind, body, created_at) values
    (soc, rohan, 'ask', 'Does anyone have a drill machine I can borrow this Saturday? Will return the same day.', now() - interval '5 hours'),
    (soc, neha, 'recommend', 'Sharing a great AC technician: Imran (Cool Care). Serviced 2 ACs for ₹900, very neat work.', now() - interval '1 day'),
    (soc, priya, 'lend', 'Kids'' cycle (age 5–8) free to a good home. Collect from A-302.', now() - interval '2 days');

  -- Community: group chats
  insert into chat_groups (society_id, created_by, name, description) values (soc, suresh, 'Tower B Residents', 'General discussion for Tower B') returning id into g_tower;
  insert into chat_groups (society_id, created_by, name, description) values (soc, priya, 'Yoga Group', 'Coordinating morning sessions') returning id into g_yoga;
  insert into chat_groups (society_id, created_by, name, description) values (soc, meera, 'Pet Owners', 'Walks, vets, pet-sitting swaps') returning id into g_pets;
  insert into messages (group_id, society_id, author_id, body, created_at) values
    (g_tower, soc, rohan, 'Lift B2 is stuck again 😩', now() - interval '3 days'),
    (g_tower, soc, suresh, 'Logged it in Resolve and assigned to the Maintenance Committee. Technician coming tomorrow.', now() - interval '3 days' + interval '20 minutes'),
    (g_tower, soc, meera, 'Thank you! Finally one place to track it.', now() - interval '3 days' + interval '35 minutes'),
    (g_yoga, soc, priya, 'Sunday 7 AM at the clubhouse. Bring your own mat 🧘', now() - interval '6 hours'),
    (g_yoga, soc, kavita, 'Count me in!', now() - interval '5 hours'),
    (g_pets, soc, meera, 'Anyone know a good vet near Baner?', now() - interval '1 day'),
    (g_pets, soc, neha, 'Dr. Kulkarni at PetCare Baner. Very gentle with cats.', now() - interval '23 hours');

  -- Activities
  insert into activities (society_id, created_by, title, description, starts_at, location, capacity, price, status) values
    (soc, priya, 'Morning Yoga', 'Beginner-friendly hatha yoga, led by Priya.', (sun + time '07:00') at time zone ist, 'Clubhouse', 12, 0, 'live')
    returning id into yoga;
  insert into activities (society_id, created_by, title, description, starts_at, location, capacity, price, status) values
    (soc, rohan, 'Badminton doubles', 'Intermediate level. Shuttles provided.', (sat + time '19:00') at time zone ist, 'Indoor court', 4, 0, 'live')
    returning id into badminton;
  insert into activities (society_id, created_by, title, description, starts_at, location, capacity, price, status) values
    (soc, neha, 'Cake Making Workshop', 'Bake and decorate a chocolate cake. All ingredients included.', (sun + time '17:00') at time zone ist, 'A-504', 10, 499, 'live')
    returning id into cake;
  insert into activities (society_id, created_by, title, description, starts_at, location, capacity, price, status) values
    (soc, kavita, 'Kids'' Art Workshop', 'Ages 5–10. A parent or guardian must accompany.', (sat + 7 + time '16:00') at time zone ist, 'Clubhouse', 15, 400, 'live')
    returning id into art;
  insert into activities (society_id, created_by, title, description, starts_at, location, capacity, price, status) values
    (soc, meera, 'Piano Basics for Kids', 'Ages 6+. 45-minute sessions.', (sat + 7 + time '11:00') at time zone ist, 'B-604', 6, 350, 'pending');
  insert into activity_joins (activity_id, user_id, society_id) select yoga, u, soc from unnest(array[priya, kavita, rohan, neha, meera, suresh]) u;
  insert into activity_joins (activity_id, user_id, society_id) select badminton, u, soc from unnest(array[rohan, suresh, priya]) u;
  insert into payments (society_id, user_id, purpose, ref_id, amount) select soc, u, 'activity', cake, 499 from unnest(array[priya, kavita, meera]) u;
  insert into activity_joins (activity_id, user_id, society_id) select cake, u, soc from unnest(array[priya, kavita, meera]) u;

  -- Services & shops
  insert into contacts (society_id, added_by, name, service, phone, note) values
    (soc, suresh, 'Ramesh Patil', 'Plumber', '+91 98220 11245', 'Available 9 AM–8 PM. Fixed our B-wing leaks.'),
    (soc, priya, 'Sunita Bai', 'Maid', '+91 90110 54312', 'Mornings only. Very reliable.'),
    (soc, rohan, 'Ajay Electricals', 'Electrician', '+91 97654 22019', 'Same-day visits for small jobs.'),
    (soc, neha, 'Cool Care (Imran)', 'AC service', '+91 99700 88123', '₹450 per AC service.');
  insert into businesses (society_id, owner_id, name, category, description, phone, is_food, fssai, status) values
    (soc, neha, 'Neha''s Home Cakes', 'Bakery', 'Fresh cakes, cupcakes and celebration boxes. Pre-order 1 day ahead.', '+91 98500 12345', true, '21524019000123', 'approved'),
    (soc, kavita, 'Kavita Home Mess', 'Tiffin', 'Daily or monthly vegetarian meals. Maharashtrian thali.', '+91 98900 67890', true, '21524019000456', 'approved'),
    (soc, priya, 'Priya''s Yoga Studio', 'Fitness', 'Private and small-group yoga sessions at home.', null, false, null, 'approved'),
    (soc, meera, 'Meera''s Masala Box', 'Spices', 'Home-ground masalas from Kerala.', null, true, '21524019000789', 'pending');

  -- Need help
  insert into help_requests (society_id, user_id, category, details, preferred, created_at) values
    (soc, rohan, 'Plumbing', 'Kitchen sink draining very slowly.', 'today', now() - interval '2 hours'),
    (soc, meera, 'Electrical', 'Two switchboards sparking in the hall.', 'tomorrow', now() - interval '1 day');

  -- Funds (this month)
  insert into fund_entries (society_id, kind, category, amount, note, entry_date, created_by) values
    (soc, 'income', 'Opening balance', 4120000, 'Carried forward, certified by Treasurer', date_trunc('month', current_date)::date, suresh),
    (soc, 'income', 'Maintenance', 840000, 'Collections this month (240 flats)', date_trunc('month', current_date)::date + 4, suresh),
    (soc, 'expense', 'Lift AMC', 120000, 'Otis annual maintenance, Q3 instalment', date_trunc('month', current_date)::date + 5, suresh),
    (soc, 'expense', 'Security', 185000, 'Guard agency invoice #SG-1182', date_trunc('month', current_date)::date + 6, suresh),
    (soc, 'expense', 'Housekeeping', 140000, 'Cleaning staff and supplies', date_trunc('month', current_date)::date + 6, suresh),
    (soc, 'expense', 'Electricity', 105000, 'Common areas, MSEDCL bill', date_trunc('month', current_date)::date + 8, suresh),
    (soc, 'expense', 'Repairs', 150000, 'Terrace waterproofing (approved in AGM)', date_trunc('month', current_date)::date + 10, suresh);

  -- Gate
  insert into visitors (society_id, resident_id, name, purpose, expected_at) values
    (soc, rohan, 'Amazon delivery', 'delivery', now() + interval '2 hours'),
    (soc, priya, 'Anjali (sister)', 'guest', now() + interval '4 hours'),
    (soc, neha, 'Urban Company – cleaning', 'service', now() + interval '1 hour');
end $$;

drop function public._demo_user(text, text, text, text, uuid);
