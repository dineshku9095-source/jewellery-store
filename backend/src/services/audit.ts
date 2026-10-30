import { prisma } from "../lib/prisma";

export async function writeAuditLog(input: {
  adminId: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: (input.metadata ?? undefined) as object | undefined,
    },
  });
}
