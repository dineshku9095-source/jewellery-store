import type { Request, Response, NextFunction } from "express";
import { doubleCsrf } from "csrf-csrf";
import { config } from "../config";

const { generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => config.sessionSecret,
  cookieName: "jewellery_csrf",
  cookieOptions: {
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    httpOnly: true,
  },
  getSessionIdentifier: (req) =>
    req.cookies?.jewellery_admin_session ?? "anonymous",
});

export { generateToken, validateRequest };

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  doubleCsrfProtection(req, res, next);
}

export function attachCsrfToken(req: Request, res: Response): string {
  return generateToken(req, res);
}
