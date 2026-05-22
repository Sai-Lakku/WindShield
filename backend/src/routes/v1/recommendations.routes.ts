import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { decisionService } from "../../domain/decisions/service.js";
import { recommendationsService } from "../../domain/recommendations/service.js";

export const recommendationsRouter = Router();

const purchaseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().optional(),
});

// Feature 1.6: Planned purchase card recommendation using card + timing + forward-plan context.
recommendationsRouter.post("/planned-purchase", async (req, res) => {
  const userId = getUserId(req);
  const payload = purchaseSchema.parse(req.body ?? {});
  const result = await recommendationsService.recommend({ userId, ...payload });
  res.json(result);
});

// Feature 1.6: Spot-pay recommendation entrypoint after OCR extracts merchant + amount.
recommendationsRouter.post("/spot-pay", async (req, res) => {
  const userId = getUserId(req);
  const payload = purchaseSchema.parse(req.body ?? {});
  const result = await recommendationsService.recommend({ userId, ...payload });
  res.json({ ...result, source: "spot-pay" });
});

// Feature 1.6 overlap: Accepted recommendation must log decision and update plan model.
recommendationsRouter.post("/decisions", async (req, res) => {
  const userId = getUserId(req);
  const decision = await decisionService.log(
    userId,
    "recommendation",
    req.body,
    req.header("idempotency-key") ?? undefined,
  );
  res.status(201).json({ decision });
});
