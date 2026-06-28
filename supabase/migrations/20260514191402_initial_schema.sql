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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_proposals TO authenticated;

-- ==========================================
-- 3. MATCHES & RESULTS
-- ==========================================
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references public.profiles(id) not null,
  player2_id uuid references public.profiles(id) not null,
  match_time timestamp with time zone not null,
  match_format text not null, -- Copied from proposal at time of acceptance

  -- Structured Score: Array of objects [{p1_games: 6, p2_games: 4, p1_tiebreak: null, ...}]
  score_json jsonb,
  reporter_id uuid references public.profiles(id) check (reporter_id = player1_id or reporter_id = player2_id),
  winner_id uuid references public.profiles(id),
  status text check (status in ('scheduled', 'played', 'verified', 'disputed')) default 'scheduled',

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;

-- ==========================================
-- 5. THREADS (Conversations)
-- ==========================================
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  -- Nullable: If null, it's a direct friend chat. If populated, it's a match chat.
  match_id uuid references public.matches(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;

-- Links profiles to threads to easily query "My Conversations"
create table public.thread_participants (
  thread_id uuid references public.threads(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (thread_id, profile_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thread_participants TO authenticated;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
alter publication supabase_realtime add table public.messages;

-- ==========================================
-- 7. (FUNCTION) BROWSE_MATCH_PROPOSALS
-- ==========================================
create or replace function public.browse_match_proposals(
  user_lon double precision,
  user_lat double precision,
  search_radius_meters integer,
  filter_gender text default 'all',
  filter_min_ntrp numeric default 1.0,
  filter_max_ntrp numeric default 7.0,
  filter_start_date text default null,
  filter_end_date text default null,
  searcher_gender text default 'any',    -- NEW
  searcher_ntrp numeric default 0.0      -- NEW
)
returns table (
  id uuid,
  creator_id uuid,
  creator_username text,
  creator_ntrp numeric,
  creator_elo integer,
  creator_gender text,
  proposed_time timestamp with time zone,
  match_format text,
  target_gender text,
  min_ntrp numeric,
  max_ntrp numeric,
  distance_meters double precision
) as $$
begin
  return query
  select 
    mp.id,
    mp.creator_id,
    p.username as creator_username,
    p.ntrp_rating as creator_ntrp,
    p.elo_rating as creator_elo,
    p.gender as creator_gender,
    mp.proposed_time,
    mp.match_format,
    mp.target_gender,
    mp.min_ntrp,
    mp.max_ntrp,
    st_distance(
      mp.location, 
      st_setsrid(st_point(user_lon, user_lat), 4326)::extensions.geography
    ) as distance_meters
  from public.match_proposals mp
  join public.profiles p on mp.creator_id = p.id
  where 
    mp.status = 'open'
    
    -- 1. RADIUS INTERSECTION
    -- The distance between you and the proposal must be less than or equal to 
    -- your search radius PLUS the proposal's radius.
    -- (COALESCE is used just in case older test data is missing the radius_meters column)
    and st_dwithin(
      mp.location, 
      st_setsrid(st_point(user_lon, user_lat), 4326)::extensions.geography, 
      search_radius_meters + coalesce(mp.radius_meters, 8046.72) 
    )
    
    -- 2. SEARCHER filtering the CREATOR'S Profile
    and (filter_gender = 'all' or p.gender = filter_gender)
    and (p.ntrp_rating >= filter_min_ntrp and p.ntrp_rating <= filter_max_ntrp)
    
    -- 3. CREATOR filtering the SEARCHER'S Profile
    and (mp.target_gender = 'any' or mp.target_gender = searcher_gender)
    and (searcher_ntrp >= mp.min_ntrp and searcher_ntrp <= mp.max_ntrp)
    
    -- 4. DATE FILTERS
    and (filter_start_date is null or filter_start_date = '' or mp.proposed_time >= filter_start_date::timestamp with time zone)
    and (filter_end_date is null or filter_end_date = '' or mp.proposed_time < (filter_end_date::date + interval '1 day'))
    
  order by distance_meters asc;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 8. ELO CALCULATION FUNCTION & TRIGGER
-- ==========================================
create or replace function public.process_verified_match()
returns trigger as $$
declare
  p1_rating integer;
  p2_rating integer;
  p1_matches integer;
  p2_matches integer;
  
  expected_p1 numeric;
  expected_p2 numeric;
  score_p1 numeric;
  score_p2 numeric;
  
  -- The K-Factor determines the max points won/lost. 
  -- 32 is standard for new players, you could dynamically lower this as matches_played increases.
  k_factor integer := 32; 
  
  new_p1_rating integer;
  new_p2_rating integer;
begin
  -- Only process when the match status transitions exactly to 'verified'
  if new.status = 'verified' and old.status != 'verified' then
    
    -- 1. Fetch current profiles
    select elo_rating, matches_played into p1_rating, p1_matches 
    from public.profiles where id = new.player1_id;
    
    select elo_rating, matches_played into p2_rating, p2_matches 
    from public.profiles where id = new.player2_id;

    -- 2. Determine match outcome based on winner_id
    if new.winner_id = new.player1_id then
      score_p1 := 1.0;
      score_p2 := 0.0;
    elsif new.winner_id = new.player2_id then
      score_p1 := 0.0;
      score_p2 := 1.0;
    else
      -- Fallback for unhandled states, shouldn't happen in tennis
      score_p1 := 0.5;
      score_p2 := 0.5;
    end if;

    -- 3. Calculate Expected Win Probabilities (using float division)
    expected_p1 := 1.0 / (1.0 + power(10.0, (p2_rating - p1_rating) / 400.0));
    expected_p2 := 1.0 / (1.0 + power(10.0, (p1_rating - p2_rating) / 400.0));

    -- 4. Calculate New Ratings
    new_p1_rating := round(p1_rating + k_factor * (score_p1 - expected_p1));
    new_p2_rating := round(p2_rating + k_factor * (score_p2 - expected_p2));

    -- 5. Update Profiles with new ratings and increment match counts
    update public.profiles
    set elo_rating = new_p1_rating,
        matches_played = p1_matches + 1
    where id = new.player1_id;

    update public.profiles
    set elo_rating = new_p2_rating,
        matches_played = p2_matches + 1
    where id = new.player2_id;
    
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger to the matches table
drop trigger if exists on_match_verified on public.matches;
create trigger on_match_verified
  after update of status on public.matches
  for each row
  execute procedure public.process_verified_match();
