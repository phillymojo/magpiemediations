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

/**
 * Fetch all bookings assigned to a mediator for the portal.
 * Deliberately excludes caseDescription — privileged content per constitution
 * Principle I. The mediator portal never displays case content.
 */
export async function getBookingsForMediator(mediatorId) {
  return prisma.booking.findMany({
    where:  { mediatorId },
    select: {
      id:            true,
      sessionType:   true,
      preferredDate: true,
      status:        true,
      createdAt:     true,
      user:          { select: { firstName: true } },
    },
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

export async function updateBookingStatus(id, status) {
  return prisma.booking.update({
    where: { id },
    data:  { status },
  })
}
