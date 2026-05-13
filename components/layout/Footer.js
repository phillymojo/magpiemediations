import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0C1E38] text-[#A0AEC0]">
      <div className="mx-auto max-w-6xl px-6 lg:px-12 py-10">
        <div className="flex flex-wrap justify-between gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base">🐦</div>
              <span className="text-white font-bold text-base">Magpie Mediations</span>
            </div>
            <p className="text-sm leading-relaxed">
              Practitioner-led civil mediation. Active litigators, fixed pricing, fully digital workflow.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-sm font-bold mb-3">Platform</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/mediators" className="text-[#718096] text-sm hover:text-white transition-colors">Find a Mediator</Link></li>
              <li><span className="text-[#718096]/50 text-sm">Book a Session</span></li>
              <li><span className="text-[#718096]/50 text-sm">Pricing</span></li>
            </ul>
          </div>

          {/* Mediators */}
          <div>
            <h4 className="text-white text-sm font-bold mb-3">Mediators</h4>
            <ul className="flex flex-col gap-2">
              <li><span className="text-[#718096]/50 text-sm">Join the Roster</span></li>
              <li><span className="text-[#718096]/50 text-sm">How It Works</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-bold mb-3">Company</h4>
            <ul className="flex flex-col gap-2">
              <li><span className="text-[#718096]/50 text-sm">About Us</span></li>
              <li><span className="text-[#718096]/50 text-sm">Contact</span></li>
              <li><span className="text-[#718096]/50 text-sm">Terms of Service</span></li>
              <li><span className="text-[#718096]/50 text-sm">Privacy Policy</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/10 pt-5 flex flex-wrap justify-between gap-2 text-xs text-[#4A5568]">
          <span>© 2026 Magpie Mediations LLC. Montana Limited Liability Company. All rights reserved.</span>
          <span>hello@magpie-mediations.com</span>
        </div>
        <p className="mt-2 text-xs text-[#4A5568] leading-relaxed">
          Magpie Mediations LLC is a technology platform, not a law firm, and does not provide legal advice or legal representation. Mediating attorneys participate in their individual capacity as independent neutral contractors. Rates shown are placeholders; final pricing subject to change prior to launch.
        </p>
      </div>
    </footer>
  )
}
