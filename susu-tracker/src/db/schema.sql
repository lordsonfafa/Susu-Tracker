-- Susu Tracker database schema (Supabase / Postgres)
-- Run this in the Supabase SQL Editor on a new project.
-- To upgrade an existing database from the first version, see the section at the bottom.

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slot_amount numeric(10,2) not null check (slot_amount > 0),
  payout_every_days int not null default 1 check (payout_every_days > 0),
  start_date date,                                  -- calendar date of Day 1 (used for "days behind schedule")
  time_created timestamptz default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  momo_name text,                                   -- name shown on the member's MoMo payments
  phone_number varchar(15),
  slots int not null default 1 check (slots > 0),
  joined_day int not null default 1 check (joined_day > 0),  -- susu day on which the member joined
  time_added timestamptz default now(),
  unique (group_id, momo_name)
);

create table payments (
  id uuid not null primary key default gen_random_uuid(),
  group_id uuid not null references groups(id),
  member_id uuid references members(id),
  amount numeric(10,2) not null check (amount > 0),
  transaction_id text unique,
  reference text,
  source text not null check (source in ('automatic', 'manual')),
  -- matched: counts towards a day, flagged: waiting for the admin to confirm or dismiss, ignored: dismissed
  status text not null default 'matched' check (status in ('matched', 'flagged', 'ignored')),
  day_number int check (day_number > 0),            -- susu day this payment counts for (set when matched)
  raw_sms text,
  date_received date not null default current_date,
  time_received timestamptz not null default now()
);

-- a member can have at most one matched payment per susu day
create unique index payments_member_day
  on payments (member_id, day_number)
  where status = 'matched';

create table payouts (
  id uuid not null primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_id uuid not null references members(id),
  amount numeric(10,2) not null check (amount > 0),
  date_paid date not null default current_date,
  time_sent timestamptz not null default now()
);

-- Row Level Security
alter table groups enable row level security;
alter table members enable row level security;
alter table payments enable row level security;
alter table payouts enable row level security;

-- NOTE: these policies let every signed-in user read and write everything.
-- Fine for a single trusted admin. Tighten them before giving accounts to other people,
-- and turn off public sign-ups (Authentication -> Sign In / Providers).
create policy "admin full access" on groups
  for all to authenticated using (true) with check (true);
create policy "admin full access" on members
  for all to authenticated using (true) with check (true);
create policy "admin full access" on payments
  for all to authenticated using (true) with check (true);
create policy "admin full access" on payouts
  for all to authenticated using (true) with check (true);

-- Realtime: the app refreshes when these tables change
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table payouts;
alter publication supabase_realtime add table members;

-- ---------------------------------------------------------------------------
-- Upgrading a database created from the first version of this file
-- (run only the statements that apply; skip any that error with "already exists")
-- ---------------------------------------------------------------------------
-- alter table groups   add column start_date date;
-- alter table members  add column joined_day int not null default 1;
-- alter table payments add column day_number int;
-- alter table payments drop constraint payments_status_check;
-- alter table payments add constraint payments_status_check
--   check (status in ('matched', 'flagged', 'ignored'));
-- alter table payouts  rename column date_sent to date_paid;
-- create unique index payments_member_day on payments (member_id, day_number) where status = 'matched';
