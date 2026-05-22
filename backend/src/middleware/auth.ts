import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

const jwks = createRemoteJWKSet(new URL(`${env.supabaseUrl}/auth/v1/.well-known/jwks.json`));

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing bearer token." });
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${env.supabaseUrl}/auth/v1`,
      audience: "authenticated",
    });
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!sub) return res.status(401).json({ error: "Unauthorized", message: "Token missing subject." });
    req.userId = sub;
    req.accessToken = token;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token." });
  }
}
