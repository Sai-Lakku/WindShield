import { cardsRepository } from "../cards/repository.js";
import { goalsRepository } from "../goals/repository.js";
import { lifeEventsRepository } from "../life-events/repository.js";
import { statementRepository } from "../statements/repository.js";

export interface PlanInput {
  userId: string;
}

export interface PlanSnapshot {
  debtFreeDate: string | null;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  months: Array<{
    month: string;
    projectedIncome: number;
    projectedExpenses: number;
    projectedDebt: number;
    goalProgressPercent: number;
  }>;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonths(source: Date, delta: number): Date {
  return new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + delta, 1));
}

function avg(nums: number[], fallback: number): number {
  if (nums.length === 0) return fallback;
  return nums.reduce((sum, val) => sum + val, 0) / nums.length;
}

export const planEngine = {
  // Shared projection model used by timeline, scenarios, recommendations, and goals.
  async generatePlan(input: PlanInput): Promise<PlanSnapshot> {
    const [cards, goals, events, transactions] = await Promise.all([
      cardsRepository.list(input.userId),
      goalsRepository.list(input.userId),
      lifeEventsRepository.list(input.userId),
      statementRepository.getTransactions(input.userId),
    ]);

    const inflows = transactions.filter((tx) => tx.direction === "inflow").map((tx) => tx.amount);
    const outflows = transactions.filter((tx) => tx.direction === "outflow").map((tx) => tx.amount);
    const monthlyIncome = Number(avg(inflows, 3200).toFixed(2));
    const monthlyExpenses = Number(avg(outflows, 2100).toFixed(2));
    const totalDebt = Number(cards.reduce((sum, card) => sum + card.balance, 0).toFixed(2));
    const minimumDebtPayment = cards.reduce((sum, card) => sum + card.minPayment, 0);

    let debtRunning = totalDebt;
    const today = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const current = addMonths(today, i);
      const key = monthKey(current);
      const monthEvents = events.filter((event) => event.date.slice(0, 7) === key);
      const delta = monthEvents.reduce((sum, event) => {
        if (event.type === "income-change") return sum + event.amount;
        return sum - Math.abs(event.amount);
      }, 0);

      const projectedIncome = Number((monthlyIncome + Math.max(delta, 0)).toFixed(2));
      const projectedExpenses = Number((monthlyExpenses + Math.max(-delta, 0)).toFixed(2));
      const debtPayment = Math.max(minimumDebtPayment, (projectedIncome - projectedExpenses) * 0.35);
      debtRunning = Math.max(0, Number((debtRunning - Math.max(0, debtPayment)).toFixed(2)));

      const goalProgressPercent = goals.length
        ? Number(
            (
              goals.reduce((sum, goal) => sum + Math.min(100, (goal.savedAmount / Math.max(goal.targetAmount, 1)) * 100), 0) /
              goals.length
            ).toFixed(2),
          )
        : 0;

      return {
        month: key,
        projectedIncome,
        projectedExpenses,
        projectedDebt: debtRunning,
        goalProgressPercent,
      };
    });

    const debtFreeMonth = months.find((month) => month.projectedDebt <= 0);
    return {
      debtFreeDate: debtFreeMonth ? `${debtFreeMonth.month}-01` : null,
      monthlyIncome,
      monthlyExpenses,
      totalDebt,
      months,
    };
  },

  // Applies one decision (purchase, windfall, event edit) and returns a recalculated plan.
  async applyDecision(input: PlanInput, decision: unknown): Promise<PlanSnapshot> {
    const baseline = await this.generatePlan(input);
    const payload = typeof decision === "object" && decision ? (decision as Record<string, unknown>) : {};
    const amount = Number(payload.amount ?? 0);
    const mode = String(payload.mode ?? "neutral");

    const debtAdjustment = mode === "aggressive" ? amount : mode === "rewarding" ? amount * 0.4 : amount * 0.7;
    const adjustedTotalDebt = Math.max(0, Number((baseline.totalDebt - debtAdjustment).toFixed(2)));

    const adjustedMonths = baseline.months.map((month, index) => ({
      ...month,
      projectedDebt: Math.max(0, Number((month.projectedDebt - debtAdjustment * Math.max(0, 1 - index * 0.08)).toFixed(2))),
    }));
    const debtFreeMonth = adjustedMonths.find((month) => month.projectedDebt <= 0);

    return {
      ...baseline,
      totalDebt: adjustedTotalDebt,
      debtFreeDate: debtFreeMonth ? `${debtFreeMonth.month}-01` : baseline.debtFreeDate,
      months: adjustedMonths,
    };
  },
};
