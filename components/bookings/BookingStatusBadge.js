const STYLES = {
  PENDING_CONFIRMATION: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:            'bg-green-50 text-green-700 border-green-200',
  CANCELLED:            'bg-slate-100 text-slate-500 border-slate-200',
}

const LABELS = {
  PENDING_CONFIRMATION: 'Pending Confirmation',
  CONFIRMED:            'Confirmed',
  CANCELLED:            'Cancelled',
}

export function BookingStatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${STYLES[status] ?? STYLES.PENDING_CONFIRMATION}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
