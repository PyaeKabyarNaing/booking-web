-- ============================================================
-- Seed Data for Luxe Salon
-- Run this AFTER migration.sql in Supabase SQL Editor
-- ============================================================

-- Services
insert into public.services (name, description, duration_minutes, price) values
  ('Signature Haircut', 'A personalized cut crafted by our master stylists, including consultation, wash, cut, and style.', 60, 85.00),
  ('Luxury Color', 'Full color service using premium products for vibrant, long-lasting results with a luminous finish.', 120, 180.00),
  ('Balayage & Highlights', 'Hand-painted highlights for a natural, sun-kissed look that grows out beautifully.', 150, 250.00),
  ('Keratin Treatment', 'Smooth, frizz-free hair for up to 3 months with our premium keratin treatment.', 180, 300.00),
  ('Bridal Styling', 'Complete bridal hair styling including trial, day-of styling, and touch-ups for your perfect day.', 120, 350.00),
  ('Scalp Therapy', 'Rejuvenating scalp treatment with essential oils, massage, and deep conditioning.', 45, 65.00),
  ('Blowout & Style', 'Professional blowout with heat styling for a polished, salon-fresh look.', 45, 55.00),
  ('Men''s Grooming', 'Precision cut and styling tailored for men, including hot towel finish.', 45, 50.00);

-- Staff
insert into public.staff (name, bio) values
  ('Isabella Laurent', 'Senior colorist with 12 years of experience specializing in balayage and creative color.'),
  ('Marcus Chen', 'Master stylist known for precision cuts and transformative styles. Trained in Tokyo and Paris.'),
  ('Sophia Reyes', 'Bridal specialist and texture expert. Creates stunning looks for every occasion.'),
  ('James Whitfield', 'Men''s grooming expert and barber with a modern approach to classic techniques.'),
  ('Aria Nakamura', 'Keratin and treatment specialist dedicated to hair health and restoration.');

-- Staff-Service relationships
-- Isabella: Color, Balayage, Blowout
insert into public.staff_services (staff_id, service_id)
select s.id, sv.id from public.staff s, public.services sv
where s.name = 'Isabella Laurent' and sv.name in ('Luxury Color', 'Balayage & Highlights', 'Blowout & Style');

-- Marcus: Haircut, Blowout, Men's Grooming
insert into public.staff_services (staff_id, service_id)
select s.id, sv.id from public.staff s, public.services sv
where s.name = 'Marcus Chen' and sv.name in ('Signature Haircut', 'Blowout & Style', 'Men''s Grooming');

-- Sophia: Bridal, Haircut, Blowout
insert into public.staff_services (staff_id, service_id)
select s.id, sv.id from public.staff s, public.services sv
where s.name = 'Sophia Reyes' and sv.name in ('Bridal Styling', 'Signature Haircut', 'Blowout & Style');

-- James: Men's Grooming, Haircut
insert into public.staff_services (staff_id, service_id)
select s.id, sv.id from public.staff s, public.services sv
where s.name = 'James Whitfield' and sv.name in ('Men''s Grooming', 'Signature Haircut');

-- Aria: Keratin, Scalp Therapy, Color
insert into public.staff_services (staff_id, service_id)
select s.id, sv.id from public.staff s, public.services sv
where s.name = 'Aria Nakamura' and sv.name in ('Keratin Treatment', 'Scalp Therapy', 'Luxury Color');

-- Staff Schedules (Monday=1 through Saturday=6, Sunday=0 is off)
-- Isabella: Tue-Sat, 9am-6pm
insert into public.staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
select s.id, d.day, '09:00', '18:00', true
from public.staff s, (values (2),(3),(4),(5),(6)) as d(day)
where s.name = 'Isabella Laurent';

-- Marcus: Mon-Fri, 10am-7pm
insert into public.staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
select s.id, d.day, '10:00', '19:00', true
from public.staff s, (values (1),(2),(3),(4),(5)) as d(day)
where s.name = 'Marcus Chen';

-- Sophia: Wed-Sun, 9am-5pm
insert into public.staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
select s.id, d.day, '09:00', '17:00', true
from public.staff s, (values (0),(3),(4),(5),(6)) as d(day)
where s.name = 'Sophia Reyes';

-- James: Mon-Fri, 8am-4pm
insert into public.staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
select s.id, d.day, '08:00', '16:00', true
from public.staff s, (values (1),(2),(3),(4),(5)) as d(day)
where s.name = 'James Whitfield';

-- Aria: Tue-Sat, 11am-7pm
insert into public.staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
select s.id, d.day, '11:00', '19:00', true
from public.staff s, (values (2),(3),(4),(5),(6)) as d(day)
where s.name = 'Aria Nakamura';

-- ============================================================
-- Sample profiles (requires matching auth.users rows)
--
-- public.profiles.id is a foreign key to auth.users.id. Rows are
-- created automatically by the handle_new_user trigger on signup.
-- This block inserts two demo auth users (email/password) so you
-- can log in locally, then enriches public.profiles.
--
-- Demo logins (development only; change passwords in production):
--   demo.customer@luxesalon.example / Demo123456!
--   demo.admin@luxesalon.example     / Demo123456!
--
-- Safe to re-run: skips if those emails already exist.
-- Requires extension: pgcrypto (for crypt)
--
-- instance_id: on some projects auth.instances has no rows. We resolve
-- it in order: auth.instances → any existing auth.users.instance_id →
-- all-zero UUID (single-tenant default used by many Supabase setups).
-- ============================================================

create extension if not exists pgcrypto;

do $$
declare
  inst_id uuid;
  customer_id uuid := 'a0000001-0000-4000-8000-000000000001'::uuid;
  admin_id uuid := 'a0000001-0000-4000-8000-000000000002'::uuid;
begin
  select id into inst_id from auth.instances limit 1;
  if inst_id is null then
    select instance_id into inst_id from auth.users limit 1;
  end if;
  if inst_id is null then
    inst_id := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  -- Demo customer (role stays default customer)
  if not exists (select 1 from auth.users where email = 'demo.customer@luxesalon.example') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      inst_id,
      customer_id,
      'authenticated',
      'authenticated',
      'demo.customer@luxesalon.example',
      crypt('Demo123456!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Avery Morgan","avatar_url":null}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      customer_id::text,
      customer_id,
      jsonb_build_object('sub', customer_id::text, 'email', 'demo.customer@luxesalon.example'),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  -- Demo admin (promoted via profiles.role below)
  if not exists (select 1 from auth.users where email = 'demo.admin@luxesalon.example') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      inst_id,
      admin_id,
      'authenticated',
      'authenticated',
      'demo.admin@luxesalon.example',
      crypt('Demo123456!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Jordan Blake","avatar_url":null}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      admin_id::text,
      admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'demo.admin@luxesalon.example'),
      'email',
      now(),
      now(),
      now()
    );
  end if;
end $$;

-- Enrich profiles (trigger may have inserted base rows)
update public.profiles
set
  full_name = coalesce(full_name, 'Avery Morgan'),
  email = coalesce(email, 'demo.customer@luxesalon.example'),
  phone = '+1 (555) 010-1001'
where id = 'a0000001-0000-4000-8000-000000000001'::uuid;

update public.profiles
set
  full_name = coalesce(full_name, 'Jordan Blake'),
  email = coalesce(email, 'demo.admin@luxesalon.example'),
  phone = '+1 (555) 010-2002',
  role = 'admin'
where id = 'a0000001-0000-4000-8000-000000000002'::uuid;
