import Link from 'next/link'

export const metadata = {
  title: 'Magpie Mediations — Practitioner-Led Civil Mediation',
  description: 'Connect with vetted, actively-practicing civil litigators for mediation. Fixed pricing, fully digital workflow.',
}

const STATS = [
  { num: '5+',     lbl: 'Active Jurisdictions' },
  { num: '$1,500', lbl: 'Starting Rate (Half-Day)*' },
  { num: '100%',   lbl: 'Active-Practice Mediators' },
  { num: '48hr',   lbl: 'Avg. Scheduling Time' },
]

const STEPS = [
  { n: '1', title: 'Browse & Select',    body: 'Search our roster of vetted civil litigators by practice area and geography. View full profiles and select your mediator.' },
  { n: '2', title: 'Book & Pay',         body: 'Choose a half-day or full-day session. Set your date, select video or in-person format, and pay securely online — all in one flow.' },
  { n: '3', title: 'Sign Agreements',    body: 'All required documents — mediation agreement, confidentiality provisions, and conflicts disclosure — are executed electronically through the platform.' },
  { n: '4', title: 'Mediate',            body: 'Connect via secure video conference or meet in person. Your mediator — an active civil litigator — facilitates the session with real-world perspective.' },
]

const FEATURES = [
  { icon: '⚖️', title: 'Active Practitioner Neutrals',   body: 'Every mediator on our platform is a currently-licensed, actively-practicing civil litigator — not a retired judge or career ADR professional.' },
  { icon: '💡', title: 'Real-World Litigation Insight',  body: 'Our mediators know what cases are actually settling for today, what judges and juries are doing, and how to bridge the gap between parties\' positions.' },
  { icon: '💳', title: 'Fixed, Transparent Pricing',     body: 'No hourly billing surprises. A single flat rate per half or full day — known upfront, paid at booking.' },
  { icon: '📄', title: 'Paperwork, Handled',             body: 'All required agreements are generated and executed on the platform. No chasing down signatures before the session.' },
  { icon: '📹', title: 'Video or In-Person',             body: 'Conduct your mediation via secure video conference or in person — wherever is most practical for the parties and counsel.' },
  { icon: '🔒', title: 'Verified & Vetted',              body: 'All mediators are verified for active bar status, litigation experience, and clean disciplinary history before joining the roster.' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 py-20 text-center lg:px-12"
        style={{ background: 'linear-gradient(135deg, #0C1E38 0%, #12284C 100%)' }}
      >
        {/* Decorative circle */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full"
          style={{ background: 'rgba(200,144,42,0.10)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#7BBDE8] mb-6"
            style={{ background: 'rgba(43,122,184,0.25)' }}>
            The Practitioner's Mediation Platform
          </span>

          <h1 className="text-4xl font-extrabold leading-tight text-white mb-5 lg:text-5xl">
            Civil Mediation Led by{' '}
            <span className="text-[#7BBDE8]">Active Litigators</span>
            {' '}— Not Retired Judges
          </h1>

          <p className="mx-auto max-w-xl text-lg leading-relaxed text-[#A0AEC0] mb-9">
            Magpie Mediations connects parties to civil litigation with vetted, currently-practicing
            attorneys who understand today's courts, today's juries, and today's settlement landscape.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/mediators"
              className="rounded-lg bg-[#2B7AB8] px-8 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity"
            >
              Schedule a Session
            </Link>
            <Link
              href="/mediators"
              className="rounded-lg border-2 border-white/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Mediators
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 flex flex-wrap justify-center gap-10">
            {STATS.map((s) => (
              <div key={s.lbl} className="text-center">
                <div className="text-3xl font-extrabold text-[#7BBDE8]">{s.num}</div>
                <div className="mt-1 text-xs text-[#A0AEC0]">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2B7AB8] mb-2">How It Works</p>
        <h2 className="text-3xl font-extrabold text-[#12284C] mb-3">From Search to Settlement in Four Steps</h2>
        <p className="text-slate-500 mb-10 max-w-xl leading-relaxed">
          The entire process — mediator selection, agreement execution, payment, and scheduling — is handled on the platform.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl bg-white p-8 shadow-[0_4px_20px_rgba(18,40,76,0.10)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#12284C] text-white font-extrabold text-lg shadow-[0_2px_8px_rgba(18,40,76,0.25)]">
                {s.n}
              </div>
              <h3 className="mb-2 font-bold text-[#12284C]">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Magpie ───────────────────────────────── */}
      <div className="bg-slate-50">
        <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2B7AB8] mb-2">Why Magpie</p>
          <h2 className="text-3xl font-extrabold text-[#12284C] mb-3">Built Different. Built for Litigators.</h2>
          <p className="text-slate-500 mb-10 max-w-xl leading-relaxed">
            We don't recruit retired judges or career mediators. Our neutrals are in the trenches right now.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-8 shadow-[0_4px_20px_rgba(18,40,76,0.10)] border-t-4 border-[#12284C]">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="mb-2 font-bold text-[#12284C]">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2B7AB8] mb-2">Ready?</p>
        <h2 className="text-3xl font-extrabold text-[#12284C] mb-4">Schedule Your Mediation Today</h2>
        <p className="mx-auto max-w-md text-slate-500 leading-relaxed mb-8">
          Flat-rate, practitioner-led mediation — available online or in person, on a schedule that works for your case.
        </p>
        <Link
          href="/mediators"
          className="inline-block rounded-lg bg-[#2B7AB8] px-10 py-4 text-lg font-bold text-white hover:opacity-90 transition-opacity"
        >
          Find a Mediator &amp; Book Now
        </Link>
        <p className="mt-4 text-xs text-slate-400">
          *Placeholder rates. Magpie Mediations LLC is not a law firm and does not provide legal advice.
        </p>
      </section>

    </div>
  )
}
