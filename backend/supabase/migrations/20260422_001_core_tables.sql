create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nickname text not null,
  issuer text not null,
  network text not null,
  credit_limit numeric not null check (credit_limit >= 0),
  current_balance numeric not null check (current_balance >= 0),
  apr numeric not null check (apr >= 0),
  minimum_payment numeric not null check (minimum_payment >= 0),
  statement_close_day int not null check (statement_close_day between 1 and 31),
  due_day int not null check (due_day between 1 and 31),
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_cards_user_id on public.cards(user_id);
create unique index if not exists uq_cards_user_idempotency on public.cards(user_id, idempotency_key) where idempotency_key is not null;
drop trigger if exists trg_cards_updated_at on public.cards;
create trigger trg_cards_updated_at before update on public.cards for each row execute function public.set_updated_at();

create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  event_date date not null,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_life_events_user_id on public.life_events(user_id);
create unique index if not exists uq_life_events_user_idempotency on public.life_events(user_id, idempotency_key) where idempotency_key is not null;
drop trigger if exists trg_life_events_updated_at on public.life_events;
create trigger trg_life_events_updated_at before update on public.life_events for each row execute function public.set_updated_at();

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  target_value numeric not null check (target_value >= 0),
  current_value numeric not null default 0 check (current_value >= 0),
  deadline date not null,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_goals_user_id on public.goals(user_id);
create unique index if not exists uq_goals_user_idempotency on public.goals(user_id, idempotency_key) where idempotency_key is not null;
drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  context text not null,
  options jsonb not null default '{}'::jsonb,
  chosen_option text not null,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_decisions_user_id on public.decisions(user_id);
create unique index if not exists uq_decisions_user_idempotency on public.decisions(user_id, idempotency_key) where idempotency_key is not null;
drop trigger if exists trg_decisions_updated_at on public.decisions;
create trigger trg_decisions_updated_at before update on public.decisions for each row execute function public.set_updated_at();

-- Existing feature tables (statement ingestion pipeline)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null,
  date date not null,
  posted_at timestamptz not null,
  description text not null,
  merchant text not null,
  category text not null,
  amount numeric not null,
  direction text not null check (direction in ('inflow', 'outflow')),
  currency text not null default 'USD',
  source text not null default 'csv',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();

create table if not exists public.recurring_charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  merchant text not null,
  category text not null,
  average_amount numeric not null,
  occurrences int not null,
  cadence_days int not null,
  last_seen_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_recurring_charges_user_id on public.recurring_charges(user_id);
drop trigger if exists trg_recurring_charges_updated_at on public.recurring_charges;
create trigger trg_recurring_charges_updated_at before update on public.recurring_charges for each row execute function public.set_updated_at();
