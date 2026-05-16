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
- [ ] Posting Match Proposals
- [ ] Browsing Match Proposals
- [ ] Acceptance & Real-Time Messaging
- [ ] Reporting Match Results
- [ ] Elo Calculation

---

## Routes

- /
- /auth/callback
- /dashboard
    - actions:
        - logout
- /onboarding
- /login
    - actions:
        - login
        - signup

---

## Database Schema

-- Enable PostGIS for geographic radius searches
create extension if not exists postgis schema extensions;

~~~
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
  status text check (status in ('open', 'accepted', 'canceled')) default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
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
~~~

---

## Theme Examples

### Dashboard
~~~
<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    
    <!-- Dashboard Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Player Dashboard</h1>
        <p class="mt-2 text-sm text-gray-600">
          Welcome to the court, <span class="font-semibold text-emerald-700">{data.user?.email}</span>!
        </p>
      </div>

      <!-- Logout Form -->
      <form method="POST" action="?/logout" use:enhance>
        <button
          type="submit"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          Log Out
        </button>
      </form>
    </div>

    <!-- Main Content Area -->
    <div class="py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
      <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-lg font-medium text-gray-900">No matches scheduled</p>
      <p class="text-sm">Your upcoming tennis matches and stats will appear here.</p>
    </div>
    
  </div>
</div>
~~~