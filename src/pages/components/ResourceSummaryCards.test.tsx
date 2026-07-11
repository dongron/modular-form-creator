import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test/render'
import type { Resource } from '../../api/resources'
import ResourceSummaryCards from './ResourceSummaryCards'

const completeResource: Resource = {
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

describe('ResourceSummaryCards', () => {
  it('shows Complete badges and field values when both modules are complete', () => {
    renderWithTheme(<ResourceSummaryCards resource={completeResource} />)

    expect(screen.getAllByText('Complete')).toHaveLength(2)
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Atlas Platform')).toBeInTheDocument()
    expect(screen.getByText('100000')).toBeInTheDocument()
  })

  it('lists each project detail option', () => {
    renderWithTheme(<ResourceSummaryCards resource={completeResource} />)

    expect(screen.getByText('FE devs')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
  })

  it('shows Incomplete for basic info and "Not provided" fallbacks for blank fields', () => {
    renderWithTheme(
      <ResourceSummaryCards
        resource={{
          ...completeResource,
          basicInfo: { ...completeResource.basicInfo, owner: '', email: '' },
        }}
      />,
    )

    const badges = screen.getAllByText(/Complete|Incomplete/)
    expect(badges[0]).toHaveTextContent('Incomplete')
    expect(badges[1]).toHaveTextContent('Complete')
    expect(screen.getAllByText('Not provided')).toHaveLength(2)
  })

  it('shows Incomplete for project details and "None selected" when there are no options', () => {
    renderWithTheme(
      <ResourceSummaryCards
        resource={{
          ...completeResource,
          projectDetails: { ...completeResource.projectDetails, options: [] },
        }}
      />,
    )

    const badges = screen.getAllByText(/Complete|Incomplete/)
    expect(badges[0]).toHaveTextContent('Complete')
    expect(badges[1]).toHaveTextContent('Incomplete')
    expect(screen.getByText('None selected')).toBeInTheDocument()
  })
})
