import { PlanSnapshot } from "./plan-engine.js";

export interface ImpactComparison {
  baselineDebtFreeDate: string | null;
  updatedDebtFreeDate: string | null;
  interestDelta: number;
  breathingRoomDelta: number;
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const impactEngine = {
  // Shared impact calculator for windfalls, live edits, and scenario simulation.
  comparePlans(baseline: PlanSnapshot, updated: PlanSnapshot): ImpactComparison {
    const baselineDebtDate = toDate(baseline.debtFreeDate);
    const updatedDebtDate = toDate(updated.debtFreeDate);
    const daysDelta =
      baselineDebtDate && updatedDebtDate
        ? Math.round((baselineDebtDate.getTime() - updatedDebtDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const debtReduction = baseline.totalDebt - updated.totalDebt;
    const estimatedInterestSaved = Number((debtReduction * 0.18 * 0.5).toFixed(2));

    return {
      baselineDebtFreeDate: baseline.debtFreeDate,
      updatedDebtFreeDate: updated.debtFreeDate,
      interestDelta: estimatedInterestSaved,
      breathingRoomDelta: Number((daysDelta / 30).toFixed(2)),
    };
  },
};
