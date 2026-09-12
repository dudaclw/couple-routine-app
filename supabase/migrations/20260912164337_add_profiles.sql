create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null unique check (role in ('user_a','user_b')),
  display_name text not null
);

alter table profiles enable row level security;

create policy "authenticated full access" on profiles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter publication supabase_realtime add table profiles;
