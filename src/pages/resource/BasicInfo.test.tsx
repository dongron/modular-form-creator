import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'
import ResourceError from './ResourceError'
import BasicInfo, { action as basicInfoAction } from './BasicInfo'

const resource: ResourceModel = {
  _id: 'resource-object-id',
  resourceId: 42,
  name: 'Project Atlas',
  status: 'draft',
  basicInfo: {
    resourceName: 'Project Atlas',
    owner: 'Ada Lovelace',
    email: 'ada@example.com',
    description: 'A resource with its basic information completed.',
    priority: 'low',
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

function renderBasicInfoRoute() {
  return renderWithRouter(<Resource />, {
    path: '/resources/:resourceId',
    initialEntries: ['/resources/42/basic-info'],
    loader: resourceLoader,
    ErrorBoundary: ResourceError,
    children: [{ path: 'basic-info', Component: BasicInfo, action: basicInfoAction }],
  })
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BasicInfo', () => {
  it('loads the parent resource and renders an editable form with a locked resource name', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(resource))
    vi.stubGlobal('fetch', fetchMock)

    renderBasicInfoRoute()

    expect(await screen.findByLabelText('Resource name')).toHaveValue('Project Atlas')
    expect(screen.getByLabelText('Resource name')).toBeDisabled()
    expect(screen.getByLabelText('Owner')).toHaveValue('Ada Lovelace')
    expect(screen.getByLabelText('Owner')).toBeEnabled()
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.getByLabelText('Email')).toBeEnabled()
    expect(screen.getByLabelText('Description')).toHaveValue(
      'A resource with its basic information completed.',
    )
    expect(screen.getByLabelText('Description')).toBeEnabled()
    expect(screen.getByLabelText('Priority')).toHaveValue('low')
    expect(screen.getByLabelText('Priority')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42')
  })

  it('wraps the form in a definite-width container so it does not shrink to fit its content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(resource)))

    renderBasicInfoRoute()

    const form = (await screen.findByLabelText('Owner')).closest('form')
    const wrapperClass = form?.parentElement?.className.split(' ').pop()
    const emittedCss = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    expect(emittedCss).toContain(`.${wrapperClass}{width:min(48rem, 100%)`)
  })

  it('offers low, medium and high priority options', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(resource)))

    renderBasicInfoRoute()

    const priority = await screen.findByLabelText('Priority')
    const options = Array.from(priority.querySelectorAll('option')).map(
      (option) => option.value,
    )
    expect(options).toEqual(['', 'low', 'medium', 'high'])
  })

  it('patches the edited basic info and shows the reloaded resource values', async () => {
    const updatedResource: ResourceModel = {
      ...resource,
      basicInfo: {
        ...resource.basicInfo,
        owner: 'Grace Hopper (saved)',
        priority: 'high',
      },
      updatedAt: '2026-07-12T00:00:00.000Z',
    }
    let saved = false
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        saved = true
        return Promise.resolve(jsonResponse(updatedResource))
      }
      return Promise.resolve(jsonResponse(saved ? updatedResource : resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBasicInfoRoute()
    const user = userEvent.setup()

    const owner = await screen.findByLabelText('Owner')
    await user.clear(owner)
    await user.type(owner, 'Grace Hopper')
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(screen.getByLabelText('Owner')).toHaveValue('Grace Hopper (saved)'),
    )
    expect(screen.getByLabelText('Priority')).toHaveValue('high')
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42/basic-info', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceName: 'Project Atlas',
        owner: 'Grace Hopper',
        email: 'ada@example.com',
        description: 'A resource with its basic information completed.',
        priority: 'high',
      }),
    })
  })

  it('shows the API validation message and keeps the typed values on 400', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({ message: 'email must be a valid email format' }, 400),
        )
      }
      return Promise.resolve(jsonResponse(resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBasicInfoRoute()
    const user = userEvent.setup()

    const owner = await screen.findByLabelText('Owner')
    await user.clear(owner)
    await user.type(owner, 'Grace Hopper')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('email must be a valid email format'),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'email must be a valid email format',
    )
    expect(screen.getByLabelText('Owner')).toHaveValue('Grace Hopper')
  })

  it('disables the fields and shows a saving label while the update is in flight', async () => {
    let resolvePatch!: (value: Response) => void
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve
    })
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') return patchPromise
      return Promise.resolve(jsonResponse(resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBasicInfoRoute()
    const user = userEvent.setup()

    await screen.findByLabelText('Owner')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(screen.getByLabelText('Owner')).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Description')).toBeDisabled()
    expect(screen.getByLabelText('Priority')).toBeDisabled()

    resolvePatch(jsonResponse(resource))
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  describe('completed resources', () => {
    const completedResource: ResourceModel = {
      ...resource,
      status: 'completed',
      projectDetails: {
        projectName: 'Atlas Platform',
        budget: '100000',
        category: 'external',
        options: ['FE devs', 'Designer'],
      },
    }

    it('keeps the fields editable and explains the local edit buffer', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(completedResource)))

      renderBasicInfoRoute()

      expect(await screen.findByLabelText('Owner')).toBeEnabled()
      expect(screen.getByLabelText('Email')).toBeEnabled()
      expect(screen.getByLabelText('Description')).toBeEnabled()
      expect(screen.getByLabelText('Priority')).toBeEnabled()
      expect(screen.getByLabelText('Resource name')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Submit changes' })).toBeEnabled()
      expect(
        screen.getByText(
          'This resource is completed. Changes are kept locally until you submit them.',
        ),
      ).toBeInTheDocument()
    })

    it('warns that unsaved local changes are lost on refresh once the form is edited', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(completedResource)))

      renderBasicInfoRoute()
      const user = userEvent.setup()

      const owner = await screen.findByLabelText('Owner')
      expect(
        screen.queryByText('You have unsaved local changes - they are lost on refresh.'),
      ).not.toBeInTheDocument()

      await user.type(owner, ' Jr.')

      expect(
        screen.getByText('You have unsaved local changes - they are lost on refresh.'),
      ).toBeInTheDocument()
    })

    it('persists buffered edits through a single full PUT update on submit', async () => {
      const updatedResource: ResourceModel = {
        ...completedResource,
        basicInfo: { ...completedResource.basicInfo, owner: 'Grace Hopper (saved)' },
        updatedAt: '2026-07-12T00:00:00.000Z',
      }
      let saved = false
      const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          saved = true
          return Promise.resolve(jsonResponse(updatedResource))
        }
        return Promise.resolve(jsonResponse(saved ? updatedResource : completedResource))
      })
      vi.stubGlobal('fetch', fetchMock)

      renderBasicInfoRoute()
      const user = userEvent.setup()

      const owner = await screen.findByLabelText('Owner')
      await user.clear(owner)
      await user.type(owner, 'Grace Hopper')
      await user.click(screen.getByRole('button', { name: 'Submit changes' }))

      await waitFor(() =>
        expect(screen.getByLabelText('Owner')).toHaveValue('Grace Hopper (saved)'),
      )
      expect(fetchMock).toHaveBeenCalledWith('/api/resources/42', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Project Atlas',
          basicInfo: {
            resourceName: 'Project Atlas',
            owner: 'Grace Hopper',
            email: 'ada@example.com',
            description: 'A resource with its basic information completed.',
            priority: 'low',
          },
          projectDetails: completedResource.projectDetails,
        }),
      })
      const patchCalls = fetchMock.mock.calls.filter(
        (call) => (call[1] as RequestInit | undefined)?.method === 'PATCH',
      )
      expect(patchCalls).toHaveLength(0)
    })

    it('shows the API validation message when the full update returns 400', async () => {
      const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          return Promise.resolve(
            jsonResponse({ message: 'email must be a valid email format' }, 400),
          )
        }
        return Promise.resolve(jsonResponse(completedResource))
      })
      vi.stubGlobal('fetch', fetchMock)

      renderBasicInfoRoute()
      const user = userEvent.setup()

      await screen.findByLabelText('Owner')
      await user.click(screen.getByRole('button', { name: 'Submit changes' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'email must be a valid email format',
      )
    })
  })

  it('renders the resource error page when the update returns 404', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      return Promise.resolve(jsonResponse(resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBasicInfoRoute()
    const user = userEvent.setup()

    await screen.findByLabelText('Owner')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByRole('heading', { name: 'Resource not found' }),
    ).toBeInTheDocument()
  })
})
