import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRoutes } from '../test/render'
import Home from './Home'

function renderHome() {
  return renderWithRoutes(
    [
      { path: '/', Component: Home },
      { path: '/resources', Component: () => <div>Resources Page</div> },
    ],
    { initialEntries: ['/'] },
  )
}

describe('Home', () => {
  it('shows the app heading and a button to view resources', async () => {
    renderHome()

    await screen.findByRole('heading', { level: 1, name: 'Modular Form Creator' })
    expect(screen.getByRole('button', { name: 'View Resources' })).toBeInTheDocument()
  })

  it('navigates to /resources when the button is clicked', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('button', { name: 'View Resources' }))

    expect(await screen.findByText('Resources Page')).toBeInTheDocument()
  })
})
