import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter, renderWithRoutes } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'

const resource: ResourceModel = {
  _id: 'resource-object-id',
  resourceId: 42,
  name: 'Project Atlas',
  status: 'draft',
  basicInfo: {
    resourceName: 'Project Atlas',
    owner: '',
    email: '',
    description: '',
    priority: '',
  },
  projectDetails: {
    projectName: '',
    budget: '',
    category: '',
    options: [],
  },
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Resource', () => {
  it('wraps the tab bar within the page content on narrow screens', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(resource), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    renderWithRouter(<Resource />, {
      path: '/resources/:resourceId',
      initialEntries: ['/resources/42'],
      loader: resourceLoader,
    })

    await screen.findByRole('heading', { level: 1, name: 'Project Atlas' })

    expect(screen.getByRole('navigation')).toHaveStyle({ flexWrap: 'wrap' })
  })

  it('navigates back to the resources list when the back button is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(resource), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
    const user = userEvent.setup()

    renderWithRoutes(
      [
        {
          path: '/resources/:resourceId',
          Component: Resource,
          loader: resourceLoader,
          HydrateFallback: () => null,
        },
        { path: '/resources', Component: () => <div>Resources Page</div> },
      ],
      { initialEntries: ['/resources/42'] },
    )

    await screen.findByRole('heading', { level: 1, name: 'Project Atlas' })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByText('Resources Page')).toBeInTheDocument()
  })
})
