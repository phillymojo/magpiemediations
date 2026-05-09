import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Server component — no interactivity; entire card is a link to the mediator
// detail / booking entry point.

/**
 * @param {{ mediator: {
 *   id: string, firstName: string, lastName: string, firm: string,
 *   city: string, state: string, yearsOfPractice: number,
 *   practiceAreas: { name: string, slug: string }[]
 * }}} props
 */
export function MediatorCard({ mediator }) {
  const { slug, firstName, lastName, firm, city, state, yearsOfPractice, practiceAreas } = mediator
  const initials  = `${firstName[0]}${lastName[0]}`.toUpperCase()
  const fullName  = `${firstName} ${lastName}`
  const location  = `${city}, ${state}`

  return (
    <Link
      href={`/mediators/${slug}`}
      aria-label={`View profile and book a session with ${fullName}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex flex-col gap-4 p-6">

          {/* Avatar + name */}
          <div className="flex items-start gap-4">
            {/* Fixed navy background per design — custom branding pass will
                move this to a CSS variable once the design system is finalised */}
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#12284C' }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{fullName}</p>
              <p className="truncate text-sm text-slate-500">{firm}</p>
              <p className="truncate text-sm text-slate-500">{location}</p>
            </div>
          </div>

          {/* Practice area tags */}
          {practiceAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {practiceAreas.map((pa) => (
                <Badge key={pa.slug} variant="secondary">
                  {pa.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Years of practice */}
          <p className="mt-auto text-xs text-slate-500">
            {yearsOfPractice} {yearsOfPractice === 1 ? 'yr' : 'yrs'} civil practice
          </p>

        </CardContent>
      </Card>
    </Link>
  )
}
