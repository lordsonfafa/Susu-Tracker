create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slot_amount numeric(10,2) not null check (slot_amount > 0),
  payout_every_days int not null default 1 check (payout_every_days > 0),
  time_created timestamptz default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  momo_name text,
  phone_number varchar(15),
  slots int not null default 1 check (slots > 0),
  time_added timestamptz default now(),
  unique (group_id, momo_name)
);

create table payments(
    id uuid not null primary key default gen_random_uuid(),
    group_id uuid not null references groups(id),
    member_id uuid references members(id),
    amount numeric(10,2) not null check(amount > 0),
    transaction_id text unique,
    reference text ,
    source text not null check(source IN ('automatic', 'manual')),
    status text not null default 'matched' check(status IN ('matched','needs_review', 'ignored')),
    raw_sms text ,
    date_received date not null default current_date,
    time_Received timestamptz not null default now()
);

create table payouts(
    id uuid not null primary key default gen_random_uuid(),
    group_id uuid not null references groups(id) on delete cascade,
    member_id uuid not null references members(id),
    amount numeric(10,2) not null check(amount > 0),
    date_sent date not null default current_date,
    time_sent timestamptz not null default now()
);

alter table groups enable row level security;
alter table members enable row level security;
alter table payments enable row level security;
alter table payouts enable row level security;

create policy "admin full access" on groups
  for all to authenticated using (true) with check (true);
create policy "admin full access" on members
  for all to authenticated using (true) with check (true);
create policy "admin full access" on payments
  for all to authenticated using (true) with check (true);
create policy "admin full access" on payouts
  for all to authenticated using (true) with check (true);