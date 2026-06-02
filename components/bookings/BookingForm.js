'use client'

import { useState } from 'react'
import { createBooking } from '@/lib/actions/bookings'

const SESSION_TYPES = [
  { value: 'HALF_DAY', label: 'Half-Day', duration: '~4 hours', price: '$1,500*' },
  { value: 'FULL_DAY', label: 'Full-Day', duration: '~8 hours', price: '$2,500*' },
]

export function BookingForm({ mediator }) {
  const [sessionType, setSessionType]   = useState('HALF_DAY')
  const [submitting,  setSubmitting]    = useState(false)
  const [fieldErrors, setFieldErrors]   = useState({})
  const [serverError, setServerError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setServerError(null)

    const form = e.currentTarget
    const data = {
      mediatorId:      mediator.id,
      mediatorSlug:    mediator.slug,
      sessionType,
      preferredDate:   form.preferredDate.value,
      caseDescription: form.caseDescription.value,
    }

    const result = await createBooking(data)

    // If we get here, redirect didn't fire — an error was returned
    if (result?.fieldErrors) setFieldErrors(result.fieldErrors)
    if (result?.error)       setServerError(result.error)
    setSubmitting(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Session type */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Session Type</p>
        <div className="grid grid-cols-2 gap-4">
          {SESSION_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSessionType(s.value)}
              className={`rounded-lg border-2 p-5 text-left transition-colors ${
                sessionType === s.value
                  ? 'border-[#12284C] bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-bold text-[#12284C]">{s.label}</p>
              <p className="text-2xl font-extrabold text-[#12284C] my-1">{s.price}</p>
              <p className="text-xs text-slate-500">{s.duration}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">*Placeholder rates. Final pricing subject to change.</p>
      </div>

      {/* Preferred date */}
      <div>
        <label htmlFor="preferredDate" className="block text-sm font-semibold text-slate-700 mb-1">
          Preferred Date
        </label>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          min={today}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#12284C]"
        />
        {fieldErrors.preferredDate && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.preferredDate[0]}</p>
        )}
      </div>

      {/* Case description */}
      <div>
        <label htmlFor="caseDescription" className="block text-sm font-semibold text-slate-700 mb-1">
          Brief Case Description <span className="font-normal text-slate-400">(confidential)</span>
        </label>
        <textarea
          id="caseDescription"
          name="caseDescription"
          rows={4}
          required
          maxLength={2000}
          placeholder="e.g., Personal injury matter — car accident, disputed liability, two parties…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#12284C] resize-y"
        />
        {fieldErrors.caseDescription && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.caseDescription[0]}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[#12284C] px-6 py-3 text-sm font-bold text-white hover:bg-[#1A3A6C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : `Request Session with ${mediator.firstName}`}
      </button>

    </form>
  )
}
