import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { decisionService } from "../../domain/decisions/service.js";
import { impactEngine } from "../../domain/shared/impact-engine.js";
import { planEngine } from "../../domain/shared/plan-engine.js";

export const scenariosRouter = Router();

const scenarioSchema = z.object({
  amount: z.number().optional().default(0),
  mode: z.enum(["aggressive", "balanced", "rewarding"]).default("balanced"),
  summary: z.string().optional(),
});

// Feature 2.2: Run "what-if" simulations against the same forward-plan model.
scenariosRouter.post("/simulate", async (req, res) => {
  const userId = getUserId(req);
  const scenario = scenarioSchema.parse(req.body?.scenario ?? {});
  const baseline = await planEngine.generatePlan({ userId });
  const simulated = await planEngine.applyDecision({ userId }, scenario);
  const impact = impactEngine.comparePlans(baseline, simulated);
  res.json({ baseline, simulated, impact });
});

// Feature 2.2 overlap: Accepting a scenario should promote it to the active plan inputs.
scenariosRouter.post("/accept", async (req, res) => {
  const userId = getUserId(req);
  const scenario = scenarioSchema.parse(req.body?.scenario ?? {});
  const decision = await decisionService.log(userId, "scenario", scenario, req.header("idempotency-key") ?? undefined);
  res.json({ accepted: true, decision });
});
