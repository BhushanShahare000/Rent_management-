# Supabase Integration Plan

## Goal

Move the rent manager from browser-only `localStorage` to a Supabase-backed app with authenticated owner access, persistent tenant records, bill history, paid status, and future multi-device use.

## Phase 1: Project Setup

1. Create a Supabase project for Kiraydar Management.
2. Install client libraries:
   - `@supabase/supabase-js`
   - `@supabase/ssr`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` for server-only admin scripts, never client code.
4. Add shared clients:
   - `app/lib/supabase/browser.ts` for client components.
   - `app/lib/supabase/server.ts` for server actions/routes.

## Phase 2: Database Schema

Create these tables:

```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text default '',
  base_rent integer not null default 2200,
  previous_unit integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  tenant_name text not null,
  month text not null,
  previous_unit integer not null,
  current_unit integer not null,
  used_unit integer not null,
  unit_rate integer not null,
  electricity_amount integer not null,
  base_rent integer not null,
  total_amount integer not null,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, month, created_at)
);
```

Add indexes on `owner_id`, `tenant_id`, and `month`.

## Phase 3: Security

1. Enable Row Level Security on both tables.
2. Add policies so users can only read and write rows where `owner_id = auth.uid()`.
3. Use database defaults or server actions to set `owner_id`; do not trust the browser to choose another owner.
4. Keep WhatsApp numbers and billing data private by avoiding public buckets or public API routes.

## Phase 4: App Migration

1. Add login/logout screens using Supabase Auth.
2. Replace initial `defaultTenants` state with a Supabase fetch after login.
3. Replace `saveBill`, `deleteBill`, `toggleBillPaid`, tenant updates, and tenant deletion with Supabase mutations.
4. Keep optimistic UI updates for speed, but roll back changes if Supabase returns an error.
5. Keep `localStorage` only as a temporary offline draft layer, not the source of truth.

## Phase 5: Data Migration

1. Read the existing `kiraydar-management-v1` localStorage object.
2. Show a one-time "Import local data" action after login.
3. Insert tenants first, map old numeric tenant IDs to new UUIDs, then insert bills.
4. After a successful import, mark migration complete in localStorage.

## Phase 6: Verification

1. Test auth, tenant CRUD, bill CRUD, paid toggles, WhatsApp message generation, and printing.
2. Confirm records do not leak between two test users.
3. Test reloads and multi-device updates.
4. Add a database seed script for local development.
