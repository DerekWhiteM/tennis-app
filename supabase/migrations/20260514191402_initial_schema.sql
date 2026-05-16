-- Enable PostGIS for geographic radius searches
create extension if not exists postgis schema extensions;

-- ==========================================
-- 1. PROFILES
-- ==========================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  ntrp_rating numeric(2,1) check (ntrp_rating >= 1.0 and ntrp_rating <= 7.0),
  elo_rating integer default 1000,
  matches_played integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Automate profile creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 2. MATCH PROPOSALS
-- ==========================================
create table public.match_proposals (
    id uuid default gen_random_uuid() primary key,
    creator_id uuid references public.profiles(id) on delete cascade not null,
    proposed_time timestamp with time zone not null,
    location extensions.geography(POINT) not null, 
    radius_meters integer default 8050 not null,
    match_format text check (match_format in ('best_of_3', 'best_of_5', 'pro_set')) default 'best_of_3',
    target_gender text check (target_gender in ('male', 'female', 'any')) default 'any',
    min_ntrp numeric(2,1) check (min_ntrp >= 1.0 and min_ntrp <= 7.0) default 1.0,
    max_ntrp numeric(2,1) check (max_ntrp >= 1.0 and max_ntrp <= 7.0) default 7.0,
    status text check (status in ('open', 'accepted', 'canceled')) default 'open',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure max is always greater than or equal to min
    check (max_ntrp >= min_ntrp)
);

-- ==========================================
-- 3. MATCHES & RESULTS
-- ==========================================
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references public.match_proposals(id) on delete set null,
  player1_id uuid references public.profiles(id) not null,
  player2_id uuid references public.profiles(id) not null,
  match_time timestamp with time zone not null,
  match_format text not null, -- Copied from proposal at time of acceptance

  -- Structured Score: Array of objects [{p1_games: 6, p2_games: 4, p1_tiebreak: null, ...}]
  score_json jsonb,
  winner_id uuid references public.profiles(id),
  status text check (status in ('scheduled', 'played', 'verified', 'disputed')) default 'scheduled',

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. FRIENDSHIPS
-- ==========================================
create table public.friendships (
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Composite primary key ensures a unique relationship pair
  primary key (requester_id, addressee_id),
  -- Prevent users from friending themselves
  check (requester_id != addressee_id)
);

-- ==========================================
-- 5. THREADS (Conversations)
-- ==========================================
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  -- Nullable: If null, it's a direct friend chat. If populated, it's a match chat.
  match_id uuid references public.matches(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Links profiles to threads to easily query "My Conversations"
create table public.thread_participants (
  thread_id uuid references public.threads(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (thread_id, profile_id)
);

-- ==========================================
-- 6. MESSAGES
-- ==========================================
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
