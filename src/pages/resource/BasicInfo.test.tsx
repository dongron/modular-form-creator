import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import type { Resource as ResourceModel } from '../../api/resources'
import Resource, { loader as resourceLoader } from './Resource'
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

describe('BasicInfo', () => {
  it('loads the parent resource and displays its basic info in locked fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(resource), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithRouter(<Resource />, {
      path: '/resources/:resourceId',
      initialEntries: ['/resources/42/basic-info'],
      loader: resourceLoader,
      children: [{ path: 'basic-info', Component: BasicInfo }],
    })

    expect(await screen.findByLabelText('Resource name')).toHaveValue('Project Atlas')
    expect(screen.getByLabelText('Owner')).toHaveValue('Ada Lovelace')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.getByLabelText('Description')).toHaveValue(
      'A resource with its basic information completed.',
    )
    expect(screen.getByLabelText('Priority')).toHaveValue('low')
    expect(screen.getByLabelText('Resource name')).toBeDisabled()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Basic info' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Basic information for this resource.'),
    ).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/resources/42')
  })
})
