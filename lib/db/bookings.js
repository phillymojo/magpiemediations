import { prisma } from '@/lib/db/client'

export async function createBooking({ userId, mediatorId, sessionType, preferredDate, caseDescription }) {
  return prisma.booking.create({
    data: { userId, mediatorId, sessionType, preferredDate: new Date(preferredDate), caseDescription },
    include: {
      mediator: { select: { id: true, firstName: true, lastName: true, slug: true } },
      user:     { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  })
}

export async function getUserBookings(userId) {
  return prisma.booking.findMany({
    where:   { userId },
    include: { mediator: { select: { firstName: true, lastName: true, slug: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where:   { id },
    include: {
      mediator: { select: { firstName: true, lastName: true, slug: true } },
      user:     { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  })
}
