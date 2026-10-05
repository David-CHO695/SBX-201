import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(0) })
afterEach(() => vi.useRealTimers())
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
test('完整首頁、計次與各自的顏色循環', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('David 的AI 學習筆記')
  for (let i = 1; i <= 3; i++) { click('跟我打聲招呼'); expect(screen.getByText(`你已經按了 ${i} 次。`)).toBeVisible() }
  const option = screen.getByRole('button', { name: '選項一 · 綠' })
  for (const color of ['紅', '橙', '黃', '藍', '紫', '紅']) { fireEvent.click(option); expect(option).toHaveTextContent(`選項一 · ${color}`) }
  expect(screen.getByRole('button', { name: '選項二 · 綠' })).toBeVisible()
  expect(screen.getByRole('button', { name: '選項三 · 綠' })).toBeVisible()
})
test('選單 Escape 恢復焦點，外部點擊關閉，導覽不重置計時', () => {
  render(<App />)
  click('開始')
  click('主選單')
  expect(screen.getByRole('button', { name: '主選單' })).toHaveAttribute('aria-expanded', 'true')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.getByRole('button', { name: '主選單' })).toHaveFocus()
  click('主選單')
  fireEvent.click(screen.getByRole('heading', { level: 1 }))
  expect(screen.getByRole('button', { name: '主選單' })).toHaveAttribute('aria-expanded', 'false')
  click('主選單')
  const link = screen.getByRole('link', { name: '番茄鐘' })
  expect(link).toHaveAttribute('href', '#pomodoro')
  fireEvent.click(link)
  click('跟我打聲招呼')
  click('選項二 · 綠')
  act(() => vi.advanceTimersByTime(2000))
  expect(screen.getByRole('timer')).toHaveTextContent('29:58')
  expect(vi.getTimerCount()).toBe(1)
})
