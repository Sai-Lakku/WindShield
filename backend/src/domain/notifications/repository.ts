import { supabase } from "../../lib/supabase.js";

export type NotificationType = "urgent" | "plan" | "goals";

/** Server-side inserts (service role) for cron and API triggers. */
export const notificationsRepository = {
  async insertForUser(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        action_url: input.actionUrl ?? null,
        is_read: false,
        metadata: input.metadata ?? {},
      })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return data as { id: string };
  },
};
