import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'
import ProjectDetails from './ProjectDetails'

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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProjectDetails', () => {
  it('loads the parent resource and displays its project details in locked fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(resource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithRouter(<Resource />, {
      path: '/resources/:resourceId',
      initialEntries: ['/resources/42/project-details'],
      loader: resourceLoader,
      children: [{ path: 'project-details', Component: ProjectDetails }],
    })

    expect(await screen.findByLabelText('Project name')).toHaveValue('Atlas Platform')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Resource “Project Atlas”' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Budget')).toHaveValue('100000')
    expect(screen.getByLabelText('Category')).toHaveValue('external')
    const optionsGroup = screen.getByRole('group', { name: 'Options' })
    expect(within(optionsGroup).getByLabelText('Option 1')).toHaveValue('FE devs')
    expect(within(optionsGroup).getByLabelText('Option 2')).toHaveValue('Designer')
    expect(screen.getByLabelText('Project name')).toBeDisabled()
    expect(within(optionsGroup).getByLabelText('Option 1')).toBeDisabled()
    expect(within(optionsGroup).getByLabelText('Option 2')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete option 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete option 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add option' })).toBeDisabled()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Project details' }),
    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42')
  })
})
