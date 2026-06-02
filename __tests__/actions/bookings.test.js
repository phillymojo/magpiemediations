/**
 * @jest-environment node
 */

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/db/bookings', () => ({
  createBooking: jest.fn(),
}))

jest.mock('@/lib/db/auditLog', () => ({
  createAuditEntry: jest.fn(),
}))

jest.mock('@/lib/email/sendBookingEmails', () => ({
  sendBookingEmails: jest.fn(),
}))

jest.mock('@/lib/db/mediators', () => ({
  getMediatorBySlug: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const { auth }                       = require('@clerk/nextjs/server')
const { createBooking }              = require('@/lib/db/bookings')
const { createAuditEntry }           = require('@/lib/db/auditLog')
const { sendBookingEmails }          = require('@/lib/email/sendBookingEmails')
const { getMediatorBySlug }          = require('@/lib/db/mediators')
const { redirect }                   = require('next/navigation')

const ACTIVE_MEDIATOR = {
  id: 'med-1', firstName: 'Sarah', lastName: 'Mitchell', slug: 'sarah-mitchell-595d',
  verificationStatus: 'ACTIVE', email: null,
}

const MOCK_BOOKING = {
  id: 'booking-1', userId: 'user_abc', mediatorId: 'med-1',
  sessionType: 'HALF_DAY', preferredDate: new Date('2026-07-15'),
  status: 'PENDING_CONFIRMATION',
  user:     { id: 'user_abc', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  mediator: { id: 'med-1', firstName: 'Sarah', lastName: 'Mitchell', slug: 'sarah-mitchell-595d' },
}

const VALID_FORM_DATA = {
  mediatorId:      'med-1',
  mediatorSlug:    'sarah-mitchell-595d',
  sessionType:     'HALF_DAY',
  preferredDate:   '2026-07-15',
  caseDescription: 'Personal injury matter, disputed liability.',
}

beforeEach(() => {
  jest.clearAllMocks()
  auth.mockResolvedValue({ userId: 'user_abc' })
  getMediatorBySlug.mockResolvedValue(ACTIVE_MEDIATOR)
  createBooking.mockResolvedValue(MOCK_BOOKING)
  createAuditEntry.mockResolvedValue({})
  sendBookingEmails.mockResolvedValue({})
})

// Lazy import so mocks are in place first
async function getAction() {
  jest.resetModules()
  // Re-apply mocks after resetModules
  jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn().mockResolvedValue({ userId: 'user_abc' }) }))
  jest.mock('@/lib/db/bookings', () => ({ createBooking: jest.fn().mockResolvedValue(MOCK_BOOKING) }))
  jest.mock('@/lib/db/auditLog', () => ({ createAuditEntry: jest.fn().mockResolvedValue({}) }))
  jest.mock('@/lib/email/sendBookingEmails', () => ({ sendBookingEmails: jest.fn().mockResolvedValue({}) }))
  jest.mock('@/lib/db/mediators', () => ({ getMediatorBySlug: jest.fn().mockResolvedValue(ACTIVE_MEDIATOR) }))
  jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
  const mod = await import('@/lib/actions/bookings')
  return mod.createBooking
}

describe('createBooking Server Action', () => {
  it('redirects to sign-in when not authenticated', async () => {
    auth.mockResolvedValueOnce({ userId: null })
    const { createBooking: action } = await import('@/lib/actions/bookings')
    await action(VALID_FORM_DATA)
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining('/sign-in'))
  })

  it('returns error when mediator is not found (not ACTIVE or does not exist)', async () => {
    getMediatorBySlug.mockResolvedValueOnce(null)
    const { createBooking: action } = await import('@/lib/actions/bookings')
    const result = await action(VALID_FORM_DATA)
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('returns error when mediator does not exist', async () => {
    getMediatorBySlug.mockResolvedValueOnce(null)
    const { createBooking: action } = await import('@/lib/actions/bookings')
    const result = await action(VALID_FORM_DATA)
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('returns validation error when required fields are missing', async () => {
    const { createBooking: action } = await import('@/lib/actions/bookings')
    const result = await action({ ...VALID_FORM_DATA, caseDescription: '' })
    expect(result).toMatchObject({ fieldErrors: expect.any(Object) })
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('returns validation error when date is in the past', async () => {
    const { createBooking: action } = await import('@/lib/actions/bookings')
    const result = await action({ ...VALID_FORM_DATA, preferredDate: '2020-01-01' })
    expect(result).toMatchObject({ fieldErrors: expect.any(Object) })
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('creates booking and writes audit log on success', async () => {
    const { createBooking: action } = await import('@/lib/actions/bookings')
    await action(VALID_FORM_DATA)
    expect(createBooking).toHaveBeenCalledWith(expect.objectContaining({
      userId:      'user_abc',
      mediatorId:  'med-1',
      sessionType: 'HALF_DAY',
    }))
    expect(createAuditEntry).toHaveBeenCalledWith(expect.objectContaining({
      actorId:    'user_abc',
      action:     'booking.created',
      entityType: 'Booking',
      entityId:   'booking-1',
      newStatus:  'PENDING_CONFIRMATION',
    }))
  })

  it('redirects to confirmation page on success', async () => {
    const { createBooking: action } = await import('@/lib/actions/bookings')
    await action(VALID_FORM_DATA)
    expect(redirect).toHaveBeenCalledWith('/bookings/booking-1/confirmation')
  })

  it('does not throw when email sending fails', async () => {
    sendBookingEmails.mockRejectedValueOnce(new Error('Resend API error'))
    const { createBooking: action } = await import('@/lib/actions/bookings')
    // Should not throw — email failure is fire-and-forget
    await expect(action(VALID_FORM_DATA)).resolves.not.toThrow()
    expect(createBooking).toHaveBeenCalled()
  })
})
