-- SMS table removed in favor of in-app notifications

drop policy if exists sms_messages_owner_rw on public.sms_messages;
drop trigger if exists trg_sms_messages_updated_at on public.sms_messages;
drop table if exists public.sms_messages cascade;
