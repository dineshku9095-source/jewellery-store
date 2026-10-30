import crypto from "crypto";
import { prisma } from "./prisma";

const SESSION_COOKIE = "jewellery_admin_session";
const SESSION_DAYS = 7;

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createAdminSession(
  adminId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  });

  return token;
}

export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.adminSession.deleteMany({ where: { tokenHash } });
}

export async function findAdminBySessionToken(token: string | undefined) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }
  return session.admin;
}

export async function purgeExpiredSessions(): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

export { SESSION_DAYS };
