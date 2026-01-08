-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE ERROR

-- 1. SAFER TRIGGER FUNCTION (Fixes crashes)
-- We add "ON CONFLICT DO NOTHING" so if a profile already exists, it doesn't crash the login.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    -- Try to get name from metadata, fallback to email part or 'User'
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do nothing; -- <--- THIS LINE PREVENTS CRASHES
  return new;
end;
$$ language plpgsql security definer;

-- 2. RESET THE TRIGGER
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. ENSURE COLUMNS EXIST (Just in case)
-- This will add the columns only if they are missing.
do $$ 
begin 
  if not exists (select from information_schema.columns where table_name = 'profiles' and column_name = 'username') then
    alter table public.profiles add column username text;
  end if;
  if not exists (select from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text;
  end if;
  if not exists (select from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
end $$;
