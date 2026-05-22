import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid request payload.",
      details: err.issues,
    });
  }
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({
    error: "InternalServerError",
    message,
  });
}
