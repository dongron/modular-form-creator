import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import ResourceError from './ResourceError'

function renderWithThrowingLoader(error: unknown) {
  return renderWithRouter(<div />, {
    path: '/resources/:resourceId',
    initialEntries: ['/resources/999'],
    loader: () => {
      throw error
    },
    ErrorBoundary: ResourceError,
  })
}

describe('ResourceError', () => {
  it('shows a not-found message with the resource id for 404 errors', async () => {
    renderWithThrowingLoader(new Response('Not found', { status: 404 }))

    await screen.findByRole('heading', { level: 1, name: 'Resource not found' })

    expect(
      screen.getByText(`This resource doesn't exist or may have been deleted.`),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Back to resources' })).toHaveAttribute(
      'href',
      '/resources',
    )
  })

  it('shows a generic message for non-404 response errors', async () => {
    renderWithThrowingLoader(new Response('Server error', { status: 500 }))

    await screen.findByRole('heading', { level: 1, name: 'Something went wrong' })

    expect(screen.queryByText('Resource not found')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Back to resources' })).toHaveAttribute(
      'href',
      '/resources',
    )
  })

  it('shows the generic message for unexpected non-response errors', async () => {
    renderWithThrowingLoader(new Error('boom'))

    await screen.findByRole('heading', { level: 1, name: 'Something went wrong' })

    expect(
      screen.getByText(`We couldn't load this resource. Please try again later.`),
    ).toBeInTheDocument()
  })
})
