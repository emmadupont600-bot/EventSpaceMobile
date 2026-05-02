-- EventSpace — Schéma Supabase CORRIGÉ
-- Colle ce SQL dans Supabase > SQL Editor si tu repars de zéro.
-- Si la base existe déjà, les migrations ont déjà tout patché.

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── VENUES ───────────────────────────────────────────────────────────────────
create table if not exists venues (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references auth.users(id) on delete cascade,
  name          text not null,
  type          text,
  category      text,
  city          text,
  address       text,
  price         integer,
  capacity      integer,
  description   text,
  img           text,
  cover_url     text,
  gallery       text[],
  gallery_urls  text[],
  amenities     text[],
  tags          text[],
  published     boolean default true,
  rating        numeric(3,1) default 0,
  review_count  integer default 0,
  coup_de_coeur boolean default false,
  atypique      boolean default false,
  created_at    timestamptz default now()
);
alter table venues enable row level security;
create policy "Public venues visible" on venues for select using (published = true);
create policy "Owner can manage" on venues for all using (auth.uid() = owner_id);

-- ─── USERS (profils) ──────────────────────────────────────────────────────────
create table if not exists users (
  id    uuid primary key references auth.users(id) on delete cascade,
  email text,
  name  text,
  role  text default 'client',
  phone text
);
alter table users enable row level security;
create policy "User reads own profile" on users for select using (auth.uid() = id);
create policy "User updates own profile" on users for update using (auth.uid() = id);
create policy "User inserts own profile" on users for insert with check (auth.uid() = id);

-- ─── FAVORITES ────────────────────────────────────────────────────────────────
create table if not exists favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade,
  venue_id   uuid references venues(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);
alter table favorites enable row level security;
create policy "User manages own favorites" on favorites
  for all using (auth.uid() = user_id);

-- ─── RESERVATIONS ─────────────────────────────────────────────────────────────
create table if not exists reservations (
  id                 uuid primary key default uuid_generate_v4(),
  venue_id           uuid references venues(id) on delete set null,
  venue_name         text,
  user_id            uuid references auth.users(id) on delete cascade,
  user_name          text,
  owner_id           uuid references auth.users(id),
  date               date,
  start_time         time,
  end_time           time,
  guests             integer,
  event_type         text,
  message            text,
  status             text default 'pending',
  total              integer,
  payment_status     text default 'unpaid',
  payment_intent_id  text,
  commission_amount  integer,
  net_owner          integer,
  commission_rate    numeric(4,2) default 0.12,
  created_at         timestamptz default now()
);
alter table reservations enable row level security;
create policy "User sees own reservations" on reservations for select using (auth.uid() = user_id);
create policy "Owner sees venue reservations" on reservations for select using (auth.uid() = owner_id);
create policy "User can create" on reservations for insert with check (auth.uid() = user_id);
create policy "Owner can update status" on reservations for update using (auth.uid() = owner_id);
create policy "User can update own" on reservations for update using (auth.uid() = user_id);

-- ─── CONVERSATIONS ────────────────────────────────────────────────────────────
create table if not exists conversations (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  owner_id    uuid references auth.users(id) on delete cascade,
  venue_id    uuid references venues(id) on delete set null,
  venue_name  text,
  created_at  timestamptz default now()
);
alter table conversations enable row level security;
create policy "Participants can read conv" on conversations
  for select using (auth.uid() = user_id or auth.uid() = owner_id);
create policy "User can create conv" on conversations
  for insert with check (auth.uid() = user_id);

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id text references conversations(id) on delete cascade,
  sender_id       uuid references auth.users(id),
  sender_name     text,
  text            text not null,
  ts              timestamptz default now(),
  read            boolean default false
);
alter table messages enable row level security;
create policy "Participants can read messages" on messages for select using (true);
create policy "Sender can insert" on messages for insert with check (auth.uid() = sender_id);

-- ─── REVIEWS ──────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id         uuid primary key default uuid_generate_v4(),
  venue_id   uuid references venues(id) on delete cascade,
  user_id    uuid references auth.users(id),
  user_name  text,
  rating     integer check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);
alter table reviews enable row level security;
create policy "Public reviews" on reviews for select using (true);
create policy "User can add review" on reviews for insert with check (auth.uid() = user_id);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table favorites;
alter publication supabase_realtime add table conversations;
