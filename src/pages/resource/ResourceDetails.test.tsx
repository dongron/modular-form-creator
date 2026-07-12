import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'
import ResourceDetails from './ResourceDetails'

const resource: ResourceModel = {
  _id: 'resource-object-id',
  resourceId: 42,
  name: 'Project Atlas',
  status: 'completed',
  basicInfo: {
    resourceName: 'Project Atlas',
    owner: 'Ada Lovelace',
    email: 'ada@example.com',
    description: 'A resource with its basic information completed.',
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

function renderResourceDetails(data: ResourceModel) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  renderWithRouter(<Resource />, {
    path: '/resources/:resourceId',
    initialEntries: ['/resources/42/details'],
    loader: resourceLoader,
    children: [{ path: 'details', Component: ResourceDetails }],
  })

  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResourceDetails', () => {
  it('displays completed module data as text in separate cards', async () => {
    const fetchMock = renderResourceDetails(resource)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Project Atlas' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Basic info' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Project details' }),
    ).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getAllByText('Complete')).toHaveLength(2)
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(
      screen.getByText('A resource with its basic information completed.'),
    ).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('Atlas Platform')).toBeInTheDocument()
    expect(screen.getByText('100000')).toBeInTheDocument()
    expect(screen.getByText('external')).toBeInTheDocument()
    expect(screen.getByText('FE devs')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42')
  })

  it('marks incomplete modules and shows missing values for a draft resource', async () => {
    renderResourceDetails({
      ...resource,
      status: 'draft',
      basicInfo: { ...resource.basicInfo, owner: '' },
      projectDetails: { ...resource.projectDetails, options: [] },
    })

    expect(await screen.findByText('draft')).toBeInTheDocument()
    expect(screen.getAllByText('Incomplete')).toHaveLength(2)
    expect(screen.getByText('Not provided')).toBeInTheDocument()
    expect(screen.getByText('None selected')).toBeInTheDocument()
  })
})
