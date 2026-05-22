import { CreateGoalInput, Goal } from "./types.js";
import { supabase } from "../../lib/supabase.js";

function fromRow(row: Record<string, unknown>): Goal {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    type: String(metadata.type ?? "trip") as Goal["type"],
    targetDate: String(row.deadline),
    targetAmount: Number(row.target_value),
    savedAmount: Number(row.current_value),
    createdAt: String(row.created_at),
  };
}

export const goalsRepository = {
  async create(userId: string, input: CreateGoalInput, idempotencyKey?: string): Promise<Goal> {
    if (idempotencyKey) {
      const existing = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing.data) return fromRow(existing.data as Record<string, unknown>);
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        name: input.name,
        target_value: input.targetAmount,
        current_value: input.savedAmount ?? 0,
        deadline: input.targetDate,
        metadata: { type: input.type },
        idempotency_key: idempotencyKey ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(`Failed to create goal: ${error?.message ?? "unknown error"}`);
    return fromRow(data as Record<string, unknown>);
  },

  async list(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId).order("deadline", { ascending: true });
    if (error) throw new Error(`Failed to list goals: ${error.message}`);
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  },

  async update(userId: string, goalId: string, patch: Partial<CreateGoalInput>): Promise<Goal | null> {
    const { data: existing, error: existingError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existingError) throw new Error(`Failed to load goal: ${existingError.message}`);
    if (!existing) return null;

    const metadata = {
      ...((existing.metadata ?? {}) as Record<string, unknown>),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
    };
    const { data, error } = await supabase
      .from("goals")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.targetAmount !== undefined ? { target_value: patch.targetAmount } : {}),
        ...(patch.savedAmount !== undefined ? { current_value: patch.savedAmount } : {}),
        ...(patch.targetDate !== undefined ? { deadline: patch.targetDate } : {}),
        metadata,
      })
      .eq("id", goalId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Failed to update goal: ${error.message}`);
    if (!data) return null;
    return fromRow(data as Record<string, unknown>);
  },
};
