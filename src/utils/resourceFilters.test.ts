import { describe, it, expect } from 'vitest'
import { parseResourceFilters } from './resourceFilters'

describe('parseResourceFilters', () => {
  it('returns defaults for empty params', () => {
    expect(parseResourceFilters(new URLSearchParams())).toEqual({
      page: 1,
      pageSize: 10,
      name: undefined,
      status: undefined,
      sortOrder: undefined,
    })
  })

  it('round-trips valid params', () => {
    const params = new URLSearchParams({
      page: '3',
      pageSize: '25',
      name: 'widget',
      status: 'draft',
      sortOrder: 'asc',
    })

    expect(parseResourceFilters(params)).toEqual({
      page: 3,
      pageSize: 25,
      name: 'widget',
      status: 'draft',
      sortOrder: 'asc',
    })
  })

  it('falls back on invalid status, pageSize and sortOrder', () => {
    const params = new URLSearchParams({
      status: 'bogus',
      pageSize: '17',
      sortOrder: 'up',
    })

    const result = parseResourceFilters(params)
    expect(result.status).toBeUndefined()
    expect(result.pageSize).toBe(10)
    expect(result.sortOrder).toBeUndefined()
  })

  it.each(['0', '-1', 'abc', '1.5'])('falls back to page 1 for page=%s', (page) => {
    const result = parseResourceFilters(new URLSearchParams({ page }))

    expect(result.page).toBe(1)
  })

  it('accepts each allowed page size', () => {
    for (const size of [10, 25, 50, 100]) {
      const params = new URLSearchParams({ pageSize: String(size) })
      expect(parseResourceFilters(params).pageSize).toBe(size)
    }
  })
})
