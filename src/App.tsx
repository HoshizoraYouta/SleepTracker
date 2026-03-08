import { useState, useEffect, useRef, useCallback } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ─── Types ────────────────────────────────────────────────────────────────────
interface WakeupPoint { x: number; y: number; label: string }

// ─── Storage helpers ──────────────────────────────────────────────────────────
const KEY_PREFIX = 'nw_'

function getDay(dateStr: string): string[] {
  try { return JSON.parse(localStorage.getItem(KEY_PREFIX + dateStr) || '[]') || [] }
  catch { return [] }
}

function saveDay(dateStr: string, times: string[]) {
  times.sort()
  localStorage.setItem(KEY_PREFIX + dateStr, JSON.stringify(times))
}

// ─── Date utilities ───────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function last7Dates() {
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }
  return dates
}

function shortLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]} ${d}`
}

function timeToHour(t: string) {
  const [h, m] = t.split(':').map(Number)
  let hour = h + m / 60
  if (hour < 13) hour += 24
  return hour
}

function hourLabel(h: number) {
  const a = h >= 24 ? h - 24 : h
  return `${String(Math.floor(a)).padStart(2,'0')}:00`
}

function dotColor(h: number) {
  const a = h >= 24 ? h - 24 : h
  if (a < 2) return 'rgba(180,142,245,0.9)'
  if (a < 4) return 'rgba(240,122,122,0.9)'
  if (a < 6) return 'rgba(240,200,122,0.9)'
  return 'rgba(126,184,247,0.9)'
}

// ─── AdSense component ────────────────────────────────────────────────────────
// We use useEffect to push the ad after mount — same as the inline <script> tag.
// Why a component? Keeps the ad logic isolated and re-runnable if needed.
function AdSense() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])
  return (
    <div ref={ref} className="ad-placeholder">
      <span className="ad-label">advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: 250, minHeight: 250 }}
        data-ad-client="ca-pub-3748697422526362"
        data-ad-slot="3789967810"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [wakeTime, setWakeTime] = useState('')
  const [times, setTimes] = useState<string[]>(() => getDay(todayStr()))
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [peakInfo, setPeakInfo] = useState<string | null>(null)

  const barChartRef = useRef<HTMLCanvasElement>(null)
  const dispChartRef = useRef<HTMLCanvasElement>(null)
  const barChart = useRef<Chart | null>(null)
  const dispChart = useRef<Chart | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Load times when date changes
  useEffect(() => {
    setTimes(getDay(selectedDate))
  }, [selectedDate])

  // ── Toast ──
  const showToast = (msg: string) => {
    setToast(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200)
  }

  // ── Bar chart ──
  const renderBarChart = useCallback(() => {
    if (!barChartRef.current) return
    const dates = last7Dates()
    const counts = dates.map(d => getDay(d).length)
    const labels = dates.map(shortLabel)

    const colors = counts.map(n =>
      n === 0 ? 'rgba(126,184,247,0.25)' : n <= 2 ? 'rgba(240,200,122,0.75)' : 'rgba(240,122,122,0.85)'
    )
    const borders = counts.map(n =>
      n === 0 ? 'rgba(126,184,247,0.5)' : n <= 2 ? 'rgba(240,200,122,1)' : 'rgba(240,122,122,1)'
    )

    if (barChart.current) barChart.current.destroy()
    barChart.current = new Chart(barChartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Wakeups', data: counts, backgroundColor: colors, borderColor: borders, borderWidth: 1.5, borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#151929', borderColor: '#1e2440', borderWidth: 1,
            titleColor: '#c8d0f0', bodyColor: '#8892cc',
            titleFont: { family: 'DM Mono', size: 12 }, bodyFont: { family: 'DM Mono', size: 11 },
            callbacks: {
              title: items => items[0].label,
              label: item => item.raw === 0 ? '  No wakeups 🌙' : `  ${item.raw} wakeup${(item.raw as number) > 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(30,36,64,0.6)' }, ticks: { color: '#4a5490', font: { family: 'DM Mono', size: 11 } } },
          y: {
            grid: { color: 'rgba(30,36,64,0.6)' },
            ticks: { color: '#4a5490', font: { family: 'DM Mono', size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : null },
            min: 0, suggestedMax: Math.max(4, Math.max(...counts) + 1)
          }
        }
      }
    })
  }, [])

  // ── Dispersion chart ──
  const renderDispersion = useCallback(() => {
    if (!dispChartRef.current) return
    const dates = last7Dates()
    const allTimes: { hour: number; label: string }[] = []

    dates.forEach(date => {
      getDay(date).forEach(t => {
        allTimes.push({ hour: timeToHour(t), label: t })
      })
    })

    allTimes.sort((a, b) => a.hour - b.hour)
    const STACK_GAP = 20 / 60
    const stacks: Record<number, number> = {}
    const points: WakeupPoint[] = allTimes.map(({ hour, label }) => {
      const slot = Math.round(hour / STACK_GAP)
      stacks[slot] = (stacks[slot] || 0) + 1
      return { x: hour, y: stacks[slot], label }
    })

    // Peak window
    if (allTimes.length >= 2) {
      let best: number | null = null, bestN = 0
      for (let h = 24; h < 37; h += 0.5) {
        const n = allTimes.filter(t => t.hour >= h && t.hour < h + 1).length
        if (n > bestN) { bestN = n; best = h }
      }
      if (best !== null && bestN >= 2) {
        const fmt = (h: number) => { const a = h >= 24 ? h - 24 : h; return `${String(Math.floor(a)).padStart(2,'0')}:00` }
        setPeakInfo(`⚡ Peak window: ${fmt(best)} – ${fmt(best+1)} · ${bestN} wakeup${bestN > 1 ? 's' : ''} in this hour across 7 nights`)
      } else setPeakInfo(null)
    } else setPeakInfo(null)

    if (dispChart.current) dispChart.current.destroy()
    dispChart.current = new Chart(dispChartRef.current, {
      type: 'scatter',
      data: {
        datasets: [{
          data: points,
          backgroundColor: points.map(p => dotColor(p.x)),
          borderColor: points.map(p => dotColor(p.x).replace('0.9', '1')),
          borderWidth: 1.5, pointRadius: 9, pointHoverRadius: 12,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#151929', borderColor: '#1e2440', borderWidth: 1,
            titleColor: '#c8d0f0', bodyColor: '#8892cc',
            titleFont: { family: 'DM Mono', size: 12 }, bodyFont: { family: 'DM Mono', size: 11 },
            callbacks: { title: () => '', label: item => `  Woke at ${(item.raw as WakeupPoint).label}` }
          }
        },
        scales: {
          x: {
            type: 'linear', min: 24, max: 37,
            grid: { color: 'rgba(30,36,64,0.5)' },
            ticks: { color: '#4a5490', font: { family: 'DM Mono', size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? hourLabel(v as number) : '' }
          },
          y: {
            display: false, min: 0,
            suggestedMax: Math.max(...Object.values(stacks), 3) + 1,
          }
        }
      }
    })
  }, [])

  // Re-render charts whenever times change
  useEffect(() => {
    renderBarChart()
    renderDispersion()
  }, [times, renderBarChart, renderDispersion])

  // Cleanup charts on unmount
  useEffect(() => () => {
    barChart.current?.destroy()
    dispChart.current?.destroy()
  }, [])

  // ── Stats ──
  const dates7 = last7Dates()
  const counts7 = dates7.map(d => getDay(d).length)
  const nonZero = counts7.filter(n => n > 0)
  const avg = nonZero.length ? (nonZero.reduce((a,b) => a+b,0) / nonZero.length).toFixed(1) : '—'
  const worst = counts7.length ? Math.max(...counts7) : 0
  const best = nonZero.length ? Math.min(...nonZero) : 0

  // ── Add / Remove ──
  const addWakeup = () => {
    if (!wakeTime) { showToast('Please pick a time first'); return }
    const current = getDay(selectedDate)
    if (current.includes(wakeTime)) { showToast('Already logged that time!'); return }
    const updated = [...current, wakeTime]
    saveDay(selectedDate, updated)
    setTimes(getDay(selectedDate))
    showToast(`Logged ${wakeTime} ✓`)
  }

  const removeWakeup = (t: string) => {
    const updated = getDay(selectedDate).filter(x => x !== t)
    saveDay(selectedDate, updated)
    setTimes(getDay(selectedDate))
  }

  return (
    <>
      {/* AdSense script tag — loaded once globally */}
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3748697422526362" crossOrigin="anonymous" />

      <div className="container">
        <header>
          <span className="moon-icon">🌙</span>
          <h1>Night <em>Watch</em></h1>
          <p className="subtitle">Sleep disturbance tracker</p>
        </header>

        <div className="app-layout">

          {/* ── SIDEBAR ── */}
          <div className="sidebar">
            <div className="card">
              <div className="card-title"><span>✦</span> Log a wakeup</div>

              <div className="date-row">
                <label>Night of</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>

              <div className="time-inputs">
                <div className="time-chip-group">
                  <label>Time I woke up</label>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={addWakeup}>+ Add</button>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="card-title" style={{ fontSize: '0.85rem', marginBottom: 12 }}><span>◦</span> Logged for this night</div>
                <div className="wakeup-list">
                  {times.length === 0
                    ? <span className="empty-hint">No wakeups logged yet…</span>
                    : times.map(t => (
                      <div key={t} className="wakeup-chip">
                        {t}
                        <button className="chip-remove" onClick={() => removeWakeup(t)} title="Remove">✕</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <AdSense />
          </div>

          {/* ── CHARTS COL ── */}
          <div className="charts-col">

            {/* Bar chart */}
            <div className="card">
              <div className="card-title"><span>◈</span> Last 7 nights</div>
              <div className="stats-row">
                <div className="stat-box">
                  <div className={`stat-value ${avg === '—' ? '' : Number(avg) <= 1 ? 'good' : Number(avg) <= 3 ? 'warn' : 'bad'}`}>{avg}</div>
                  <div className="stat-label">Avg / night</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{worst || '—'}</div>
                  <div className="stat-label">Worst night</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{best || '—'}</div>
                  <div className="stat-label">Best night</div>
                </div>
              </div>
              <div className="chart-wrap">
                <canvas ref={barChartRef} />
              </div>
            </div>

            {/* Dispersion chart */}
            <div className="card">
              <div className="card-title"><span>⋮</span> Wakeup time dispersion</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--dim)', marginBottom: 20, letterSpacing: '0.05em' }}>
                All wakeups from the last 7 nights plotted by time of night. Dots stack when close together — tall columns mean you wake there often.
              </p>
              <div className="dispersion-legend">
                <span className="legend-dot" style={{ background: 'var(--accent2)' }} /><span>midnight – 2am</span>
                <span className="legend-dot" style={{ background: 'var(--danger)' }} /><span>2am – 4am</span>
                <span className="legend-dot" style={{ background: 'var(--gold)' }} /><span>4am – 6am</span>
                <span className="legend-dot" style={{ background: 'var(--accent)' }} /><span>6am+</span>
              </div>
              <div className="chart-wrap" style={{ height: 280 }}>
                <canvas ref={dispChartRef} />
              </div>
              {peakInfo && (
                <div className="peak-window" dangerouslySetInnerHTML={{ __html: peakInfo.replace(/(\d{2}:\d{2})/g, '<strong>$1</strong>') }} />
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
    </>
  )
}