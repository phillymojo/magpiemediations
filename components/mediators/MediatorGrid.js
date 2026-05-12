import { MediatorCard } from '@/components/mediators/MediatorCard'
import { EmptyState }   from '@/components/mediators/EmptyState'

// Server component.

/**
 * @param {{
 *   mediators:    object[],
 *   emptyVariant: 'no-results' | 'empty-roster'
 * }} props
 *
 * emptyVariant is determined by the page:
 *   'empty-roster' — no ACTIVE mediators exist at all (pre-launch / all removed)
 *   'no-results'   — filters/search returned nothing
 */
export function MediatorGrid({ mediators, emptyVariant = 'no-results' }) {
  if (mediators.length === 0) {
    return <EmptyState variant={emptyVariant} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {mediators.map((mediator) => (
        <MediatorCard key={mediator.id} mediator={mediator} />
      ))}
    </div>
  )
}
