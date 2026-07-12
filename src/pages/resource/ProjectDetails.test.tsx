import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { action as resourceAction, loader as resourceLoader } from './Resource'
import ResourceError from './ResourceError'
import ProjectDetails, { action as projectDetailsAction } from './ProjectDetails'
import BasicInfo from './BasicInfo'

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
    projectName: 'Atlas Platform',
    budget: '100000',
    category: 'external',
    options: ['FE devs', 'Designer'],
  },
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
}

function renderProjectDetailsRoute() {
  return renderWithRouter(<Resource />, {
    path: '/resources/:resourceId',
    initialEntries: ['/resources/42/project-details'],
    loader: resourceLoader,
    action: resourceAction,
    ErrorBoundary: ResourceError,
    children: [
      {
        path: 'project-details',
        Component: ProjectDetails,
        action: projectDetailsAction,
      },
    ],
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

describe('ProjectDetails', () => {
  it('loads the parent resource and renders an editable form with the current options checked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(resource))
    vi.stubGlobal('fetch', fetchMock)

    renderProjectDetailsRoute()

    expect(await screen.findByLabelText('Project name')).toHaveValue('Atlas Platform')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Project Atlas' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Project name')).toBeEnabled()
    expect(screen.getByLabelText('Budget')).toHaveValue('100000')
    expect(screen.getByLabelText('Budget')).toBeEnabled()
    expect(screen.getByLabelText('Category')).toHaveValue('external')
    expect(screen.getByLabelText('Category')).toBeEnabled()
    expect(screen.getByText('Options')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Designer' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'BE devs' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Data Eng' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Product Owner' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Project details' }),
    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42')
  })

  it('wraps the form in a definite-width container so it does not shrink to fit its content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(resource)))

    renderProjectDetailsRoute()

    const form = (await screen.findByLabelText('Project name')).closest('form')
    const wrapperClass = form?.parentElement?.className.split(' ').pop()
    const emittedCss = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    expect(emittedCss).toContain(`.${wrapperClass}{width:min(48rem, 100%)`)
  })

  it('offers internal, external and vendor category options', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(resource)))

    renderProjectDetailsRoute()

    const category = await screen.findByLabelText('Category')
    const options = Array.from(category.querySelectorAll('option')).map(
      (option) => option.value,
    )
    expect(options).toEqual(['', 'internal', 'external', 'vendor'])
  })

  it('patches the edited project details, keeping options untouched, and shows the reloaded values', async () => {
    const updatedResource: ResourceModel = {
      ...resource,
      projectDetails: {
        ...resource.projectDetails,
        projectName: 'Atlas Platform (saved)',
        budget: '150000',
        category: 'vendor',
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

    renderProjectDetailsRoute()
    const user = userEvent.setup()

    const projectName = await screen.findByLabelText('Project name')
    await user.clear(projectName)
    await user.type(projectName, 'Atlas Platform (saved)')
    const budget = screen.getByLabelText('Budget')
    await user.clear(budget)
    await user.type(budget, '150000')
    await user.selectOptions(screen.getByLabelText('Category'), 'vendor')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByLabelText('Project name')).toHaveValue(
      'Atlas Platform (saved)',
    )
    expect(screen.getByLabelText('Budget')).toHaveValue('150000')
    expect(screen.getByLabelText('Category')).toHaveValue('vendor')
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42/project-details', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'Atlas Platform (saved)',
        budget: '150000',
        category: 'vendor',
        options: ['FE devs', 'Designer'],
      }),
    })
  })

  it('toggles project options and submits exactly the checked values', async () => {
    const updatedResource: ResourceModel = {
      ...resource,
      projectDetails: {
        ...resource.projectDetails,
        options: ['FE devs', 'Data Eng'],
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

    renderProjectDetailsRoute()
    const user = userEvent.setup()

    await screen.findByLabelText('Project name')
    await user.click(screen.getByRole('checkbox', { name: 'Designer' }))
    await user.click(screen.getByRole('checkbox', { name: 'Data Eng' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42/project-details', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'Atlas Platform',
        budget: '100000',
        category: 'external',
        options: ['FE devs', 'Data Eng'],
      }),
    })
    expect(await screen.findByRole('checkbox', { name: 'Data Eng' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Designer' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeChecked()
  })

  it('shows the API validation message on a failed save', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({ message: 'budget must contain only integers' }, 400),
        )
      }
      return Promise.resolve(jsonResponse(resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderProjectDetailsRoute()
    const user = userEvent.setup()

    const budget = await screen.findByLabelText('Budget')
    await user.clear(budget)
    await user.type(budget, 'abc')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('budget must contain only integers'),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'budget must contain only integers',
    )
    expect(screen.getByLabelText('Budget')).toHaveValue('abc')
  })

  it('renders the resource error page when the update returns 404', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      return Promise.resolve(jsonResponse(resource))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderProjectDetailsRoute()
    const user = userEvent.setup()

    await screen.findByLabelText('Project name')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByRole('heading', { name: 'Resource not found' }),
    ).toBeInTheDocument()
  })

  describe('completed resources', () => {
    const completedResource: ResourceModel = { ...resource, status: 'completed' }

    it('keeps the fields editable and explains the local edit buffer', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(completedResource)))

      renderProjectDetailsRoute()

      expect(await screen.findByLabelText('Project name')).toBeEnabled()
      expect(screen.getByLabelText('Budget')).toBeEnabled()
      expect(screen.getByLabelText('Category')).toBeEnabled()
      expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Submit changes' })).toBeEnabled()
      expect(
        screen.getByText(
          'This resource is completed. Changes are kept locally until you submit them.',
        ),
      ).toBeInTheDocument()
    })

    it('warns that unsaved local changes are lost on refresh once the form is edited', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(completedResource)))

      renderProjectDetailsRoute()
      const user = userEvent.setup()

      await screen.findByLabelText('Project name')
      expect(
        screen.queryByText('You have unsaved local changes - they are lost on refresh.'),
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('checkbox', { name: 'Data Eng' }))

      expect(
        screen.getByText('You have unsaved local changes - they are lost on refresh.'),
      ).toBeInTheDocument()
    })

    it('keeps buffered option changes after navigating to Basic Info and back', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(completedResource)))
      const user = userEvent.setup()

      renderWithRouter(<Resource />, {
        path: '/resources/:resourceId',
        initialEntries: ['/resources/42/project-details'],
        loader: resourceLoader,
        children: [
          { path: 'basic-info', Component: BasicInfo },
          {
            path: 'project-details',
            Component: ProjectDetails,
            action: projectDetailsAction,
          },
        ],
      })

      await screen.findByLabelText('Project name')
      await user.click(screen.getByRole('checkbox', { name: 'Data Eng' }))
      await user.click(screen.getByRole('link', { name: 'Edit basic info' }))
      await screen.findByLabelText('Owner')
      await user.click(screen.getByRole('link', { name: 'Edit project details' }))

      expect(await screen.findByRole('checkbox', { name: 'Data Eng' })).toBeChecked()
    })

    it('persists buffered edits through a single full PUT update on submit', async () => {
      const updatedResource: ResourceModel = {
        ...completedResource,
        projectDetails: {
          ...completedResource.projectDetails,
          projectName: 'Atlas Platform v2 (saved)',
        },
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

      renderProjectDetailsRoute()
      const user = userEvent.setup()

      const projectName = await screen.findByLabelText('Project name')
      await user.clear(projectName)
      await user.type(projectName, 'Atlas Platform v2')
      await user.click(screen.getByRole('button', { name: 'Submit changes' }))

      expect(await screen.findByLabelText('Project name')).toHaveValue(
        'Atlas Platform v2 (saved)',
      )
      expect(fetchMock).toHaveBeenCalledWith('/api/resources/42', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Project Atlas',
          basicInfo: completedResource.basicInfo,
          projectDetails: {
            projectName: 'Atlas Platform v2',
            budget: '100000',
            category: 'external',
            options: ['FE devs', 'Designer'],
          },
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
            jsonResponse({ message: 'budget must contain only integers' }, 400),
          )
        }
        return Promise.resolve(jsonResponse(completedResource))
      })
      vi.stubGlobal('fetch', fetchMock)

      renderProjectDetailsRoute()
      const user = userEvent.setup()

      await screen.findByLabelText('Project name')
      await user.click(screen.getByRole('button', { name: 'Submit changes' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'budget must contain only integers',
      )
    })
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

    renderProjectDetailsRoute()
    const user = userEvent.setup()

    await screen.findByLabelText('Project name')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(screen.getByLabelText('Project name')).toBeDisabled()
    expect(screen.getByLabelText('Budget')).toBeDisabled()
    expect(screen.getByLabelText('Category')).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeDisabled()

    resolvePatch(jsonResponse(resource))
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  it('shows a banner and locks the form when Basic Info is incomplete on a draft resource', async () => {
    const incompleteBasicInfoResource: ResourceModel = {
      ...resource,
      basicInfo: { ...resource.basicInfo, owner: '' },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(incompleteBasicInfoResource)),
    )

    renderProjectDetailsRoute()

    expect(
      await screen.findByText(
        'Basic Info must be completed before Project Details can be edited.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Project name')).toBeDisabled()
    expect(screen.getByLabelText('Budget')).toBeDisabled()
    expect(screen.getByLabelText('Category')).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'FE devs' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('does not show the incomplete Basic Info banner when Basic Info is complete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(resource)))

    renderProjectDetailsRoute()

    await screen.findByLabelText('Project name')
    expect(
      screen.queryByText(
        'Basic Info must be completed before Project Details can be edited.',
      ),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Project name')).toBeEnabled()
  })
})
