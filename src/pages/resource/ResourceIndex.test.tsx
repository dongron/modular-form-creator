import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'
import ResourceIndex, { action as resourceIndexAction } from './ResourceIndex'

const completeDraft: ResourceModel = {
  _id: 'resource-object-id',
  resourceId: 42,
  name: 'Project Atlas',
  status: 'draft',
  basicInfo: {
    resourceName: 'Project Atlas',
    owner: 'Ada Lovelace',
    email: 'ada@example.com',
    description: 'A resource with both modules completed.',
    priority: 'high',
  },
  projectDetails: {
    projectName: 'Atlas Platform',
    budget: '100000',
    category: 'external',
    options: ['FE devs', 'Designer'],
  },
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
}

function renderOverview(data: ResourceModel) {
  // A fresh Response per call: the loader, the action, and the post-action
  // revalidation each read the body, and a Response body can be read only once.
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)

  renderWithRouter(<Resource />, {
    path: '/resources/:resourceId',
    initialEntries: ['/resources/42'],
    loader: resourceLoader,
    children: [{ index: true, Component: ResourceIndex, action: resourceIndexAction }],
  })

  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResourceIndex overview', () => {
  it('shows status, completion count and enabled actions for a complete draft', async () => {
    renderOverview(completeDraft)

    expect(await screen.findByText('draft')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 modules complete')).toBeInTheDocument()
    expect(screen.getAllByText('Complete')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Mark as complete' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeDisabled()
  })

  it('disables Mark as complete when a module is incomplete', async () => {
    renderOverview({
      ...completeDraft,
      basicInfo: { ...completeDraft.basicInfo, owner: '' },
    })

    expect(await screen.findByText('1 of 2 modules complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as complete' })).toBeDisabled()
  })

  it('shows a disabled "Resource completed" button for a completed resource', async () => {
    renderOverview({ ...completeDraft, status: 'completed' })

    expect(await screen.findByText('completed')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark as complete' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resource completed' })).toBeDisabled()
  })

  it('provisions the resource when Mark as complete is clicked', async () => {
    const fetchMock = renderOverview(completeDraft)

    await screen.findByText('2 of 2 modules complete')
    await userEvent.click(screen.getByRole('button', { name: 'Mark as complete' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/resources/42/provisioning', {
        method: 'PATCH',
      })
    })
  })

  it('deletes the resource when Delete is clicked', async () => {
    const fetchMock = renderOverview(completeDraft)

    await screen.findByText('2 of 2 modules complete')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/resources/42', {
        method: 'DELETE',
      })
    })
  })
})
