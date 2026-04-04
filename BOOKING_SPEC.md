# Booking Website Specification (Customer Side)

## 1. Purpose
Build a customer-facing salon booking web app with:
- A luxury-styled landing page
- A multi-step booking flow where customers choose a service, then staff, then date/time, then confirm
- OAuth authentication (Google) via Supabase Auth
- Booking creation and booking confirmation (email integration stubbed for later)

This spec is designed so we can add a separate admin site later without rewriting the core customer flows.

## 2. Target Routes (Customer Side)
- `GET /` - Home page (marketing + CTA)
- `GET /booking` - Booking flow page (single route with multi-step UI)
- `GET /booking/confirmation/[id]` - Booking confirmation page
- `GET /auth/callback` - OAuth callback handler (mounted under App Router as `app/auth/callback/route.ts`)

## 3. Tech Stack
- Next.js (App Router): `next@16.2.1`
- React: `react@19.2.4`
- Styling: Tailwind CSS v4
- Auth: Supabase Auth
- DB: Supabase (Postgres + RLS)
- Validation: `zod`
- Time slot generation: `date-fns`
- UI icons: `lucide-react`

## 4. Environment Variables (Must Match Code)
### Public (browser-safe)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (this app uses it for the browser client)

### Server-only (admin / service bypass, if used)
- `SUPABASE_SERVICE_ROLE_KEY`

Notes:
- This project includes an `admin` supabase client helper, but customer-side flows rely on RLS. `SUPABASE_SERVICE_ROLE_KEY` is required only if/when admin-only server logic is implemented.
- This project does not require any additional env vars for the current MVP (email is a stub).

## 5. Database Schema Overview
Location: `supabase/migration.sql`

### Tables
- `profiles`
  - Purpose: extends `auth.users` with salon-specific fields
  - Fields: `id` (uuid, FK), `full_name`, `email`, `phone`, `avatar_url`, `role`, `created_at`
  - `role`: enum (`customer`, `admin`)
- `services`
  - Fields: `id`, `name`, `description`, `duration_minutes`, `price`, `image_url`, `is_active`, `created_at`
- `staff`
  - Fields: `id`, `name`, `bio`, `avatar_url`, `is_active`, `created_at`
- `staff_services`
  - Join: `staff_id`, `service_id`
- `staff_schedules`
  - Schedule definition per staff per day-of-week
  - Fields: `staff_id`, `day_of_week` (0-6), `start_time`, `end_time`, `is_available`
- `bookings`
  - Booking record
  - Fields: `customer_id`, `staff_id`, `service_id`, `booking_date`, `start_time`, `end_time`, `status`, `notes`, `created_at`

### RLS Rules (Intent)
- Public catalog reads:
  - `services`, `staff`, `staff_services`, `staff_schedules` can be read by everyone
- Booking writes:
  - Only authenticated users can insert bookings
  - Customers can only select/update their own bookings
  - Admin role can read/write all bookings and manage catalog tables

### Profile Creation
- A DB trigger auto-creates `public.profiles` row on `auth.users` insert.

## 6. Booking Flow Specification
Location: `app/booking/page.tsx` + `components/booking/*`

### Step 0: Select Service
- Customers pick a `service` card

### Step 1: Select Staff
- Staff list is filtered to those associated with the selected service via `staff_services`

### Step 2: Select Date & Time
- Date picker shows the next 7 days
- Time slots are computed dynamically:
  - Load staff schedule for the date's day-of-week
  - Load existing bookings for the same staff and date
  - Generate candidate slots within schedule window using the selected service duration
  - Exclude slots that overlap with existing bookings (pending/confirmed)

Implementation:
- Utility: `lib/utils/time-slots.ts`

### Step 3: Review & Confirm
- Shows booking summary
- If customer is not authenticated, display a sign-in CTA
- On confirm:
  - Calls `POST /api/bookings` with selected IDs/times
  - On success, navigates to `/booking/confirmation/[id]`

## 7. Booking API Specification
Location: `app/api/bookings/route.ts`

### `POST /api/bookings`
Input (JSON):
- `service_id` (uuid)
- `staff_id` (uuid)
- `booking_date` (YYYY-MM-DD)
- `start_time` (HH:mm, app passes as HH:mm)
- `end_time` (HH:mm, app passes as HH:mm)
- `notes` (optional)

Behavior:
- Require authenticated user
- Validate input with `zod`
- Verify selected service exists and is active
- Verify selected staff exists and is active
- Conflict detection:
  - Prevent creating bookings that overlap with existing bookings for that staff on that date
- Insert into `bookings` using:
  - `customer_id = auth.uid()`
- Return:
  - JSON containing the created `booking`

## 8. Booking Confirmation Page Spec
Location: `app/booking/confirmation/[id]/page.tsx`

Behavior:
- Require authenticated user
- Fetch booking by `id` (including joined `service`, `staff`, `customer`)
- Render confirmation details
- Provide navigation back to:
  - `/booking` (book another)
  - `/` (return home)

## 9. Authentication Spec
Location:
- Auth callback: `app/auth/callback/route.ts`
- Auth UI + state: `components/auth/*`
- Browser client: `lib/supabase/client.ts`
- Server client (cookies): `lib/supabase/server.ts`
- Refresh proxy: `proxy.ts`

### Login Gate
- Customers can browse services/staff publicly.
- Only the confirm step requires login.

### Auth Provider
- Google via Supabase Auth

## 10. Email Notifications (Phase-ready Stub)
Location: `lib/utils/email.ts`

Current state:
- Email sending function exists but is a stub (logs to console).

Planned extension:
- Integrate an email provider (options discussed earlier: Resend, SendGrid, or Supabase email workflows).

## 11. Admin Site Extension Points (Future)
Goal:
- Add an admin SPA/route set later while keeping the customer DB model stable.

Already built-in extension hooks:
- `profiles.role` includes `admin`
- RLS policies include an admin path
- `lib/supabase/admin.ts` exists for service-role operations (server-only)

Expected future admin routes:
- Manage services (CRUD)
- Manage staff (CRUD)
- Manage staff schedules (weekly schedule)
- View/manage bookings
- Possibly manage booking status transitions

## 12. Change Log
Maintain a short entry per change:
- `YYYY-MM-DD - <summary> - <links to files/PRs if any>`

## 13. Open Questions / Decisions to Lock Later
- Should we support booking cancellation/rescheduling and who can do it?
- Booking conflict policy:
  - currently blocks overlap with pending/confirmed
  - clarify whether cancelled/completed bookings affect availability
- Time slot step granularity:
  - utility uses a 30-minute advance while slot length is `duration_minutes`
  - confirm the desired granularity rules per service
- Email delivery:
  - which provider and which events (created/confirmed/cancelled)?

