import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/render'
import ResourceFilters from './ResourceFilters'

function setup(search = '') {
  const searchParams = new URLSearchParams(search)
  const setSearchParams = vi.fn()
  const submit = vi.fn()

  renderWithRouter(
    <ResourceFilters
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      submit={submit}
    />,
  )

  return { setSearchParams, submit }
}

describe('ResourceFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders values from search params', () => {
    setup('name=widget&status=draft&sortOrder=asc&pageSize=25')

    expect(screen.getByLabelText('Name')).toHaveValue('widget')
    expect(screen.getByLabelText('Status')).toHaveValue('draft')
    expect(screen.getByLabelText('Sort')).toHaveValue('asc')
    expect(screen.getByLabelText('Per page')).toHaveValue('25')
  })

  it('debounces the name filter and submits once', () => {
    const { submit } = setup()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'a' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'ab' } })
    expect(submit).not.toHaveBeenCalled()

    vi.advanceTimersByTime(399)
    expect(submit).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith(expect.any(HTMLFormElement), {
      replace: false,
    })
  })

  it('uses replace when a name filter is already present', () => {
    const { submit } = setup('name=widget')

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'widgets' } })
    vi.advanceTimersByTime(400)

    expect(submit).toHaveBeenCalledWith(expect.any(HTMLFormElement), {
      replace: true,
    })
  })

  it('submits immediately when a select changes', () => {
    const { submit } = setup()

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'completed' } })

    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith(expect.any(HTMLFormElement))
  })

  it('resets filters and cancels a pending name submit', () => {
    const { submit, setSearchParams } = setup()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(setSearchParams).toHaveBeenCalledWith({})

    vi.advanceTimersByTime(400)
    expect(submit).not.toHaveBeenCalled()
  })
})
