import { Webhook }      from 'svix'
import { headers }      from 'next/headers'
import { NextResponse } from 'next/server'
import { clerkClient }  from '@clerk/nextjs/server'
import { upsertUser, deleteUser } from '@/lib/db/users'
import { linkMediatorToUser }     from '@/lib/db/mediators'

export async function POST(request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId        = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await request.text()

  let event
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const { type, data } = event

  // Extract primary email — Clerk always provides at least one
  const email     = data.email_addresses?.[0]?.email_address
  const firstName = data.first_name  ?? ''
  const lastName  = data.last_name   ?? ''

  // Log event type only — no PII per constitution Principle I
  console.log(`[clerk-webhook] event=${type}`)

  switch (type) {
    case 'user.created':
      await upsertUser({ id: data.id, email, firstName, lastName })
      // Auto-link to an existing Mediator record by email match (case-insensitive).
      // If linked, flag it in Clerk public metadata so the Navbar can show the
      // "My Portal" link without a DB call on every request.
      if (await linkMediatorToUser({ userId: data.id, email })) {
        const clerk = await clerkClient()
        await clerk.users.updateUser(data.id, {
          publicMetadata: { isMediatorLinked: true },
        })
      }
      break
    case 'user.updated':
      await upsertUser({ id: data.id, email, firstName, lastName })
      break
    case 'user.deleted':
      await deleteUser(data.id)
      break
    default:
      // Unknown event — no-op
      break
  }

  return NextResponse.json({}, { status: 200 })
}
