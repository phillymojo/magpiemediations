import { prisma } from '@/lib/db/client'

export async function createAuditEntry({ actorId, action, entityType, entityId, newStatus }) {
  return prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, newStatus },
  })
}
