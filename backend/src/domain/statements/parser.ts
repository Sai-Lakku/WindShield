import { parse } from "csv-parse/sync";
import { NormalizedTransaction, RecurringCharge, StatementSummary } from "./types.js";

type CsvRecord = Record<string, string>;

function detectDelimiter(sample: string): "," | ";" | "\t" {
  const comma = (sample.match(/,/g) ?? []).length;
  const semicolon = (sample.match(/;/g) ?? []).length;
  const tab = (sample.match(/\t/g) ?? []).length;
  if (semicolon > comma && semicolon > tab) return ";";
  if (tab > comma && tab > semicolon) return "\t";
  return ",";
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function detectCategory(description: string): string {
  const text = description.toLowerCase();
  if (/(rent|mortgage|landlord)/.test(text)) return "housing";
  if (/(uber|lyft|shell|chevron|exxon|gas)/.test(text)) return "transport";
  if (/(netflix|spotify|hulu|prime|subscription|gym)/.test(text)) return "subscription";
  if (/(payroll|salary|direct deposit|deposit)/.test(text)) return "income";
  if (/(whole foods|trader joe|kroger|market|grocery)/.test(text)) return "groceries";
  if (/(restaurant|cafe|coffee|doordash|uber eats)/.test(text)) return "dining";
  if (/(tuition|college|school|university)/.test(text)) return "education";
  return "other";
}

function parseDate(raw: string): Date {
  const value = raw.trim();
  const normalized = value.replace(/\//g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toMerchant(description: string): string {
  return description
    .replace(/\s+/g, " ")
    .replace(/[0-9#*]+/g, "")
    .trim()
    .slice(0, 48)
    .toLowerCase();
}

function pickValue(record: CsvRecord, keys: string[]): string {
  const lowered = Object.fromEntries(Object.entries(record).map(([k, v]) => [k.toLowerCase().trim(), String(v ?? "")]));
  for (const key of keys) {
    const value = lowered[key];
    if (value && value.trim().length > 0) return value;
  }
  return "";
}

export function parseCsvTransactions(input: {
  userId: string;
  fileBuffer: Buffer;
}): NormalizedTransaction[] {
  const content = input.fileBuffer.toString("utf8");
  const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter,
    trim: true,
  }) as CsvRecord[];

  return rows.map((row, index) => {
    const description = pickValue(row, ["description", "merchant", "name", "memo", "details"]) || "Unknown transaction";
    const amountRaw =
      pickValue(row, ["amount", "transaction amount", "value"]) ||
      pickValue(row, ["debit"]) ||
      pickValue(row, ["credit"]);
    const amount = parseAmount(amountRaw);
    const debit = pickValue(row, ["debit"]);
    const credit = pickValue(row, ["credit"]);

    let direction: "inflow" | "outflow" = amount < 0 ? "outflow" : "inflow";
    if (debit) direction = "outflow";
    if (credit) direction = "inflow";

    const dateValue = pickValue(row, ["date", "posted date", "transaction date"]);
    const parsedDate = parseDate(dateValue || new Date().toISOString());

    return {
      id: `${input.userId}-txn-${index + 1}`,
      userId: input.userId,
      date: parsedDate.toISOString().slice(0, 10),
      postedAt: parsedDate.toISOString(),
      description,
      merchant: toMerchant(description),
      category: detectCategory(description),
      amount: Math.abs(amount),
      direction,
      currency: "USD",
      source: "csv",
    };
  });
}

export function detectRecurringCharges(transactions: NormalizedTransaction[]): RecurringCharge[] {
  const outflows = transactions.filter((tx) => tx.direction === "outflow");
  const grouped = new Map<string, NormalizedTransaction[]>();

  for (const tx of outflows) {
    const bucketKey = `${tx.merchant}|${Math.round(tx.amount)}`;
    const bucket = grouped.get(bucketKey) ?? [];
    bucket.push(tx);
    grouped.set(bucketKey, bucket);
  }

  const recurring: RecurringCharge[] = [];
  for (const bucket of grouped.values()) {
    if (bucket.length < 2) continue;
    const sorted = [...bucket].sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = new Date(sorted[i - 1].postedAt).getTime();
      const curr = new Date(sorted[i].postedAt).getTime();
      gaps.push(Math.round((curr - prev) / (1000 * 60 * 60 * 24)));
    }
    const averageGap = gaps.reduce((acc, value) => acc + value, 0) / (gaps.length || 1);
    if (averageGap < 20 || averageGap > 40) continue;

    recurring.push({
      merchant: sorted[0].merchant,
      category: sorted[0].category,
      averageAmount: Number((sorted.reduce((sum, tx) => sum + tx.amount, 0) / sorted.length).toFixed(2)),
      occurrences: sorted.length,
      cadenceDays: Math.round(averageGap),
      lastSeenAt: sorted[sorted.length - 1].postedAt,
    });
  }

  return recurring.sort((a, b) => b.averageAmount - a.averageAmount);
}

export function summarizeTransactions(transactions: NormalizedTransaction[], recurring: RecurringCharge[]): StatementSummary {
  const recurringMerchants = new Set(recurring.map((item) => item.merchant));
  let totalIn = 0;
  let totalOut = 0;
  let recurringTotal = 0;

  for (const tx of transactions) {
    if (tx.direction === "inflow") totalIn += tx.amount;
    if (tx.direction === "outflow") {
      totalOut += tx.amount;
      if (recurringMerchants.has(tx.merchant)) recurringTotal += tx.amount;
    }
  }

  return {
    totalIn: Number(totalIn.toFixed(2)),
    totalOut: Number(totalOut.toFixed(2)),
    recurringTotal: Number(recurringTotal.toFixed(2)),
    variableTotal: Number((totalOut - recurringTotal).toFixed(2)),
  };
}
