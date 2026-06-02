import { auth }              from '@clerk/nextjs/server'
import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { getMediatorBySlug } from '@/lib/db/mediators'
import { BookingForm }       from '@/components/bookings/BookingForm'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const mediator = await getMediatorBySlug(slug)
  if (!mediator) return { title: 'Mediator Unavailable — Magpie Mediations' }
  return { title: `Book a Session with ${mediator.firstName} ${mediator.lastName} — Magpie Mediations` }
}

export default async function BookingPage({ params }) {
  const { userId } = await auth()
  if (!userId) {
    const { slug } = await params
    redirect(`/sign-in?redirect_url=/mediators/${slug}/book`)
  }

  const { slug } = await params
  const mediator = await getMediatorBySlug(slug)

  if (!mediator) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">This mediator is no longer available</p>
        <Link href="/mediators" className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">
          ← Back to roster
        </Link>
      </div>
    )
  }

  const fullName = `${mediator.firstName} ${mediator.lastName}`

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Link href={`/mediators/${slug}`} className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
            ← Back to {fullName}'s profile
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Request a Session</h1>
          <p className="mt-1 text-slate-500 text-sm">with {fullName} · {mediator.firm}</p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <BookingForm mediator={mediator} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            Magpie Mediations LLC is a technology platform, not a law firm, and does not
            provide legal advice or legal representation. Mediating attorneys participate
            in their individual capacity as independent neutral contractors.
            Rates shown are placeholders; final pricing subject to change.
          </p>
        </div>
      </footer>
    </div>
  )
}
