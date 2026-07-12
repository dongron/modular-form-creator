import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFetcher, type ActionFunctionArgs } from 'react-router-dom'
import { renderWithRouter } from '../../test/render'
import DeleteConfirmDrawer from './DeleteConfirmDrawer'

function renderDrawer({
  isOpen = true,
  onClose = vi.fn(),
  isSubmitting,
  action,
}: {
  isOpen?: boolean
  onClose?: () => void
  isSubmitting?: boolean
  action?: (args: ActionFunctionArgs) => unknown
} = {}) {
  function Harness() {
    const fetcher = useFetcher()
    return (
      <DeleteConfirmDrawer
        resourceName="Project Atlas"
        resourceId={42}
        isOpen={isOpen}
        onClose={onClose}
        fetcher={fetcher}
        isSubmitting={isSubmitting}
      />
    )
  }

  return renderWithRouter(<Harness />, { action })
}

describe('DeleteConfirmDrawer', () => {
  it('renders nothing accessible when closed', () => {
    renderDrawer({ isOpen: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders confirmation copy and actions when open', () => {
    renderDrawer({ isOpen: true })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText('Delete "Project Atlas"? This can\'t be undone.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls onClose without submitting when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const action = vi.fn(async () => null)

    renderDrawer({ onClose, action })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(action).not.toHaveBeenCalled()
  })

  it('submits the delete intent and resourceId when Delete is clicked', async () => {
    const user = userEvent.setup()
    const action = vi.fn(async ({ request }: ActionFunctionArgs) => {
      const data = await request.formData()
      expect(data.get('intent')).toBe('delete')
      expect(data.get('resourceId')).toBe('42')
      return null
    })

    renderDrawer({ action })

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('disables the Delete button while submitting', () => {
    renderDrawer({ isSubmitting: true })

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
