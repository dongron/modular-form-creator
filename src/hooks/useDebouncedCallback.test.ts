import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDebouncedCallback } from './useDebouncedCallback'

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires the callback once after the delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 400))
    const [debounced] = result.current

    debounced()
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(399)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('collapses rapid invocations into a single trailing call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 400))
    const [debounced] = result.current

    debounced()
    vi.advanceTimersByTime(200)
    debounced()
    vi.advanceTimersByTime(200)
    debounced()
    vi.advanceTimersByTime(400)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('cancel prevents a pending call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 400))
    const [debounced, cancel] = result.current

    debounced()
    cancel()
    vi.advanceTimersByTime(400)

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes the latest callback', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 400), {
      initialProps: { cb: first },
    })

    result.current[0]()
    rerender({ cb: second })
    vi.advanceTimersByTime(400)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('cancels a pending call on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 400))

    result.current[0]()
    unmount()
    vi.advanceTimersByTime(400)

    expect(callback).not.toHaveBeenCalled()
  })
})
