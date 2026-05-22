import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { cardService } from "../../domain/cards/service.js";

export const cardsRouter = Router();

const baseCardSchema = z.object({
  nickname: z.string().min(1),
  issuer: z.enum(["Chase", "Capital One", "Amex", "Discover", "Citi", "Other"]),
  network: z.enum(["Visa", "Mastercard", "Amex", "Discover"]),
  limit: z.number().positive(),
  balance: z.number().nonnegative(),
  apr: z.number().nonnegative(),
  minPayment: z.number().nonnegative(),
  statementClose: z.number().int().min(1).max(31),
  paymentDue: z.number().int().min(1).max(31),
  status: z.enum(["PRIMARY", "AT RISK", "VIRTUAL", "ACTIVE"]).optional(),
});

const createCardSchema = baseCardSchema.superRefine((value, ctx) => {
  if (value.statementClose === value.paymentDue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "statementClose and paymentDue should not be the same day.",
      path: ["paymentDue"],
    });
  }
});

// Feature 1.2: Create card records used by debt tracking and recommendations.
cardsRouter.post("/", async (req, res) => {
  const payload = createCardSchema.parse(req.body);
  const userId = getUserId(req);
  const card = await cardService.create(userId, payload, req.header("idempotency-key") ?? undefined);
  res.status(201).json({ card });
});

// Feature 1.2 overlap: Card utilization feeds both dashboard warnings and plan projections.
cardsRouter.get("/", async (req, res) => {
  const userId = getUserId(req);
  const cards = await cardService.list(userId);
  const totalDebt = cards.reduce((sum, item) => sum + item.balance, 0);
  const totalLimit = cards.reduce((sum, item) => sum + item.limit, 0);
  const utilization = totalLimit > 0 ? Number(((totalDebt / totalLimit) * 100).toFixed(2)) : 0;
  res.json({ cards, totalDebt, utilization });
});

// Feature 1.2 overlap: Card updates should trigger a plan recalculation via shared plan engine.
cardsRouter.patch("/:cardId", async (req, res) => {
  const patch = baseCardSchema.partial().parse(req.body);
  const userId = getUserId(req);
  const updated = await cardService.update(userId, req.params.cardId, patch);
  if (!updated) return res.status(404).json({ error: "CardNotFound" });
  res.json({ card: updated });
});
