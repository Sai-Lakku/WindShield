import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { planEngine } from "../../domain/shared/plan-engine.js";
import { impactEngine } from "../../domain/shared/impact-engine.js";

export const plansRouter = Router();

const decisionSchema = z.object({
  type: z.string().default("manual"),
  amount: z.number().nonnegative().optional(),
  mode: z.string().optional(),
});

// Feature 1.4: Build 12-month forward plan from cards, events, and transaction baselines.
plansRouter.get("/forward", async (req, res) => {
  const userId = getUserId(req);
  const plan = await planEngine.generatePlan({ userId });
  res.json({ plan });
});

// Feature 2.3 overlap: Live impact edits use same model, only with temporary edits.
plansRouter.post("/live-impact", async (req, res) => {
  const userId = getUserId(req);
  const decision = decisionSchema.parse(req.body?.decision ?? {});
  const baseline = await planEngine.generatePlan({ userId });
  const updated = await planEngine.applyDecision({ userId }, decision);
  const impact = impactEngine.comparePlans(baseline, updated);
  res.json({ baseline, updated, impact });
});
