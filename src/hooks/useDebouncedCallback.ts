import { useEffect, useRef } from 'react'

export function useDebouncedCallback(callback: () => void, delay: number) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cancel = () => clearTimeout(timeoutRef.current)

  useEffect(() => cancel, [])

  const debounced = () => {
    cancel()
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay)
  }

  return [debounced, cancel] as const
}
