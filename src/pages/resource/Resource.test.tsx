import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
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

    await screen.findByRole('heading', { level: 1, name: 'Resource “Project Atlas”' })

    expect(screen.getByRole('navigation')).toHaveStyle({ flexWrap: 'wrap' })
  })
})
