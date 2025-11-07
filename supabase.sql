-- 1️⃣ Create the profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text default 'free',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (recommended)
alter table public.profiles enable row level security;

-- 2️⃣ Create policy to allow users to read and update their own profile
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- Optional: allow the trigger function to insert rows
create policy "Allow inserts from service role or trigger function"
on public.profiles for insert
with check (true);

-- 3️⃣ Create the trigger function to handle new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, plan, created_at)
  values (new.id, new.email, 'free', now());
  return new;
end;
$$ language plpgsql security definer
set search_path = public, auth;

-- 4️⃣ Create the trigger on auth.users table
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
