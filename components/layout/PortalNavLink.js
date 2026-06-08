'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

// Shows the "My Portal" link only for users linked to a Mediator record.
// Reads Clerk public metadata (set at link time) — no DB call needed.
export function PortalNavLink() {
  const { user } = useUser()
  if (!user?.publicMetadata?.isMediatorLinked) return null

  return (
    <Link href="/portal" className="text-[#A8C0D8] text-sm font-medium hover:text-white transition-colors">
      My Portal
    </Link>
  )
}
