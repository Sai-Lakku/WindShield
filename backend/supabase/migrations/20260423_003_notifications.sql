-- In-app notification center (replaces SMS delivery path)

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('urgent', 'plan', 'goals')),
  title text not null,
  body text not null,
  action_url text,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own notifications"
on public.notifications for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists idx_notifications_user_read_created
  on public.notifications (user_id, is_read, created_at desc);
