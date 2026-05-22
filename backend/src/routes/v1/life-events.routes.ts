import { Router } from "express";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { lifeEventsRepository } from "../../domain/life-events/repository.js";

export const lifeEventsRouter = Router();

const eventSchema = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
  type: z.enum(["expense", "goal", "income-change"]),
});

// Feature 1.3: Capture life events/goals that become timeline inputs.
lifeEventsRouter.post("/", async (req, res) => {
  const userId = getUserId(req);
  const event = await lifeEventsRepository.create(
    userId,
    eventSchema.parse(req.body),
    req.header("idempotency-key") ?? undefined,
  );
  res.status(201).json({ event });
});

// Feature 1.3 + 1.4 overlap: Timeline reads these exact records as projection markers.
lifeEventsRouter.get("/", async (req, res) => {
  const userId = getUserId(req);
  const lifeEvents = await lifeEventsRepository.list(userId);
  res.json({ lifeEvents });
});

// Feature 1.3 overlap: Event edits should re-run plan generation immediately.
lifeEventsRouter.patch("/:eventId", async (req, res) => {
  const userId = getUserId(req);
  const event = await lifeEventsRepository.update(userId, req.params.eventId, eventSchema.partial().parse(req.body));
  if (!event) return res.status(404).json({ error: "LifeEventNotFound" });
  res.json({ event });
});

lifeEventsRouter.delete("/:eventId", async (req, res) => {
  const userId = getUserId(req);
  const removed = await lifeEventsRepository.remove(userId, req.params.eventId);
  if (!removed) return res.status(404).json({ error: "LifeEventNotFound" });
  res.status(204).send();
});
