import { Request } from "express";

export function getUserId(req: Request): string {
  if (!req.userId) {
    throw new Error("Authenticated user context is missing from request.");
  }
  return req.userId;
}
