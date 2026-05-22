import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { notificationTriggers } from "../../domain/notifications/server-triggers.js";

export const notificationsRouter = Router();

const amountSchema = z.object({ expectedAmount: z.number().nonnegative() });
const paymentDueSchema = z.object({
  cardName: z.string().min(1),
  daysLeft: z.number().int().min(0).max(60),
  minPayment: z.number().nonnegative(),
});
const statementSchema = z.object({
  cardName: z.string().min(1),
  daysLeft: z.number().int().min(0).max(60),
});
const utilizationSchema = z.object({
  cardName: z.string().min(1),
  utilization: z.number().min(0).max(200),
});
const goalSchema = z.object({
  goalName: z.string().min(1),
  percent: z.number().min(0).max(100),
});
const weeklySchema = z.object({
  debtChange: z.number(),
  debtFreeDate: z.string().min(1),
});
const windfallSchema = z.object({ amount: z.number().positive() });

notificationsRouter.post("/triggers/payday-checkin", async (req, res) => {
  const userId = getUserId(req);
  const { expectedAmount } = amountSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerPaydayCheckin(userId, expectedAmount);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/payment-due-soon", async (req, res) => {
  const userId = getUserId(req);
  const body = paymentDueSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerPaymentDueSoon(userId, body.cardName, body.daysLeft, body.minPayment);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/statement-closing-soon", async (req, res) => {
  const userId = getUserId(req);
  const body = statementSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerStatementClosingSoon(userId, body.cardName, body.daysLeft);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/utilization-warning", async (req, res) => {
  const userId = getUserId(req);
  const body = utilizationSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerUtilizationWarning(userId, body.cardName, body.utilization);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/goal-milestone", async (req, res) => {
  const userId = getUserId(req);
  const body = goalSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerGoalMilestone(userId, body.goalName, body.percent);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/weekly-summary", async (req, res) => {
  const userId = getUserId(req);
  const body = weeklySchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerWeeklySummary(userId, body.debtChange, body.debtFreeDate);
  res.status(201).json(row);
});

notificationsRouter.post("/triggers/windfall-detected", async (req, res) => {
  const userId = getUserId(req);
  const { amount } = windfallSchema.parse(req.body ?? {});
  const row = await notificationTriggers.triggerWindfallDetected(userId, amount);
  res.status(201).json(row);
});
