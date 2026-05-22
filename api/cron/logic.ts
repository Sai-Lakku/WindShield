import { createClient } from "@supabase/supabase-js";

function daysUntilDayOfMonth(dayOfMonth: number): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let target = new Date(y, m, dayOfMonth, 23, 59, 59, 999);
  if (target < now) {
    target = new Date(y, m + 1, dayOfMonth, 23, 59, 59, 999);
  }
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

async function notifyIfNew(
  supabase: any,
  userId: string,
  dedupeKey: string,
  row: { type: "urgent" | "plan" | "goals"; title: string; body: string; action_url: string | null },
) {
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", since)
    .contains("metadata", { dedupe_key: dedupeKey })
    .maybeSingle();
  if (existing) return false;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type: row.type,
    title: row.title,
    body: row.body,
    action_url: row.action_url,
    is_read: false,
    metadata: { dedupe_key: dedupeKey },
  });
  if (error) throw new Error(error.message);
  return true;
}

export async function runCronCheckTriggers(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const supabase: any = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let page = 1;
  let processed = 0;
  let created = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const users = data.users ?? [];
    if (users.length === 0) break;

    for (const user of users) {
      processed += 1;
      const userId = user.id;
      const { data: cards, error: cardsError } = await supabase.from("cards").select("*").eq("user_id", userId);
      if (cardsError) continue;

      for (const card of cards ?? []) {
        const nickname = String(card.nickname ?? "Card");
        const dueDay = Number(card.due_day);
        const closeDay = Number(card.statement_close_day);
        const minPayment = Number(card.minimum_payment ?? 0);
        const limit = Number(card.credit_limit ?? 0);
        const balance = Number(card.current_balance ?? 0);
        const utilization = limit > 0 ? (balance / limit) * 100 : 0;

        const dueIn = daysUntilDayOfMonth(dueDay);
        if (dueIn >= 0 && dueIn <= 3) {
          const ok = await notifyIfNew(supabase, userId, `payment-due:${card.id}:${dueIn}`, {
            type: "urgent",
            title: "Payment due soon",
            body: `${nickname} minimum payment of $${minPayment.toFixed(2)} is due in ${dueIn} day(s).`,
            action_url: "/cards",
          });
          if (ok) created += 1;
        }

        const closeIn = daysUntilDayOfMonth(closeDay);
        if (closeIn >= 0 && closeIn <= 3) {
          const ok = await notifyIfNew(supabase, userId, `statement-close:${card.id}:${closeIn}`, {
            type: "plan",
            title: "Statement closing soon",
            body: `${nickname} statement closes in ${closeIn} day(s).`,
            action_url: "/cards",
          });
          if (ok) created += 1;
        }

        if (utilization >= 60) {
          const ok = await notifyIfNew(supabase, userId, `utilization:${card.id}`, {
            type: "urgent",
            title: "High utilization",
            body: `${nickname} is at ${utilization.toFixed(0)}% utilization — consider paying down before statement close.`,
            action_url: "/debt-tracker",
          });
          if (ok) created += 1;
        }
      }
    }

    if (users.length < 200) break;
    page += 1;
  }

  return Response.json({ ok: true, processedUsers: processed, notificationsCreated: created });
}
