import { CreateLifeEventInput, LifeEvent } from "./types.js";
import { supabase } from "../../lib/supabase.js";

function fromRow(row: Record<string, unknown>): LifeEvent {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(metadata.name ?? "Life Event"),
    date: String(row.event_date),
    amount: Number(metadata.amount ?? 0),
    type: String(row.type) as LifeEvent["type"],
    createdAt: String(row.created_at),
  };
}

export const lifeEventsRepository = {
  async create(userId: string, input: CreateLifeEventInput, idempotencyKey?: string): Promise<LifeEvent> {
    if (idempotencyKey) {
      const existing = await supabase
        .from("life_events")
        .select("*")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing.data) return fromRow(existing.data as Record<string, unknown>);
    }

    const { data, error } = await supabase
      .from("life_events")
      .insert({
        user_id: userId,
        type: input.type,
        event_date: input.date,
        metadata: { name: input.name, amount: input.amount },
        idempotency_key: idempotencyKey ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(`Failed to create life event: ${error?.message ?? "unknown error"}`);
    return fromRow(data as Record<string, unknown>);
  },

  async list(userId: string): Promise<LifeEvent[]> {
    const { data, error } = await supabase
      .from("life_events")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: true });
    if (error) throw new Error(`Failed to list life events: ${error.message}`);
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  },

  async update(userId: string, eventId: string, patch: Partial<CreateLifeEventInput>): Promise<LifeEvent | null> {
    const { data: existing, error: existingError } = await supabase
      .from("life_events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existingError) throw new Error(`Failed to load life event: ${existingError.message}`);
    if (!existing) return null;

    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>;
    const metadata = {
      ...existingMeta,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
    };

    const { data, error } = await supabase
      .from("life_events")
      .update({
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.date !== undefined ? { event_date: patch.date } : {}),
        metadata,
      })
      .eq("id", eventId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Failed to update life event: ${error.message}`);
    if (!data) return null;
    return fromRow(data as Record<string, unknown>);
  },

  async remove(userId: string, eventId: string): Promise<boolean> {
    const { error, count } = await supabase
      .from("life_events")
      .delete({ count: "exact" })
      .eq("id", eventId)
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to remove life event: ${error.message}`);
    return (count ?? 0) > 0;
  },
};
