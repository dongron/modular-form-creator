import { describe, it, expect } from 'vitest'
import { formatCreatedAt } from './date'

const expected = (value: string | number | Date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

describe('formatCreatedAt', () => {
  it('formats an ISO string', () => {
    const iso = '2026-07-11T09:30:00.000Z'
    expect(formatCreatedAt(iso)).toBe(expected(iso))
  })

  it('accepts a Date instance', () => {
    const date = new Date('2026-01-02T15:45:00.000Z')
    expect(formatCreatedAt(date)).toBe(expected(date))
  })

  it('accepts an epoch number', () => {
    const epoch = Date.UTC(2026, 6, 11, 9, 30)
    expect(formatCreatedAt(epoch)).toBe(expected(epoch))
  })
})
