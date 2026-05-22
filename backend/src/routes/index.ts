import { Router } from "express";
import { cardsRouter } from "./v1/cards.routes.js";
import { statementsRouter } from "./v1/statements.routes.js";
import { lifeEventsRouter } from "./v1/life-events.routes.js";
import { plansRouter } from "./v1/plans.routes.js";
import { recommendationsRouter } from "./v1/recommendations.routes.js";
import { notificationsRouter } from "./v1/notifications.routes.js";
import { scenariosRouter } from "./v1/scenarios.routes.js";
import { windfallsRouter } from "./v1/windfalls.routes.js";
import { goalsRouter } from "./v1/goals.routes.js";

export const apiRouter = Router();
const v1 = Router();

v1.use("/cards", cardsRouter);
v1.use("/statements", statementsRouter);
v1.use("/life-events", lifeEventsRouter);
v1.use("/plans", plansRouter);
v1.use("/recommendations", recommendationsRouter);
v1.use("/notifications", notificationsRouter);
v1.use("/scenarios", scenariosRouter);
v1.use("/windfalls", windfallsRouter);
v1.use("/goals", goalsRouter);

apiRouter.use("/v1", v1);
