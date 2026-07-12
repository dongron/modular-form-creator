import { type ResourceFilters } from '../api/resources'
import { type SelectOption } from '../design-system'

const PAGE_SIZES = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10

export const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

export const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

export const PAGE_SIZE_OPTIONS: SelectOption[] = PAGE_SIZES.map((size) => ({
  value: String(size),
  label: String(size),
}))

// Normalizes raw URL search params into typed, validated resource filters.
export function parseResourceFilters(searchParams: URLSearchParams): ResourceFilters {
  const status = searchParams.get('status')
  const sortOrder = searchParams.get('sortOrder')
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize'))
  const name = searchParams.get('name')

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    name: name ?? undefined,
    status: status === 'draft' || status === 'completed' ? status : undefined,
    sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
  }
}
