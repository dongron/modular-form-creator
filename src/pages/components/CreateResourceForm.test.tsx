import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/render'
import CreateResourceForm from './CreateResourceForm'
import { type ResourcesActionData } from '../Resources'

describe('CreateResourceForm', () => {
  it('renders the input and submit button', () => {
    renderWithRouter(<CreateResourceForm />)

    expect(screen.getByLabelText('New resource')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add resource' })).toBeInTheDocument()
  })

  it('shows the action error and keeps the typed value', async () => {
    const user = userEvent.setup()
    const action = (): ResourcesActionData => ({
      ok: false,
      error: 'Name is required',
    })

    renderWithRouter(<CreateResourceForm />, { action })

    const input = screen.getByLabelText('New resource')
    await user.type(input, 'Beta')
    await user.click(screen.getByRole('button', { name: 'Add resource' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(input).toHaveValue('Beta')
  })

  it('resets the form after a successful submit', async () => {
    const user = userEvent.setup()
    const action = (): ResourcesActionData => ({ ok: true, error: null })

    renderWithRouter(<CreateResourceForm />, { action })

    const input = screen.getByLabelText('New resource')
    await user.type(input, 'Gamma')
    await user.click(screen.getByRole('button', { name: 'Add resource' }))

    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('disables the button and shows a pending label while submitting', async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const action = () =>
      new Promise<ResourcesActionData>(
        (resolve) => (release = () => resolve({ ok: true, error: null })),
      )

    renderWithRouter(<CreateResourceForm />, { action })

    await user.type(screen.getByLabelText('New resource'), 'Delta')
    await user.click(screen.getByRole('button', { name: 'Add resource' }))

    const pending = await screen.findByRole('button', { name: 'Adding…' })
    expect(pending).toBeDisabled()

    release()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add resource' })).toBeInTheDocument(),
    )
  })
})
