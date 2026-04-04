-- ============================================================
-- Fix: infinite recursion in profiles RLS policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create a SECURITY DEFINER function that bypasses RLS to check admin role
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 2. Drop the recursive admin policies
drop policy if exists "Admins have full access to profiles" on public.profiles;
drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Admins can manage staff" on public.staff;
drop policy if exists "Admins can manage staff services" on public.staff_services;
drop policy if exists "Admins can manage staff schedules" on public.staff_schedules;
drop policy if exists "Admins have full access to bookings" on public.bookings;

-- 3. Recreate them using the SECURITY DEFINER function (no recursion)
create policy "Admins have full access to profiles"
  on public.profiles for all
  using (public.is_admin());

create policy "Admins can manage services"
  on public.services for all
  using (public.is_admin());

create policy "Admins can manage staff"
  on public.staff for all
  using (public.is_admin());

create policy "Admins can manage staff services"
  on public.staff_services for all
  using (public.is_admin());

create policy "Admins can manage staff schedules"
  on public.staff_schedules for all
  using (public.is_admin());

create policy "Admins have full access to bookings"
  on public.bookings for all
  using (public.is_admin());
