import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requireAuth } from "./middleware/auth.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "windshield-backend" });
});

app.use("/api", requireAuth, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
