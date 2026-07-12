import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ActionFunctionArgs } from 'react-router-dom'
import { renderWithRoutes } from '../../test/render'
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

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderResourceIndex(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock)

  renderWithRoutes(
    [
      {
        path: '/resources/:resourceId',
        Component: Resource,
        loader: resourceLoader,
        HydrateFallback: () => null,
        children: [
          { index: true, Component: ResourceIndex, action: resourceIndexAction },
        ],
      },
      { path: '/resources', Component: () => null },
    ],
    { initialEntries: ['/resources/42'] },
  )

  return fetchMock
}

function renderResourceIndexWithPendingDelete() {
  let callCount = 0

  return renderResourceIndex(
    vi.fn(() => {
      callCount += 1
      return callCount === 1
        ? Promise.resolve(jsonResponse(completeDraft))
        : new Promise<Response>(() => {})
    }),
  )
}

function renderOverview(data: ResourceModel) {
  // A fresh Response per call: the loader, the action, and the post-action
  // revalidation each read the body, and a Response body can be read only once.
  return renderResourceIndex(vi.fn(() => Promise.resolve(jsonResponse(data))))
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

  it('opens the confirmation drawer without submitting when Delete is clicked', async () => {
    const user = userEvent.setup()
    const fetchMock = renderOverview(completeDraft)

    await screen.findByText('2 of 2 modules complete')
    const callsBeforeClick = fetchMock.mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(fetchMock.mock.calls.length).toBe(callsBeforeClick)
  })

  it('closes the confirmation drawer without submitting when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const fetchMock = renderOverview(completeDraft)

    await screen.findByText('2 of 2 modules complete')
    const callsBeforeClick = fetchMock.mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.length).toBe(callsBeforeClick)
  })

  it('deletes the resource when Delete is confirmed in the drawer', async () => {
    const fetchMock = renderOverview(completeDraft)

    await screen.findByText('2 of 2 modules complete')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/resources/42', {
        method: 'DELETE',
      })
    })
  })

  it('deletes a resource addressed by its Mongo ObjectId', async () => {
    const resourceId = '507f1f77bcf86cd799439011'
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(completeDraft))
    vi.stubGlobal('fetch', fetchMock)
    const request = new Request(`http://localhost/resources/${resourceId}`, {
      method: 'POST',
      body: new URLSearchParams({ intent: 'delete' }),
    })

    await resourceIndexAction({
      request,
      params: { resourceId },
    } as unknown as ActionFunctionArgs)

    expect(fetchMock).toHaveBeenCalledWith(`/api/resources/${resourceId}`, {
      method: 'DELETE',
    })
  })

  it('disables the confirm delete button while the request is in flight', async () => {
    const user = userEvent.setup()
    renderResourceIndexWithPendingDelete()

    await screen.findByText('2 of 2 modules complete')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    await waitFor(() => expect(confirmButton).toBeDisabled())
  })
})
