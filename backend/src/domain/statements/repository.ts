import { supabase } from "../../lib/supabase.js";
import { NormalizedTransaction, RecurringCharge } from "./types.js";

function toTransactionRow(tx: NormalizedTransaction) {
  return {
    id: tx.id,
    user_id: tx.userId,
    date: tx.date,
    posted_at: tx.postedAt,
    description: tx.description,
    merchant: tx.merchant,
    category: tx.category,
    amount: tx.amount,
    direction: tx.direction,
    currency: tx.currency,
    source: tx.source,
  };
}

function fromTransactionRow(row: Record<string, unknown>): NormalizedTransaction {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    date: String(row.date),
    postedAt: String(row.posted_at),
    description: String(row.description),
    merchant: String(row.merchant),
    category: String(row.category),
    amount: Number(row.amount),
    direction: String(row.direction) === "outflow" ? "outflow" : "inflow",
    currency: String(row.currency),
    source: "csv",
  };
}

function toRecurringRow(userId: string, item: RecurringCharge) {
  return {
    user_id: userId,
    merchant: item.merchant,
    category: item.category,
    average_amount: item.averageAmount,
    occurrences: item.occurrences,
    cadence_days: item.cadenceDays,
    last_seen_at: item.lastSeenAt,
  };
}

function fromRecurringRow(row: Record<string, unknown>): RecurringCharge {
  return {
    merchant: String(row.merchant),
    category: String(row.category),
    averageAmount: Number(row.average_amount),
    occurrences: Number(row.occurrences),
    cadenceDays: Number(row.cadence_days),
    lastSeenAt: String(row.last_seen_at),
  };
}

export const statementRepository = {
  async saveTransactions(userId: string, transactions: NormalizedTransaction[]) {
    const rows = transactions.map(toTransactionRow);
    const { error } = await supabase.from("transactions").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`Failed to save transactions: ${error.message}`);
  },

  async getTransactions(userId: string): Promise<NormalizedTransaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("posted_at", { ascending: false });

    if (error || !data) throw new Error(`Failed to get transactions: ${error?.message ?? "no data"}`);
    return data.map((row) => fromTransactionRow(row as Record<string, unknown>));
  },

  async saveRecurring(userId: string, recurring: RecurringCharge[]) {
    const { error: deleteError } = await supabase.from("recurring_charges").delete().eq("user_id", userId);
    if (deleteError) throw new Error(`Failed to clear recurring charges: ${deleteError.message}`);

    if (recurring.length === 0) return;
    const rows = recurring.map((item) => toRecurringRow(userId, item));
    const { error: insertError } = await supabase.from("recurring_charges").insert(rows);
    if (insertError) throw new Error(`Failed to save recurring charges: ${insertError.message}`);
  },

  async getRecurring(userId: string): Promise<RecurringCharge[]> {
    const { data, error } = await supabase
      .from("recurring_charges")
      .select("*")
      .eq("user_id", userId)
      .order("average_amount", { ascending: false });

    if (error || !data) throw new Error(`Failed to get recurring charges: ${error?.message ?? "no data"}`);
    return data.map((row) => fromRecurringRow(row as Record<string, unknown>));
  },
};
