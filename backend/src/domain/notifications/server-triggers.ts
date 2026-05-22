import { notificationsRepository } from "./repository.js";

/** Replaces legacy SMS triggers: persist in-app notifications for a user. */
export const notificationTriggers = {
  async triggerPaydayCheckin(userId: string, expectedAmount: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "plan",
      title: "Payday check-in",
      body: `Confirm your paycheck landed. Expected amount: $${expectedAmount.toFixed(2)}.`,
      actionUrl: "/forward-plan",
    });
  },

  async triggerPaymentDueSoon(userId: string, cardName: string, daysLeft: number, minPayment: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "urgent",
      title: "Payment due soon",
      body: `${cardName} minimum payment of $${minPayment.toFixed(2)} is due in ${daysLeft} day(s).`,
      actionUrl: "/cards",
    });
  },

  async triggerStatementClosingSoon(userId: string, cardName: string, daysLeft: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "plan",
      title: "Statement closing soon",
      body: `${cardName} statement closes in ${daysLeft} day(s).`,
      actionUrl: "/cards",
    });
  },

  async triggerUtilizationWarning(userId: string, cardName: string, utilization: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "urgent",
      title: "High utilization",
      body: `${cardName} is at ${utilization.toFixed(0)}% utilization — consider paying down before statement close.`,
      actionUrl: "/debt-tracker",
    });
  },

  async triggerGoalMilestone(userId: string, goalName: string, percent: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "goals",
      title: "Goal milestone",
      body: `${goalName} reached ${percent.toFixed(0)}% progress.`,
      actionUrl: "/goals-trips",
    });
  },

  async triggerWeeklySummary(userId: string, debtChange: number, debtFreeDate: string) {
    return notificationsRepository.insertForUser({
      userId,
      type: "plan",
      title: "Weekly summary",
      body: `Debt moved ${debtChange >= 0 ? "+" : ""}$${debtChange.toFixed(2)} this week. Projected debt-free: ${debtFreeDate}.`,
      actionUrl: "/forward-plan",
    });
  },

  async triggerWindfallDetected(userId: string, amount: number) {
    return notificationsRepository.insertForUser({
      userId,
      type: "plan",
      title: "Windfall detected",
      body: `We detected an extra $${amount.toFixed(2)}. Allocate it to stay on plan.`,
      actionUrl: "/scenarios",
    });
  },
};
