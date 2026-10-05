import { StrictMode, createElement } from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useTimer } from './useTimer'

const duration = 30 * 60 * 1000
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('暫停取最新毫秒數，等待不耗時，繼續沿用剩餘時間', () => {
  const { result } = renderHook(useTimer)
  act(() => result.current.start())
  act(() => vi.advanceTimersByTime(1250))
  act(() => result.current.pause())
  expect(result.current.remainingMs).toBe(duration - 1250)
  expect(result.current.status).toBe('paused')
  expect(vi.getTimerCount()).toBe(0)
  act(() => vi.advanceTimersByTime(5000))
  expect(result.current.remainingMs).toBe(duration - 1250)
  act(() => result.current.start())
  act(() => vi.advanceTimersByTime(750))
  act(() => result.current.pause())
  expect(result.current.remainingMs).toBe(duration - 2000)
})

test('同一輪及倒數途中重複開始不延長截止時間或建立多個排程', () => {
  const { result } = renderHook(useTimer)
  act(() => { result.current.start(); result.current.start() })
  expect(vi.getTimerCount()).toBe(1)
  act(() => vi.advanceTimersByTime(1000))
  act(() => result.current.start())
  act(() => vi.advanceTimersByTime(1000))
  expect(result.current.remainingMs).toBe(duration - 2000)
  expect(vi.getTimerCount()).toBe(1)
})

test('排程延遲後使用實際時間校正，不依賴 interval 次數', () => {
  const { result } = renderHook(useTimer)
  act(() => result.current.start())
  act(() => { vi.setSystemTime(60000); vi.advanceTimersByTime(100) })
  expect(result.current.remainingMs).toBe(duration - 60100)
})

test('返回前景立即校正並可直接進入完成狀態', () => {
  const { result } = renderHook(useTimer)
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  act(() => result.current.start())
  act(() => {
    vi.setSystemTime(60000)
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current.remainingMs).toBe(duration - 60000)
  act(() => {
    vi.setSystemTime(duration + 1)
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current.remainingMs).toBe(0)
  expect(result.current.status).toBe('completed')
  expect(vi.getTimerCount()).toBe(0)
})

test('排程尚未更新時按暫停，仍正確判定已到期', () => {
  const { result } = renderHook(useTimer)
  act(() => result.current.start())
  act(() => { vi.setSystemTime(duration); result.current.pause() })
  expect(result.current.status).toBe('completed')
  expect(result.current.remainingMs).toBe(0)
  act(() => result.current.start())
  expect(result.current.status).toBe('completed')
})

test('StrictMode 下卸載清除計時器及所有前景監聽，重新掛載回到初始值', () => {
  const add = vi.spyOn(document, 'addEventListener')
  const remove = vi.spyOn(document, 'removeEventListener')
  const { result, unmount } = renderHook(useTimer, {
    wrapper: ({ children }) => createElement(StrictMode, null, children),
  })
  act(() => result.current.start())
  expect(vi.getTimerCount()).toBe(1)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
  const listeners = add.mock.calls.filter(([name]) => name === 'visibilitychange')
  expect(listeners.length).toBeGreaterThan(0)
  for (const [, listener] of listeners) {
    expect(remove).toHaveBeenCalledWith('visibilitychange', listener)
  }
  const fresh = renderHook(useTimer)
  expect(fresh.result.current.remainingMs).toBe(duration)
  expect(fresh.result.current.status).toBe('idle')
})
