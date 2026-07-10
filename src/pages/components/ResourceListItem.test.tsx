import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/render'
import ResourceListItem from './ResourceListItem'
import { formatCreatedAt } from '../../utils/date'
import { type Resource } from '../../api/resources'

const resource = (overrides: Partial<Resource> = {}): Resource => ({
  _id: 'abc123',
  resourceId: 42,
  name: 'Alpha resource',
  status: 'draft',
  basicInfo: {
    resourceName: 'Alpha resource',
    owner: 'Dominik',
    email: 'd@example.com',
    description: '',
    priority: 'high',
  },
  projectDetails: {
    projectName: 'Alpha',
    budget: '1000',
    category: 'web',
    options: [],
  },
  createdAt: '2026-07-11T09:30:00.000Z',
  updatedAt: '2026-07-11T09:30:00.000Z',
  ...overrides,
})

describe('ResourceListItem', () => {
  it('renders name, link, formatted date and status badge', () => {
    const r = resource()
    renderWithRouter(<ResourceListItem resource={r} />)

    const link = screen.getByRole('link', { name: /Alpha resource/ })
    expect(link).toHaveAttribute('href', '/resources/42')
    expect(screen.getByText(formatCreatedAt(r.createdAt))).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders an unknown status without crashing', () => {
    renderWithRouter(<ResourceListItem resource={resource({ status: 'archived' })} />)
    expect(screen.getByText('archived')).toBeInTheDocument()
  })

  it('submits a delete via the fetcher form', async () => {
    const user = userEvent.setup()
    const action = vi.fn(async ({ request }: { request: Request }) => {
      const data = await request.formData()
      expect(data.get('intent')).toBe('delete')
      expect(data.get('resourceId')).toBe('42')
      return null
    })

    renderWithRouter(<ResourceListItem resource={resource()} />, { action })

    await user.click(screen.getByRole('button', { name: 'Delete Alpha resource' }))

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
  })

  it('disables the delete button while the fetcher is in flight', async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const action = vi.fn(() => new Promise((resolve) => (release = () => resolve(null))))

    renderWithRouter(<ResourceListItem resource={resource()} />, { action })

    const button = screen.getByRole('button', { name: 'Delete Alpha resource' })
    await user.click(button)

    await waitFor(() => expect(button).toBeDisabled())

    release()
    await waitFor(() => expect(button).not.toBeDisabled())
  })
})
