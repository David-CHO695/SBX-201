import { useEffect, useRef, useState } from 'react'
import Timer from './components/Timer'
import './App.css'
import { DURATION_MINUTES } from './config/timer'

type Page = 'home' | 'pomodoro'
const colors = ['綠', '紅', '橙', '黃', '藍', '紫']
const colorKeys = ['green', 'red', 'orange', 'yellow', 'blue', 'purple']

function SiteHeader({ navigate }: { navigate: (page: Page) => void }) {
  const [choices, setChoices] = useState([0, 0])
  const cycle = (index: number) => setChoices(previous => previous.map((value, i) => i === index ? (value === 5 ? 1 : value + 1) : value))
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (!anchor.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('click', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('click', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  return <header className="site-header">
    <div className="menu-anchor" ref={anchor}>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}><span aria-hidden="true">☰</span> 主選單</button>
      <nav id="main-menu" aria-label="主選單" hidden={!open}>
        <a href="#home" onClick={() => { navigate('home'); setOpen(false) }}>學習首頁 <span aria-hidden="true">↗</span></a>
                <button className="menu-pomodoro" onClick={() => { navigate('pomodoro'); setOpen(false) }}>番茄鐘 <span aria-hidden="true">↗</span></button>
        <p className="menu-hint">互動練習 · 紅、橙、黃、藍、紫</p>
        {choices.map((color, i) => <button className="menu-color" key={i} data-color={colorKeys[color]} onClick={() => cycle(i)}><span className="color-dot" aria-hidden="true" />選項{['二', '三'][i]} · {colors[color]}</button>)}
      </nav>
    </div>
    <a className="brand" href="#home" onClick={() => navigate('home')}><span className="brand-icon" aria-hidden="true">S</span><span>SBX-201<small>學習與專注，一起開始。</small></span></a>
  </header>
}

function LearningHome() {
  const [count, setCount] = useState(0)
  return <section id="home" className="learning-card" aria-labelledby="home-title">
    <div className="eyebrow"><span className="tiny-dot" /> DIRECTOR × CODEX <span className="edition">SANDBOX / 201</span></div>
    <h1 id="home-title">David 的<br /><span>AI 學習筆記</span></h1>
    <p className="intro">你好，我是 David。<br />我負責定目標，讓 Codex 把想法變成作品。</p>
    <div className="steps" aria-label="合作流程">{['定目標', '看進度', '驗收成果'].map((step, i) => <div key={step}><span>0{i + 1}</span><strong>{step}</strong></div>)}</div>
    <div className="hello-area"><button className={`hello-button ${count % 2 ? 'clicked' : ''}`} onClick={() => setCount(c => c + 1)}>跟我打聲招呼 <span aria-hidden="true">↗</span></button><p role="status" aria-live="polite">{count ? `你已經按了 ${count} 次。` : '按下按鈕，試試你的第一個互動。'}</p></div>

  </section>
}

export default function App() {
  const [page, setPage] = useState<Page>(() => window.location.hash === '#pomodoro' ? 'pomodoro' : 'home')
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const sync = () => setPage(window.location.hash === '#pomodoro' ? 'pomodoro' : 'home')
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  const navigate = (next: Page) => {
    setPage(next)
    window.location.hash = next
  }
  useEffect(() => { if (page === 'pomodoro') heading.current?.focus() }, [page])
  return <><a className="skip-link" href={page === 'home' ? '#home' : '#pomodoro'}>跳至主要內容</a><SiteHeader navigate={navigate} /><main className={`workspace page-${page}`}><div hidden={page !== 'home'}><LearningHome /></div><section hidden={page !== 'pomodoro'} id="pomodoro" className="focus-section" aria-labelledby="focus-title"><div className="section-heading"><div><span className="eyebrow">FOCUS / {DURATION_MINUTES} MIN</span><h2 ref={heading} tabIndex={-1} id="focus-title">番茄鐘</h2></div><span className="focus-label">留給眼前的一件事</span></div><Timer /><p className="focus-footer">一次專注 {DURATION_MINUTES} 分鐘，慢慢完成重要的事。</p></section></main><footer className="site-footer"><span>從一個小作品開始，學會指揮 AI。</span><span>SBX-201 · 學習 / 實作 / 專注</span></footer></>
}
