alter table public.cards enable row level security;
alter table public.life_events enable row level security;
alter table public.goals enable row level security;
alter table public.decisions enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_charges enable row level security;

drop policy if exists cards_owner_rw on public.cards;
create policy cards_owner_rw on public.cards
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists life_events_owner_rw on public.life_events;
create policy life_events_owner_rw on public.life_events
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists goals_owner_rw on public.goals;
create policy goals_owner_rw on public.goals
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists decisions_owner_rw on public.decisions;
create policy decisions_owner_rw on public.decisions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists transactions_owner_rw on public.transactions;
create policy transactions_owner_rw on public.transactions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists recurring_charges_owner_rw on public.recurring_charges;
create policy recurring_charges_owner_rw on public.recurring_charges
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
