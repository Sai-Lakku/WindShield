import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    error: "NotFound",
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
}
