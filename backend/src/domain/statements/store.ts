import { NormalizedTransaction, RecurringCharge } from "./types.js";

interface StatementStoreShape {
  transactionsByUser: Map<string, NormalizedTransaction[]>;
  recurringByUser: Map<string, RecurringCharge[]>;
}

const store: StatementStoreShape = {
  transactionsByUser: new Map(),
  recurringByUser: new Map(),
};

export const statementStore = {
  setTransactions(userId: string, transactions: NormalizedTransaction[]) {
    store.transactionsByUser.set(userId, transactions);
  },

  getTransactions(userId: string): NormalizedTransaction[] {
    return store.transactionsByUser.get(userId) ?? [];
  },

  setRecurring(userId: string, recurring: RecurringCharge[]) {
    store.recurringByUser.set(userId, recurring);
  },

  getRecurring(userId: string): RecurringCharge[] {
    return store.recurringByUser.get(userId) ?? [];
  },
};
