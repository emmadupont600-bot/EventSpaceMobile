-- EventSpace — Schéma Supabase
-- Colle ce SQL dans l'éditeur SQL de ton projet Supabase (Database > SQL Editor)

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
enable_extension uuid-ossp;

-- ─── VENUES ───────────────────────────────────────────────────────────────────
create table if not exists venues (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references auth.users(id) on delete cascade,
  name          text not null,
  type          text,
  category      text,
  city          text,
  address       text,
  price         integer,          -- €/heure
  capacity      integer,
  description   text,
  img           text,
  gallery       text[],
  amenities     text[],
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

-- ─── RESERVATIONS ─────────────────────────────────────────────────────────────
create table if not exists reservations (
  id              uuid primary key default uuid_generate_v4(),
  venue_id        uuid references venues(id) on delete set null,
  venue_name      text,
  user_id         uuid references auth.users(id) on delete cascade,
  owner_id        uuid references auth.users(id),
  date            date,
  start_time      time,
  end_time        time,
  guests          integer,
  event_type      text,
  status          text default 'pending', -- pending | confirmed | cancelled
  total           integer,                -- €
  commission      integer,                -- 12% du total
  annonceur_net   integer,                -- total - commission
  commission_rate numeric(4,2) default 0.12,
  created_at      timestamptz default now()
);

alter table reservations enable row level security;
create policy "User sees own reservations" on reservations for select using (auth.uid() = user_id);
create policy "Owner sees venue reservations" on reservations for select using (auth.uid() = owner_id);
create policy "User can create" on reservations for insert with check (auth.uid() = user_id);
create policy "Owner can update status" on reservations for update using (auth.uid() = owner_id);

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  conv_id     text not null,
  sender_id   uuid references auth.users(id),
  sender_name text,
  text        text not null,
  ts          timestamptz default now(),
  read        boolean default false
);

alter table messages enable row level security;
create policy "Participants can read" on messages for select using (true);
create policy "Sender can insert" on messages for insert with check (auth.uid() = sender_id);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table messages;

-- ─── REVIEWS ──────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  venue_id    uuid references venues(id) on delete cascade,
  user_id     uuid references auth.users(id),
  author      text,
  rating      integer check (rating between 1 and 5),
  text        text,
  date        date default current_date
);

alter table reviews enable row level security;
create policy "Public reviews" on reviews for select using (true);
create policy "User can add review" on reviews for insert with check (auth.uid() = user_id);
