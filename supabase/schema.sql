-- Users profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free' check (plan in ('free', 'creator', 'pro')),
  generations_used_this_month integer default 0,
  billing_period_start timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generations table
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  input_text text not null,
  input_type text default 'text',
  tone text default 'professional',
  hooks jsonb,
  selected_hook text,
  linkedin jsonb,
  twitter jsonb,
  tiktok jsonb,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own generations" on public.generations for select using (auth.uid() = user_id);
create policy "Users can insert own generations" on public.generations for insert with check (auth.uid() = user_id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
