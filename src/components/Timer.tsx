import { useTimer } from '../hooks/useTimer'
import './Timer.css'
import SoundControls from './SoundControls'
import FlipClock from './FlipClock'
import { DURATION_MINUTES } from '../config/timer'

const statusText = {
  idle: '準備專注',
  running: '專注中',
  paused: '已暫停',
  completed: '本次專注已完成',
}
const guidance = {
  idle: '準備好了嗎？從一個小目標開始。',
  running: '把注意力留在當下，其他的事稍後再說。',
  paused: '喘口氣，準備好再繼續。',
  completed: '辛苦了！按下重置，開始下一次專注。',
}

export default function Timer() {
  const { remainingMs, status, start, pause, reset } = useTimer()
  const seconds = Math.ceil(remainingMs / 1000)
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  return (
    <section className="timer-card" data-state={status} aria-label="專注計時器">
      <div className="timer-heading">
        <h2>專注時間</h2>
        <span className="duration-label">{DURATION_MINUTES} 分鐘</span>
      </div>
      <p className="timer-status" role="status" aria-live="polite" aria-atomic="true">
        <span className="status-dot" aria-hidden="true" />
        {statusText[status]}
      </p>
      <div className="timer-face">
        <span className="time-caption" id="time-label">剩餘時間</span>
        <FlipClock seconds={seconds} time={time} />
      </div>
      <p className="timer-guidance">{guidance[status]}</p>
      <div className="timer-actions" role="group" aria-label="計時操作">
        <button className="primary-action" type="button" onClick={start} disabled={status === 'running' || status === 'completed'}>
          {status === 'paused' ? '繼續' : '開始'}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'running'}>暫停</button>
        <button type="button" onClick={reset}>重置</button>
      </div>
      <SoundControls seconds={seconds} running={status === 'running'} />
      <p className="timer-note">重置會回到 {DURATION_MINUTES}:00；重新整理不保留進度。</p>
    </section>
  )
}

