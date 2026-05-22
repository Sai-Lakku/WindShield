import { supabase } from "../../lib/supabase.js";

export interface DecisionLog {
  id: string;
  userId: string;
  type: "recommendation" | "scenario" | "windfall" | "manual";
  context: string;
  options: unknown;
  chosenOption: string;
  payload: unknown;
  createdAt: string;
}

function fromRow(row: Record<string, unknown>): DecisionLog {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: "manual",
    context: String(row.context),
    options: row.options ?? {},
    chosenOption: String(row.chosen_option ?? ""),
    payload: row.metadata ?? {},
    createdAt: String(row.created_at),
  };
}

export const decisionsRepository = {
  async create(
    userId: string,
    type: DecisionLog["type"],
    payload: unknown,
    idempotencyKey?: string,
  ): Promise<DecisionLog> {
    if (idempotencyKey) {
      const existing = await supabase
        .from("decisions")
        .select("*")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing.data) return fromRow(existing.data as Record<string, unknown>);
    }

    const metadata = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const { data, error } = await supabase
      .from("decisions")
      .insert({
        user_id: userId,
        context: type,
        options: metadata.options ?? {},
        chosen_option: String(metadata.chosenOption ?? metadata.mode ?? "n/a"),
        metadata,
        idempotency_key: idempotencyKey ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(`Failed to create decision: ${error?.message ?? "unknown error"}`);
    return fromRow(data as Record<string, unknown>);
  },

  async list(userId: string): Promise<DecisionLog[]> {
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list decisions: ${error.message}`);
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  },
};
