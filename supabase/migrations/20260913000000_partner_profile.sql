-- Partner profile: avatar, fixed message to partner, and an in-app notification
-- when that message changes. See spec "Separar Gerenciar Perfil de Criar Atividade".

alter table profiles
  add column if not exists partner_id uuid references profiles(id),
  add column if not exists avatar_url text,
  add column if not exists partner_message text,
  add column if not exists partner_message_updated_at timestamptz;

-- Tighten profiles RLS: previously any authenticated user could read/write any
-- row (fine when it was just id/role/display_name). Now that it carries a
-- private-ish message and an editable avatar, restrict writes to your own row
-- and extend reads to your linked partner's row too.
drop policy if exists "authenticated full access" on profiles;

create policy "can view own or partner profile" on profiles
  for select using (auth.uid() = id or auth.uid() = partner_id);

create policy "can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "can update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Storage bucket for avatars: public read, write restricted to the user's own
-- folder (path convention: "<user_id>/<filename>").
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

-- In-app notifications (push is a later phase; this is read-when-you-open-the-app).
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "can mark own notifications read" on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table notifications;

-- security definer: this needs to insert a notification row for the *partner*
-- (not the acting user), which the RLS policies above would otherwise block.
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

drop trigger if exists on_partner_message_update on profiles;
create trigger on_partner_message_update
  after update on profiles
  for each row execute function notify_partner_message();
