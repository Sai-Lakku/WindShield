import { getSupabase } from "./supabase";

export type NotificationType = "urgent" | "plan" | "goals";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

async function requireMatchingUser(expectedUserId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  if (data.user.id !== expectedUserId) throw new Error("User mismatch");
  return { supabase, user: data.user };
}

/** Lists notifications for the signed-in user (RLS enforces row scope). */
export async function getNotifications(_expectedUserId: string): Promise<NotificationRow[]> {
  const { supabase, user } = await requireMatchingUser(_expectedUserId);
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  if (error) throw error;
}

export async function markAllAsRead(_expectedUserId: string): Promise<void> {
  const { supabase } = await requireMatchingUser(_expectedUserId);
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (error) throw error;
}

export async function createNotification(
  expectedUserId: string,
  type: NotificationType,
  title: string,
  body: string,
  actionUrl?: string | null,
): Promise<void> {
  const { supabase, user } = await requireMatchingUser(expectedUserId);
  const { error } = await supabase.from("notifications").insert({
    user_id: user.id,
    type,
    title,
    body,
    action_url: actionUrl ?? null,
    is_read: false,
    metadata: {},
  });
  if (error) throw error;
}
