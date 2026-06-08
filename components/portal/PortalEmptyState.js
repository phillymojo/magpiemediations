export function PortalEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" role="status">
      <p className="text-lg font-semibold text-slate-800">No bookings yet</p>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        When a party requests a session with you, it will appear here for you to confirm or decline.
      </p>
    </div>
  )
}
