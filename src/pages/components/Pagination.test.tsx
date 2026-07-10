import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import Pagination from './Pagination'

type PaginationMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

const meta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  page: 1,
  pageSize: 10,
  totalItems: 100,
  totalPages: 10,
  ...overrides,
})

describe('Pagination', () => {
  it('disables Prev on the first page and links Next', () => {
    renderWithRouter(
      <Pagination pagination={meta({ page: 1 })} searchParams={new URLSearchParams()} />,
    )

    expect(screen.queryByRole('link', { name: '← Prev' })).toBeNull()
    expect(screen.getByText('← Prev')).toBeInTheDocument()

    const next = screen.getByRole('link', { name: 'Next →' })
    expect(next).toHaveAttribute('href', '/?page=2')
    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument()
  })

  it('links both directions on a middle page and preserves existing params', () => {
    renderWithRouter(
      <Pagination
        pagination={meta({ page: 5 })}
        searchParams={new URLSearchParams({ status: 'draft' })}
      />,
    )

    expect(screen.getByRole('link', { name: '← Prev' })).toHaveAttribute(
      'href',
      '/?status=draft&page=4',
    )
    expect(screen.getByRole('link', { name: 'Next →' })).toHaveAttribute(
      'href',
      '/?status=draft&page=6',
    )
  })

  it('disables Next on the last page', () => {
    renderWithRouter(
      <Pagination
        pagination={meta({ page: 10, totalPages: 10 })}
        searchParams={new URLSearchParams()}
      />,
    )

    expect(screen.queryByRole('link', { name: 'Next →' })).toBeNull()
    expect(screen.getByRole('link', { name: '← Prev' })).toHaveAttribute(
      'href',
      '/?page=9',
    )
  })

  it('shows "of 1" when there are no pages', () => {
    renderWithRouter(
      <Pagination
        pagination={meta({ page: 1, totalPages: 0, totalItems: 0 })}
        searchParams={new URLSearchParams()}
      />,
    )

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
