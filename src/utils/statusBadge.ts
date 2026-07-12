import { type BadgeVariant } from '../design-system'

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  draft: 'neutral',
  completed: 'success',
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  return STATUS_BADGE_VARIANT[status] ?? 'neutral'
}
