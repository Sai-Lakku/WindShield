export type TransactionDirection = "inflow" | "outflow";

export interface NormalizedTransaction {
  id: string;
  userId: string;
  date: string;
  postedAt: string;
  description: string;
  merchant: string;
  category: string;
  amount: number;
  direction: TransactionDirection;
  currency: string;
  source: "csv";
}

export interface RecurringCharge {
  merchant: string;
  category: string;
  averageAmount: number;
  occurrences: number;
  cadenceDays: number;
  lastSeenAt: string;
}

export interface StatementSummary {
  totalIn: number;
  totalOut: number;
  recurringTotal: number;
  variableTotal: number;
}
