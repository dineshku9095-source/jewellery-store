import type { Request, Response, NextFunction } from "express";
import { findAdminBySessionToken, sessionCookieName } from "../lib/session";

export interface AuthedRequest extends Request {
  admin?: { id: string; email: string; name: string };
}

export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.[sessionCookieName()];
  const admin = await findAdminBySessionToken(token);
  if (!admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.admin = { id: admin.id, email: admin.email, name: admin.name };
  next();
}
