-- Run in the Supabase SQL editor.
-- Two fixed users are created ahead of time via Auth > Users (email/password).

create table routine_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assigned_to text not null check (assigned_to in ('user_a','user_b','both')),
  recurrence text[] not null, -- ex: ['mon','wed','fri'] ou ['daily']
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table commitments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('task','exam','assignment','appointment')),
  due_date date not null,
  assigned_to text not null check (assigned_to in ('user_a','user_b','both')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  routine_item_id uuid references routine_items(id) on delete cascade,
  date date not null,
  completed_by text not null, -- profiles.id of whoever checked it off
  completed_at timestamptz not null default now(),
  unique (routine_item_id, date)
);

-- role is fixed internally (only two people ever exist); display_name is always
-- typed by the user on first login, never hardcoded.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null unique check (role in ('user_a','user_b')),
  display_name text not null
);

-- RLS: no real multi-tenancy, both authenticated users get full read/write.
alter table routine_items enable row level security;
alter table commitments enable row level security;
alter table completions enable row level security;
alter table profiles enable row level security;

create policy "authenticated full access" on routine_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on commitments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on completions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on profiles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Realtime: add the four tables to the default publication.
alter publication supabase_realtime add table routine_items;
alter publication supabase_realtime add table commitments;
alter publication supabase_realtime add table completions;
alter publication supabase_realtime add table profiles;
