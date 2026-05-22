import { createNotification } from "./notifications";

export async function triggerPaydayCheckin(userId: string, expectedAmount: number) {
  await createNotification(
    userId,
    "plan",
    "Payday check-in",
    `Confirm your paycheck landed. Expected amount: $${expectedAmount.toFixed(2)}.`,
    "/forward-plan",
  );
}

export async function triggerPaymentDueSoon(userId: string, cardName: string, daysLeft: number, minPayment: number) {
  await createNotification(
    userId,
    "urgent",
    "Payment due soon",
    `${cardName} minimum payment of $${minPayment.toFixed(2)} is due in ${daysLeft} day(s).`,
    "/cards",
  );
}

export async function triggerStatementClosingSoon(userId: string, cardName: string, daysLeft: number) {
  await createNotification(
    userId,
    "plan",
    "Statement closing soon",
    `${cardName} statement closes in ${daysLeft} day(s).`,
    "/cards",
  );
}

export async function triggerUtilizationWarning(userId: string, cardName: string, utilization: number) {
  await createNotification(
    userId,
    "urgent",
    "High utilization",
    `${cardName} is at ${utilization.toFixed(0)}% utilization — consider paying down before statement close.`,
    "/debt-tracker",
  );
}

export async function triggerGoalMilestone(userId: string, goalName: string, percent: number) {
  await createNotification(
    userId,
    "goals",
    "Goal milestone",
    `${goalName} reached ${percent.toFixed(0)}% progress.`,
    "/goals-trips",
  );
}

export async function triggerWeeklySummary(userId: string, debtChange: number, debtFreeDate: string) {
  await createNotification(
    userId,
    "plan",
    "Weekly summary",
    `Debt moved ${debtChange >= 0 ? "+" : ""}$${debtChange.toFixed(2)} this week. Projected debt-free: ${debtFreeDate}.`,
    "/forward-plan",
  );
}

export async function triggerWindfallDetected(userId: string, amount: number) {
  await createNotification(
    userId,
    "plan",
    "Windfall detected",
    `We detected an extra $${amount.toFixed(2)}. Allocate it to stay on plan.`,
    "/scenarios",
  );
}
