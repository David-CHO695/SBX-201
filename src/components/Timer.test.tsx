import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import Timer from './Timer'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
  render(<StrictMode><Timer /></StrictMode>)
})
afterEach(() => { cleanup(); vi.useRealTimers() })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

test('初始 30:00，開始一秒後為 29:59，暫停後可繼續', () => {
  expect(screen.getByRole('timer')).toHaveTextContent('30:00')
  expect(screen.getByRole('button', { name: '暫停' })).toBeDisabled()
  click('開始')
  click('開始')
  expect(screen.getByRole('button', { name: '開始' })).toBeDisabled()
  advance(1000)
  expect(screen.getByRole('timer')).toHaveTextContent('29:59')
  click('暫停')
  advance(5000)
  expect(screen.getByRole('timer')).toHaveTextContent('29:59')
  expect(screen.getByRole('status')).toHaveTextContent('已暫停')
  click('繼續')
  advance(1000)
  expect(screen.getByRole('timer')).toHaveTextContent('29:58')
})

test('顯示採向上整秒', () => {
  click('開始')
  advance(900)
  expect(screen.getByRole('timer')).toHaveTextContent('30:00')
  advance(100)
  expect(screen.getByRole('timer')).toHaveTextContent('29:59')
})

test.each(['running', 'paused'])('%s 狀態重置恢復初始且停止倒數', (status) => {
  click('開始')
  advance(2000)
  if (status === 'paused') click('暫停')
  click('重置')
  advance(5000)
  expect(screen.getByRole('timer')).toHaveTextContent('30:00')
  expect(screen.getByRole('status')).toHaveTextContent('準備專注')
  expect(screen.getByRole('button', { name: '開始' })).toBeEnabled()
  expect(vi.getTimerCount()).toBe(0)
})

test('30 分鐘後停止於零、禁止重啟，重置後才能再開始', () => {
  click('開始')
  advance(30 * 60 * 1000)
  expect(screen.getByRole('timer')).toHaveTextContent('00:00')
  expect(screen.getByRole('status')).toHaveTextContent('本次專注已完成')
  expect(screen.getByRole('button', { name: '開始' })).toBeDisabled()
  expect(screen.getByRole('button', { name: '暫停' })).toBeDisabled()
  expect(vi.getTimerCount()).toBe(0)
  advance(60000)
  expect(screen.getByRole('timer')).toHaveTextContent('00:00')
  click('重置')
  click('開始')
  advance(1000)
  expect(screen.getByRole('timer')).toHaveTextContent('29:59')
})

test('所有狀態的操作啟用狀態與 PRD 一致，狀態區域不包含逐秒時間', () => {
  const verify = (status: string, startName: string, canStart: boolean, canPause: boolean) => {
    expect(screen.getByRole('status')).toHaveTextContent(status)
    expect(screen.getByRole('status')).not.toContainElement(screen.getByRole('timer'))
    expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'off')
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByRole('button', { name: startName })).toHaveProperty('disabled', !canStart)
    expect(screen.getByRole('button', { name: '暫停' })).toHaveProperty('disabled', !canPause)
    expect(screen.getByRole('button', { name: '重置' })).toBeEnabled()
  }
  verify('準備專注', '開始', true, false)
  click('開始')
  advance(1000)
  verify('專注中', '開始', false, true)
  click('暫停')
  verify('已暫停', '繼續', true, false)
  click('繼續')
  advance(30 * 60 * 1000)
  verify('本次專注已完成', '開始', false, false)
  click('重置')
  verify('準備專注', '開始', true, false)
})
