/**
 * @jest-environment node
 */
import { POST } from '@/app/api/webhooks/clerk/route'

jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn(),
  })),
}))

jest.mock('@/lib/db/users', () => ({
  upsertUser: jest.fn().mockResolvedValue({}),
  deleteUser:  jest.fn().mockResolvedValue({}),
}))

jest.mock('@/lib/db/mediators', () => ({
  linkMediatorToUser: jest.fn().mockResolvedValue(false),
}))

jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

const { Webhook }                = require('svix')
const { upsertUser, deleteUser } = require('@/lib/db/users')
const { linkMediatorToUser }     = require('@/lib/db/mediators')
const { clerkClient }            = require('@clerk/nextjs/server')
const { headers }                = require('next/headers')

const updateUserMock = jest.fn().mockResolvedValue({})

const SVIX_HEADERS = {
  'svix-id':        'msg_123',
  'svix-timestamp': '1234567890',
  'svix-signature': 'v1,abc123',
}

function makeRequest(body) {
  return {
    text: () => Promise.resolve(JSON.stringify(body)),
  }
}

function mockHeaders(overrides = {}) {
  const map = { ...SVIX_HEADERS, ...overrides }
  headers.mockResolvedValue({ get: (k) => map[k] ?? null })
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
  linkMediatorToUser.mockResolvedValue(false)
  updateUserMock.mockResolvedValue({})
  clerkClient.mockResolvedValue({ users: { updateUser: updateUserMock } })
})

describe('POST /api/webhooks/clerk', () => {
  describe('signature verification', () => {
    it('returns 400 when svix headers are missing', async () => {
      headers.mockResolvedValue({ get: () => null })
      const res = await POST(makeRequest({}))
      expect(res.status).toBe(400)
    })

    it('returns 400 when signature verification fails', async () => {
      mockHeaders()
      Webhook.mockImplementationOnce(() => ({
        verify: jest.fn().mockImplementation(() => { throw new Error('bad sig') }),
      }))
      const res = await POST(makeRequest({}))
      expect(res.status).toBe(400)
    })
  })

  describe('user.created', () => {
    it('calls upsertUser and returns 200', async () => {
      mockHeaders()
      const payload = {
        type: 'user.created',
        data: {
          id: 'user_abc',
          email_addresses: [{ email_address: 'jane@example.com' }],
          first_name: 'Jane',
          last_name:  'Smith',
        },
      }
      Webhook.mockImplementationOnce(() => ({
        verify: jest.fn().mockReturnValue(payload),
      }))
      const res = await POST(makeRequest(payload))
      expect(res.status).toBe(200)
      expect(upsertUser).toHaveBeenCalledWith({
        id:        'user_abc',
        email:     'jane@example.com',
        firstName: 'Jane',
        lastName:  'Smith',
      })
    })

    it('is idempotent — upsertUser called on duplicate events', async () => {
      mockHeaders()
      const payload = {
        type: 'user.created',
        data: {
          id: 'user_abc',
          email_addresses: [{ email_address: 'jane@example.com' }],
          first_name: 'Jane',
          last_name:  'Smith',
        },
      }
      const verifyFn = jest.fn().mockReturnValue(payload)
      Webhook.mockImplementation(() => ({ verify: verifyFn }))

      await POST(makeRequest(payload))
      await POST(makeRequest(payload))

      expect(upsertUser).toHaveBeenCalledTimes(2)
    })
  })

  describe('user.created — mediator auto-linking', () => {
    const payload = {
      type: 'user.created',
      data: {
        id: 'user_med',
        email_addresses: [{ email_address: 'jane@lawfirm.com' }],
        first_name: 'Jane',
        last_name:  'Smith',
      },
    }

    it('sets Clerk metadata when a matching mediator is linked', async () => {
      mockHeaders()
      linkMediatorToUser.mockResolvedValueOnce(true)
      Webhook.mockImplementationOnce(() => ({ verify: jest.fn().mockReturnValue(payload) }))

      const res = await POST(makeRequest(payload))

      expect(res.status).toBe(200)
      expect(linkMediatorToUser).toHaveBeenCalledWith({ userId: 'user_med', email: 'jane@lawfirm.com' })
      expect(updateUserMock).toHaveBeenCalledWith('user_med', {
        publicMetadata: { isMediatorLinked: true },
      })
    })

    it('does not touch Clerk metadata when no matching mediator exists', async () => {
      mockHeaders()
      linkMediatorToUser.mockResolvedValueOnce(false)
      Webhook.mockImplementationOnce(() => ({ verify: jest.fn().mockReturnValue(payload) }))

      const res = await POST(makeRequest(payload))

      expect(res.status).toBe(200)
      expect(linkMediatorToUser).toHaveBeenCalled()
      expect(updateUserMock).not.toHaveBeenCalled()
    })
  })

  describe('user.updated', () => {
    it('calls upsertUser and returns 200', async () => {
      mockHeaders()
      const payload = {
        type: 'user.updated',
        data: {
          id: 'user_abc',
          email_addresses: [{ email_address: 'jane.new@example.com' }],
          first_name: 'Jane',
          last_name:  'Smith',
        },
      }
      Webhook.mockImplementationOnce(() => ({
        verify: jest.fn().mockReturnValue(payload),
      }))
      const res = await POST(makeRequest(payload))
      expect(res.status).toBe(200)
      expect(upsertUser).toHaveBeenCalledWith({
        id:        'user_abc',
        email:     'jane.new@example.com',
        firstName: 'Jane',
        lastName:  'Smith',
      })
    })
  })

  describe('user.deleted', () => {
    it('calls deleteUser and returns 200', async () => {
      mockHeaders()
      const payload = { type: 'user.deleted', data: { id: 'user_abc' } }
      Webhook.mockImplementationOnce(() => ({
        verify: jest.fn().mockReturnValue(payload),
      }))
      const res = await POST(makeRequest(payload))
      expect(res.status).toBe(200)
      expect(deleteUser).toHaveBeenCalledWith('user_abc')
    })
  })

  describe('unknown event type', () => {
    it('returns 200 without calling upsertUser or deleteUser', async () => {
      mockHeaders()
      const payload = { type: 'session.created', data: { id: 'sess_xyz' } }
      Webhook.mockImplementationOnce(() => ({
        verify: jest.fn().mockReturnValue(payload),
      }))
      const res = await POST(makeRequest(payload))
      expect(res.status).toBe(200)
      expect(upsertUser).not.toHaveBeenCalled()
      expect(deleteUser).not.toHaveBeenCalled()
    })
  })
})
