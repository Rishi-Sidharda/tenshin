-- ==========================================================
-- USER PROFILES SETUP (CLEAN VERSION)
-- ==========================================================

-- 1️⃣ Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  plan text default 'free',
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2️⃣ Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3️⃣ Create access policies
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- 4️⃣ Automatically update `updated_at` timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- ==========================================================
-- AUTO-CREATE PROFILE WHEN USER SIGNS UP
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ==========================================================
-- AUTO-UPDATE PROFILE WHEN USER INFO CHANGES
-- ==========================================================
create or replace function public.sync_user_profile()
returns trigger as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', avatar_url),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_updated
after update on auth.users
for each row
execute function public.sync_user_profile();
