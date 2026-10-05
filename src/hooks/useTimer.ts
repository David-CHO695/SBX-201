import { useCallback, useEffect, useRef, useState } from 'react'

import { DURATION_MS } from '../config/timer'
type Status = 'idle' | 'running' | 'paused' | 'completed'
type TimerState = { remainingMs: number; status: Status }
const initialState: TimerState = { remainingMs: DURATION_MS, status: 'idle' }

export function useTimer() {
  const [state, setState] = useState<TimerState>(initialState)
  // Refs make consecutive actions safe even before React renders again.
  const current = useRef(initialState)
  const deadline = useRef(0)
  const publish = useCallback((next: TimerState) => {
    current.current = next
    setState(next)
  }, [])

  const update = useCallback(() => {
    if (current.current.status !== 'running') return
    const remainingMs = Math.max(0, deadline.current - Date.now())
    publish({ remainingMs, status: remainingMs === 0 ? 'completed' : 'running' })
  }, [publish])

  useEffect(() => {
    if (state.status !== 'running') return
    const interval = window.setInterval(update, 100)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') update()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    update()
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [state.status, update])

  const start = useCallback(() => {
    if (current.current.status !== 'idle' && current.current.status !== 'paused') return
    deadline.current = Date.now() + current.current.remainingMs
    publish({ ...current.current, status: 'running' })
  }, [publish])

  const pause = useCallback(() => {
    if (current.current.status !== 'running') return
    const remainingMs = Math.max(0, deadline.current - Date.now())
    publish({ remainingMs, status: remainingMs === 0 ? 'completed' : 'paused' })
  }, [publish])

  const reset = useCallback(() => {
    deadline.current = 0
    publish(initialState)
  }, [publish])

  return { ...state, start, pause, reset }
}
