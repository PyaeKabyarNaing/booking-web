-- ============================================================
-- Salon Booking Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Custom types
create type public.user_role as enum ('customer', 'admin');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SERVICES
-- ============================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price decimal(10, 2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Services are viewable by everyone"
  on public.services for select
  using (true);

create policy "Admins can manage services"
  on public.services for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- STAFF
-- ============================================================
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

create policy "Staff are viewable by everyone"
  on public.staff for select
  using (true);

create policy "Admins can manage staff"
  on public.staff for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- STAFF_SERVICES (many-to-many join)
-- ============================================================
create table public.staff_services (
  staff_id uuid references public.staff on delete cascade not null,
  service_id uuid references public.services on delete cascade not null,
  primary key (staff_id, service_id)
);

alter table public.staff_services enable row level security;

create policy "Staff services are viewable by everyone"
  on public.staff_services for select
  using (true);

create policy "Admins can manage staff services"
  on public.staff_services for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- STAFF_SCHEDULES
-- ============================================================
create table public.staff_schedules (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  constraint unique_staff_day unique (staff_id, day_of_week)
);

alter table public.staff_schedules enable row level security;

create policy "Staff schedules are viewable by everyone"
  on public.staff_schedules for select
  using (true);

create policy "Admins can manage staff schedules"
  on public.staff_schedules for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles on delete cascade not null,
  staff_id uuid references public.staff on delete cascade not null,
  service_id uuid references public.services on delete cascade not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status public.booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = customer_id);

create policy "Authenticated users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "Users can update their own bookings"
  on public.bookings for update
  using (auth.uid() = customer_id);

create policy "Admins have full access to bookings"
  on public.bookings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index for querying available slots
create index idx_bookings_staff_date on public.bookings (staff_id, booking_date);
create index idx_bookings_customer on public.bookings (customer_id);
