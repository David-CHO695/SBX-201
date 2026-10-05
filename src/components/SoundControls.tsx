import { useEffect, useRef, useState } from 'react'

type Props = { seconds: number; running: boolean }
export default function SoundControls({ seconds, running }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(5)
  const [error, setError] = useState('')
  const context = useRef<AudioContext | null>(null)
  const gain = useRef<GainNode | null>(null)
  const previousSecond = useRef(seconds)
  const pending = useRef(false)

  useEffect(() => () => { void context.current?.close().catch(() => {}) }, [])
  useEffect(() => {
    if (gain.current && context.current) gain.current.gain.setValueAtTime(enabled ? volume / 10 : 0, context.current.currentTime)
  }, [enabled, volume])
  useEffect(() => {
    const changed = previousSecond.current !== seconds
    previousSecond.current = seconds
    if (!changed || !running || !enabled || !context.current || !gain.current || document.visibilityState === 'hidden') return
    const audio = context.current
    if (audio.state !== 'running') return
    const oscillator = audio.createOscillator()
    const envelope = audio.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1000, audio.currentTime)
    envelope.gain.setValueAtTime(0.0001, audio.currentTime)
    envelope.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.003)
    envelope.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.045)
    oscillator.connect(envelope)
    envelope.connect(gain.current)
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
    oscillator.start()
    oscillator.stop(audio.currentTime + 0.05)
  }, [seconds, running, enabled])

  const toggleSound = async () => {
    if (enabled) { setEnabled(false); return }
    if (pending.current) return
    pending.current = true
    try {
      if (!context.current) {
        context.current = new AudioContext()
        gain.current = context.current.createGain()
        gain.current.gain.value = 0
        gain.current.connect(context.current.destination)
      }
      await context.current.resume()
      setEnabled(true)
      setError('')
    } catch { setError('無法啟用音效，請確認瀏覽器音訊設定。') }
    finally { pending.current = false }
  }
  return <div className="sound-controls">
    <div className="sound-copy"><button type="button" className="sound-toggle" aria-label="秒針音效" aria-pressed={enabled} onClick={toggleSound}>{enabled ? '🔊 音效開啟' : '🔇 靜音'}</button><p>倒數時每秒一聲滴答</p>{error && <p role="alert">{error}</p>}</div>
    <div className="volume-control"><div className="volume-track"><input id="tick-volume" type="range" min="1" max="10" step="1" value={volume} aria-label="音量" aria-orientation="vertical" aria-valuetext={`${volume} / 10`} onChange={event => setVolume(Number(event.target.value))} /><div className="volume-ticks" aria-hidden="true">{Array.from({length:10}, (_, i) => <span key={i}>{10 - i}</span>)}</div></div><label htmlFor="tick-volume">音量 {volume}/10</label></div>
  </div>
}
