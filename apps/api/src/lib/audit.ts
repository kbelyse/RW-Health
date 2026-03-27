import { prisma } from "./prisma.js";

export async function audit(
  userId: string | undefined,
  action: string,
  resource: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        resource,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch {
    /* non-blocking */
  }
}
