import { useState } from 'react'

function FlipPanel({ value, label }: { value: string; label: string }) {
  const [frame, setFrame] = useState({ value, previous: value })
  if (frame.value !== value) setFrame({ value, previous: frame.value })
  const changed = frame.previous !== frame.value
  return <div className="flip-unit">
    <div className="flip-panel">
      <span className="flip-number">{value}</span>
      {changed && <span key={`top-${value}`} className="flip-leaf flip-leaf-top"><span>{frame.previous}</span></span>}
      {changed && <span key={`bottom-${value}`} className="flip-leaf flip-leaf-bottom"><span>{value}</span></span>}
      <span className="flip-seam" />
    </div>
    <span className="flip-label">{label}</span>
  </div>
}

export default function FlipClock({ seconds, time }: { seconds: number; time: string }) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return <div className="flip-clock" role="timer" aria-labelledby="time-label" aria-live="off">
    <span className="clock-readable">{time}</span>
    <div className="flip-display" aria-hidden="true">
      <FlipPanel value={hours} label="時" />
      <FlipPanel value={minutes} label="分" />
      <FlipPanel value={remainingSeconds} label="秒" />
    </div>
  </div>
}
