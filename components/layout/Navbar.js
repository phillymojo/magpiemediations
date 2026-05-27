import Link from 'next/link'
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 h-17 bg-[#12284C] shadow-lg">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-[0_0_0_2px_rgba(255,255,255,0.25)]">
          🐦
        </div>
        <div>
          <span className="block text-white font-bold text-lg leading-tight tracking-wide">
            Magpie Mediations
          </span>
          <span className="block text-[#90AECE] text-[0.6rem] uppercase tracking-widest leading-tight">
            Practitioner-Led ADR
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <ul className="hidden md:flex items-center gap-8">
        <li><Link href="/mediators" className="text-[#A8C0D8] text-sm font-medium hover:text-white transition-colors">Find a Mediator</Link></li>
        <li><span className="text-[#A8C0D8]/40 text-sm font-medium cursor-not-allowed">Pricing</span></li>
        <li><span className="text-[#A8C0D8]/40 text-sm font-medium cursor-not-allowed">Join as Mediator</span></li>
      </ul>

      {/* Auth controls */}
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="redirect">
            <button className="text-[#A8C0D8] text-sm font-medium hover:text-white transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="redirect">
            <button className="bg-[#2B7AB8] text-white text-sm font-semibold px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
              Schedule Now
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton afterSignOutUrl="/" />
        </Show>
      </div>

    </nav>
  )
}
