import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { useFetcher } from 'react-router-dom'
import { renderWithRouter } from '../../test/render'
import CreateResourceForm from './CreateResourceForm'

function renderCreateResourceForm({
  error,
  isSubmitting,
}: {
  error?: string
  isSubmitting?: boolean
} = {}) {
  function Harness() {
    const createFetcher = useFetcher()
    const formRef = useRef<HTMLFormElement>(null)

    return (
      <CreateResourceForm
        createFetcher={createFetcher}
        formRef={formRef}
        error={error}
        isSubmitting={isSubmitting}
      />
    )
  }

  return renderWithRouter(<Harness />)
}

describe('CreateResourceForm', () => {
  it('renders the resource name field and creation action', () => {
    renderCreateResourceForm()

    expect(screen.getByLabelText('Resource name')).toBeInTheDocument()
    expect(
      screen.getByText('Resource names cannot be changed after creation.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Resource' }).closest('form'),
    ).toHaveAttribute('method', 'post')
  })

  it('shows a resource name validation error', () => {
    renderCreateResourceForm({ error: 'resourceName must be unique' })

    expect(screen.getByText('resourceName must be unique')).toBeInTheDocument()
    expect(screen.getByLabelText('Resource name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables the fields and shows a pending label while submitting', () => {
    renderCreateResourceForm({ isSubmitting: true })

    expect(screen.getByLabelText('Resource name')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
  })
})
