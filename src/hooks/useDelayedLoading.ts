import { useState, useEffect } from 'react'

/**
 * Prevents spinner flash on fast responses.
 * Returns true only after `isLoading` has been true for longer than `delayMs`.
 * Use this to control spinner VISIBILITY only — never use it to gate data access.
 * Always use the raw `isLoading` from useQuery to guard against undefined data.
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 80): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isLoading) { setShow(false); return }
    const timer = setTimeout(() => setShow(true), delayMs)
    return () => clearTimeout(timer)
  }, [isLoading, delayMs])

  return show
}
