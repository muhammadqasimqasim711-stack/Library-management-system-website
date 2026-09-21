import { prisma } from "./prisma";

export interface LogAuditOptions {
  actorId?: string;
  actorName: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  result?: "SUCCESS" | "FAILURE";
  ipAddress?: string;
}

export async function logAudit(options: LogAuditOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: options.actorId || null,
        actorName: options.actorName,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId || null,
        oldValue: options.oldValue ? JSON.stringify(options.oldValue) : null,
        newValue: options.newValue ? JSON.stringify(options.newValue) : null,
        result: options.result || "SUCCESS",
        ipAddress: options.ipAddress || "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("Audit log failed to persist:", err);
    return null;
  }
}
