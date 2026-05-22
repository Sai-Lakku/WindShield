import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { goalService } from "../../domain/goals/service.js";
import { planEngine } from "../../domain/shared/plan-engine.js";

export const goalsRouter = Router();

const goalSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["trip", "large-purchase", "emergency-fund", "debt-milestone"]),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetAmount: z.number().positive(),
  savedAmount: z.number().nonnegative().optional(),
});

// Feature 2.5: Track trip/goal targets and savings cadence.
goalsRouter.post("/", async (req, res) => {
  const userId = getUserId(req);
  const goal = await goalService.create(userId, goalSchema.parse(req.body), req.header("idempotency-key") ?? undefined);
  res.status(201).json({ goal });
});

// Feature 2.5 overlap: Goal progress is rendered on the same forward timeline model.
goalsRouter.get("/", async (req, res) => {
  const userId = getUserId(req);
  const goals = await goalService.list(userId);
  res.json({ goals });
});

// Feature 2.5 + 2.4 overlap: Goal risk signals should feed proactive warnings.
goalsRouter.get("/risk-signals", async (req, res) => {
  const userId = getUserId(req);
  const goals = await goalService.list(userId);
  const plan = await planEngine.generatePlan({ userId });
  const disposable = plan.monthlyIncome - plan.monthlyExpenses;
  const riskSignals = goals
    .map((goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
      const monthsLeft = Math.max(
        1,
        Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
      );
      const neededPerMonth = remaining / monthsLeft;
      return {
        goalId: goal.id,
        goalName: goal.name,
        neededPerMonth: Number(neededPerMonth.toFixed(2)),
        risk: neededPerMonth > disposable * 0.35 ? "at-risk" : "on-track",
      };
    })
    .filter((signal) => signal.risk === "at-risk");

  res.json({ riskSignals });
});
