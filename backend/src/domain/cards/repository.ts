import { Card, CreateCardInput } from "./types.js";
import { supabase } from "../../lib/supabase.js";

function fromRow(row: Record<string, unknown>): Card {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    nickname: String(row.nickname),
    issuer: String(row.issuer) as Card["issuer"],
    network: String(row.network) as Card["network"],
    limit: Number(row.credit_limit),
    balance: Number(row.current_balance),
    apr: Number(row.apr),
    minPayment: Number(row.minimum_payment),
    statementClose: Number(row.statement_close_day),
    paymentDue: Number(row.due_day),
    status: "ACTIVE",
    createdAt: String(row.created_at),
  };
}

export const cardsRepository = {
  async create(userId: string, input: CreateCardInput, idempotencyKey?: string): Promise<Card> {
    if (idempotencyKey) {
      const existing = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing.data) return fromRow(existing.data as Record<string, unknown>);
    }

    const { data, error } = await supabase
      .from("cards")
      .insert({
        user_id: userId,
        nickname: input.nickname,
        issuer: input.issuer,
        network: input.network,
        credit_limit: input.limit,
        current_balance: input.balance,
        apr: input.apr,
        minimum_payment: input.minPayment,
        statement_close_day: input.statementClose,
        due_day: input.paymentDue,
        idempotency_key: idempotencyKey ?? null,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(`Failed to create card: ${error?.message ?? "unknown error"}`);
    return fromRow(data as Record<string, unknown>);
  },

  async list(userId: string): Promise<Card[]> {
    const { data, error } = await supabase.from("cards").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list cards: ${error.message}`);
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  },

  async update(userId: string, cardId: string, patch: Partial<CreateCardInput>): Promise<Card | null> {
    const mapped: Record<string, unknown> = {};
    if (patch.nickname !== undefined) mapped.nickname = patch.nickname;
    if (patch.issuer !== undefined) mapped.issuer = patch.issuer;
    if (patch.network !== undefined) mapped.network = patch.network;
    if (patch.limit !== undefined) mapped.credit_limit = patch.limit;
    if (patch.balance !== undefined) mapped.current_balance = patch.balance;
    if (patch.apr !== undefined) mapped.apr = patch.apr;
    if (patch.minPayment !== undefined) mapped.minimum_payment = patch.minPayment;
    if (patch.statementClose !== undefined) mapped.statement_close_day = patch.statementClose;
    if (patch.paymentDue !== undefined) mapped.due_day = patch.paymentDue;

    const { data, error } = await supabase
      .from("cards")
      .update(mapped)
      .eq("id", cardId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Failed to update card: ${error.message}`);
    if (!data) return null;
    return fromRow(data as Record<string, unknown>);
  },
};
