import { prisma } from '@/lib/db/client'

export async function upsertUser({ id, email, firstName, lastName }) {
  return prisma.user.upsert({
    where:  { id },
    update: { email, firstName, lastName },
    create: { id, email, firstName, lastName },
  })
}

export async function deleteUser(id) {
  return prisma.user.delete({ where: { id } })
}
