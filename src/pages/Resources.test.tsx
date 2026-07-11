import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ActionFunctionArgs } from 'react-router-dom'
import { renderWithRouter } from '../test/render'
import Resources, { action, loader } from './Resources'
import type { Resource, ResourcePage } from '../api/resources'

const emptyPage: ResourcePage = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  },
}

const createdResource: Resource = {
  _id: 'resource-object-id',
  resourceId: 1,
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderResources() {
  return renderWithRouter(<Resources />, {
    path: '/resources',
    initialEntries: ['/resources'],
    action,
    loader,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Resources create drawer', () => {
  it('opens the drawer and preserves an unfinished name after closing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(emptyPage)))
    const user = userEvent.setup()
    renderResources()

    await user.click(await screen.findByRole('button', { name: 'Create Resource' }))
    const input = screen.getByLabelText('Resource name')
    await user.type(input, 'Work in progress')
    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('dialog', { name: 'Create Resource' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create Resource' }))
    expect(screen.getByLabelText('Resource name')).toHaveValue('Work in progress')
  })

  it('closes and clears the drawer after creation and list revalidation', async () => {
    const refreshedPage: ResourcePage = {
      items: [createdResource],
      pagination: { ...emptyPage.pagination, totalItems: 1 },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(emptyPage))
      .mockResolvedValueOnce(jsonResponse(createdResource, 201))
      .mockResolvedValueOnce(jsonResponse(refreshedPage))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderResources()

    await user.click(await screen.findByRole('button', { name: 'Create Resource' }))
    await user.type(screen.getByLabelText('Resource name'), '  Project Atlas  ')
    await user.click(
      within(screen.getByRole('dialog', { name: 'Create Resource' })).getByRole(
        'button',
        { name: 'Create Resource' },
      ),
    )

    expect(await screen.findByText('Project Atlas')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Create Resource' }),
      ).not.toBeInTheDocument(),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceName: 'Project Atlas' }),
    })

    await user.click(screen.getByRole('button', { name: 'Create Resource' }))
    expect(screen.getByLabelText('Resource name')).toHaveValue('')
  })

  it('shows an API validation error and keeps the drawer open', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(emptyPage))
      .mockResolvedValueOnce(
        jsonResponse({ message: 'resourceName must be unique' }, 400),
      )
      .mockResolvedValueOnce(jsonResponse(emptyPage))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderResources()

    await user.click(await screen.findByRole('button', { name: 'Create Resource' }))
    await user.type(screen.getByLabelText('Resource name'), 'Project Atlas')
    await user.click(
      within(screen.getByRole('dialog', { name: 'Create Resource' })).getByRole(
        'button',
        { name: 'Create Resource' },
      ),
    )

    expect(await screen.findByText('resourceName must be unique')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Create Resource' })).toBeInTheDocument()
    expect(screen.getByLabelText('Resource name')).toHaveValue('Project Atlas')
  })
})

describe('Resources action', () => {
  it('rejects a whitespace-only resource name before calling the API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const request = new Request('http://localhost/resources', {
      method: 'POST',
      body: new URLSearchParams({
        intent: 'create',
        resourceName: '   ',
      }),
    })

    await expect(action({ request } as ActionFunctionArgs)).resolves.toEqual({
      ok: false,
      error: 'Resource name is required',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns a 400 API validation message as action data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ message: 'resourceName must be unique' }, 400)),
    )
    const request = new Request('http://localhost/resources', {
      method: 'POST',
      body: new URLSearchParams({
        intent: 'create',
        resourceName: 'Project Atlas',
      }),
    })

    await expect(action({ request } as ActionFunctionArgs)).resolves.toEqual({
      ok: false,
      error: 'resourceName must be unique',
    })
  })
})
