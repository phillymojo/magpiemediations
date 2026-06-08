/**
 * @jest-environment node
 */

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }))
jest.mock('@/lib/db/mediators', () => ({ getMediatorByUserId: jest.fn() }))
jest.mock('@/lib/db/bookings', () => ({ getBookingById: jest.fn(), updateBookingStatus: jest.fn() }))
jest.mock('@/lib/db/auditLog', () => ({ createAuditEntry: jest.fn() }))
jest.mock('@/lib/email/sendStatusEmail', () => ({ sendBookingStatusEmail: jest.fn() }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

const { auth }                = require('@clerk/nextjs/server')
const { getMediatorByUserId } = require('@/lib/db/mediators')
const { getBookingById, updateBookingStatus } = require('@/lib/db/bookings')
const { createAuditEntry }    = require('@/lib/db/auditLog')
const { sendBookingStatusEmail } = require('@/lib/email/sendStatusEmail')

const { acceptBooking, declineBooking } = require('@/lib/actions/portal')

const MEDIATOR = { id: 'med-1', firstName: 'Sarah', lastName: 'Mitchell' }
const PENDING_BOOKING = {
  id: 'booking-1', mediatorId: 'med-1', status: 'PENDING_CONFIRMATION',
  sessionType: 'HALF_DAY', preferredDate: new Date('2026-07-15'),
  user:     { firstName: 'Jane', email: 'jane@example.com' },
  mediator: { firstName: 'Sarah', lastName: 'Mitchell' },
}

beforeEach(() => {
  jest.clearAllMocks()
  auth.mockResolvedValue({ userId: 'user_med' })
  getMediatorByUserId.mockResolvedValue(MEDIATOR)
  getBookingById.mockResolvedValue(PENDING_BOOKING)
  updateBookingStatus.mockResolvedValue({ ...PENDING_BOOKING, status: 'CONFIRMED' })
  createAuditEntry.mockResolvedValue({})
  sendBookingStatusEmail.mockResolvedValue({})
})

describe('acceptBooking', () => {
  it('confirms a pending booking and writes audit entry', async () => {
    const result = await acceptBooking('booking-1')
    expect(updateBookingStatus).toHaveBeenCalledWith('booking-1', 'CONFIRMED')
    expect(createAuditEntry).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'user_med', action: 'booking.confirmed', entityId: 'booking-1', newStatus: 'CONFIRMED',
    }))
    expect(result).toBeUndefined()
  })

  it('returns access denied when user is not a linked mediator', async () => {
    getMediatorByUserId.mockResolvedValueOnce(null)
    const result = await acceptBooking('booking-1')
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects when the booking belongs to another mediator', async () => {
    getBookingById.mockResolvedValueOnce({ ...PENDING_BOOKING, mediatorId: 'med-OTHER' })
    const result = await acceptBooking('booking-1')
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('rejects when the booking is already actioned', async () => {
    getBookingById.mockResolvedValueOnce({ ...PENDING_BOOKING, status: 'CONFIRMED' })
    const result = await acceptBooking('booking-1')
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })

  it('does not throw when email sending fails', async () => {
    sendBookingStatusEmail.mockRejectedValueOnce(new Error('Resend down'))
    await expect(acceptBooking('booking-1')).resolves.not.toThrow()
    expect(updateBookingStatus).toHaveBeenCalled()
  })
})

describe('declineBooking', () => {
  it('cancels a pending booking and writes audit entry', async () => {
    updateBookingStatus.mockResolvedValueOnce({ ...PENDING_BOOKING, status: 'CANCELLED' })
    await declineBooking('booking-1')
    expect(updateBookingStatus).toHaveBeenCalledWith('booking-1', 'CANCELLED')
    expect(createAuditEntry).toHaveBeenCalledWith(expect.objectContaining({
      action: 'booking.declined', newStatus: 'CANCELLED',
    }))
  })

  it('rejects when the booking belongs to another mediator', async () => {
    getBookingById.mockResolvedValueOnce({ ...PENDING_BOOKING, mediatorId: 'med-OTHER' })
    const result = await declineBooking('booking-1')
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(updateBookingStatus).not.toHaveBeenCalled()
  })
})
