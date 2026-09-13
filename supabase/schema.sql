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
  display_name text not null,
  partner_id uuid references profiles(id),
  avatar_url text,
  partner_message text,
  partner_message_updated_at timestamptz
);

-- Partner link is manual for now (no invite flow) — after both profiles exist:
--   update profiles set partner_id = '<uuid-B>' where id = '<uuid-A>';
--   update profiles set partner_id = '<uuid-A>' where id = '<uuid-B>';
-- Both directions are required, or only one side can see the other's profile.

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id), -- who receives it
  type text not null, -- e.g. 'partner_message'
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS: no real multi-tenancy for the activity tables — both authenticated
-- users get full read/write. profiles/notifications are scoped per-user
-- (with a read exception on profiles so you can see your partner's).
alter table routine_items enable row level security;
alter table commitments enable row level security;
alter table completions enable row level security;
alter table profiles enable row level security;
alter table notifications enable row level security;

create policy "authenticated full access" on routine_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on commitments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on completions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "can view own or partner profile" on profiles
  for select using (auth.uid() = id or auth.uid() = partner_id);

create policy "can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "can update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "can mark own notifications read" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime: add the tables to the default publication.
alter publication supabase_realtime add table routine_items;
alter publication supabase_realtime add table commitments;
alter publication supabase_realtime add table completions;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table notifications;

-- Avatar storage: public read, write restricted to the uploader's own folder
-- (path convention "<user_id>/<filename>").
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "users can upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- security definer: needs to insert a notification row for the *partner*,
-- which the RLS policies above would otherwise block for the acting user.
create or replace function notify_partner_message()
returns trigger
security definer
set search_path = public
as $$
begin
  if new.partner_message is distinct from old.partner_message and new.partner_id is not null then
    insert into notifications (user_id, type, payload)
    values (new.partner_id, 'partner_message', jsonb_build_object('message', new.partner_message));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_partner_message_update
  after update on profiles
  for each row execute function notify_partner_message();
