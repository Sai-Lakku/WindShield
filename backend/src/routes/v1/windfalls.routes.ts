import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { decisionService } from "../../domain/decisions/service.js";
import { impactEngine } from "../../domain/shared/impact-engine.js";
import { planEngine } from "../../domain/shared/plan-engine.js";

export const windfallsRouter = Router();

const windfallSchema = z.object({
  amount: z.number().positive(),
});

// Feature 2.1: Generate 3 allocation options (aggressive, balanced, rewarding).
windfallsRouter.post("/options", async (req, res) => {
  const userId = getUserId(req);
  const payload = windfallSchema.parse(req.body ?? {});
  const baseline = await planEngine.generatePlan({ userId });
  const aggressive = await planEngine.applyDecision({ userId }, { mode: "aggressive", amount: payload.amount });
  const balanced = await planEngine.applyDecision({ userId }, { mode: "balanced", amount: payload.amount });
  const rewarding = await planEngine.applyDecision({ userId }, { mode: "rewarding", amount: payload.amount });
  res.json({
    options: [
      { mode: "aggressive", allocation: { debt: 0.85, savings: 0.1, fun: 0.05 }, impact: impactEngine.comparePlans(baseline, aggressive) },
      { mode: "balanced", allocation: { debt: 0.65, savings: 0.25, fun: 0.1 }, impact: impactEngine.comparePlans(baseline, balanced) },
      { mode: "rewarding", allocation: { debt: 0.5, savings: 0.35, fun: 0.15 }, impact: impactEngine.comparePlans(baseline, rewarding) },
    ],
  });
});

// Feature 2.1 overlap: Chosen windfall split updates plan with same impact pipeline as live editor.
windfallsRouter.post("/apply", async (req, res) => {
  const userId = getUserId(req);
  const decision = await decisionService.log(userId, "windfall", req.body, req.header("idempotency-key") ?? undefined);
  res.json({ applied: true, decision });
});
