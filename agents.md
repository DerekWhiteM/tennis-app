## Application Overview
This is a tennis matchmaking app. Users may post match proposals for a specified time within a radius. Other users can browse proposals within a radius. When a user accepts a proposal, the two players are put into a message thread to plan the details of their session. Users can also post match results which requires the opponent to verify the result before it is made official. Elo ratings for players are updated as match results are verified.

---

## Tech Stack
- Language: TypeScript
- Framework: SvelteKit (Svelte 5)
- Database: PostgreSQL (Supabase)
- CSS: Tailwind
- Auth: Supabase

---

## Development Roadmap
- [x] User Onboarding
- [x] Profile Management
- [x] Posting Match Proposals
- [x] Browsing Match Proposals
- [x] Acceptance & Real-Time Messaging
- [ ] Reporting Match Results
- [ ] Elo Calculation

---

## Routes

- /
- /auth [logout]
    - /callback
- /login [login, signup]
- /onboarding
- /(app)
    - /dashboard
    - /profile [updateProfile]
    - /proposals/new [create]

---

## Database Schema & Functions

~~~
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

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
~~~

---

## Theme Examples

### Dashboard
~~~
<div class="bg-gray-50">
    <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
        <!-- Dashboard Header -->
        <div class="border-b border-gray-100 pb-6 mb-6 gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Match Schedule</h1>
        </div>

        <!-- Main Content Area -->
        <div
            class="py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
        >
            <svg
                class="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
            </svg>
            <p class="text-lg font-medium text-gray-900">
                No matches scheduled
            </p>
            <p class="text-sm">
                Your upcoming tennis matches and stats will appear here.
            </p>
        </div>
    </div>
</div>
~~~