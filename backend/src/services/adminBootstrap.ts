import { prisma } from "../lib/prisma";
import * as argon2 from "argon2";
import { config } from "../config";

export async function ensureBootstrapAdmin(): Promise<void> {
  const email = config.adminBootstrapEmail;
  const password = config.adminBootstrapPassword;
  if (!email || !password) return;

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.admin.create({
    data: {
      email,
      passwordHash,
      name: "Store Admin",
    },
  });
  console.log(`Bootstrap admin created: ${email}`);
}
