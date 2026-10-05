import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import SoundControls from './SoundControls'
afterEach(() => vi.unstubAllGlobals())
test('音效開關、10 段音量與停止計時後不發聲', async () => {
  const stop = vi.fn()
  const start = vi.fn()
  const setValue = vi.fn()
  const close = vi.fn().mockResolvedValue(undefined)
  const oscillator = { type: '', frequency: {setValueAtTime:vi.fn()}, connect:vi.fn(), disconnect:vi.fn(), start, stop, onended:null }
  const createOscillator = vi.fn(() => oscillator)
  vi.stubGlobal('AudioContext', class {
    currentTime = 0; state = 'running'; destination = {}
    resume = vi.fn().mockResolvedValue(undefined); close = close; createOscillator = createOscillator
    createGain = () => ({gain:{value:0,setValueAtTime:setValue,exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),disconnect:vi.fn()})
  })
  const view = render(<SoundControls seconds={1800} running={true} />)
  const toggle = screen.getByRole('button', {name:'秒針音效'})
  const slider = screen.getByRole('slider', {name:'音量'})
  expect(toggle).toHaveAttribute('aria-pressed','false')
  expect(slider).toHaveAttribute('min','1'); expect(slider).toHaveAttribute('max','10')
  await act(async () => fireEvent.click(toggle))
  expect(toggle).toHaveAttribute('aria-pressed','true')
  fireEvent.change(slider,{target:{value:'10'}})
  expect(setValue).toHaveBeenLastCalledWith(1,0)
  view.rerender(<SoundControls seconds={1799} running={true} />)
  expect(start).toHaveBeenCalledTimes(1); expect(stop).toHaveBeenCalledWith(0.05)
  view.rerender(<SoundControls seconds={1798} running={false} />)
  expect(start).toHaveBeenCalledTimes(1)
  fireEvent.click(toggle)
  expect(setValue).toHaveBeenLastCalledWith(0,0)
  view.rerender(<SoundControls seconds={1797} running={true} />)
  expect(start).toHaveBeenCalledTimes(1)
  view.unmount(); expect(close).toHaveBeenCalled()
})
test('音訊不可用時保留靜音並顯示原因', async () => {
  vi.stubGlobal('AudioContext', class { constructor(){throw new Error('unsupported')} })
  render(<SoundControls seconds={1800} running={false} />)
  await act(async () => fireEvent.click(screen.getByRole('button', {name:'秒針音效'})))
  expect(screen.getByRole('alert')).toHaveTextContent('無法啟用音效')
  expect(screen.getByRole('button', {name:'秒針音效'})).toHaveAttribute('aria-pressed','false')
})
