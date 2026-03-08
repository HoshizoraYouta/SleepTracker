'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useWakeup } from '@/components/WakeupProvider'
import { getDay } from '@/lib/storage'
import { last7Dates, shortLabel } from '@/lib/dateUtils'

Chart.register(...registerables)

export default function BarChart() {
  const { refreshKey } = useWakeup()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  const dates7 = last7Dates()
  const counts7 = dates7.map(d => getDay(d).length)
  const nonZero = counts7.filter(n => n > 0)
  const avg = nonZero.length ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '—'
  const worst = counts7.length ? Math.max(...counts7) : 0
  const best = nonZero.length ? Math.min(...nonZero) : 0

  useEffect(() => {
    if (!canvasRef.current) return
    const dates = last7Dates()
    const counts = dates.map(d => getDay(d).length)
    const labels = dates.map(shortLabel)
    const colors = counts.map(n =>
      n === 0 ? 'rgba(126,184,247,0.25)' : n <= 2 ? 'rgba(240,200,122,0.75)' : 'rgba(240,122,122,0.85)'
    )
    const borders = counts.map(n =>
      n === 0 ? 'rgba(126,184,247,0.5)' : n <= 2 ? 'rgba(240,200,122,1)' : 'rgba(240,122,122,1)'
    )

    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(canvasRef.current, {
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
  }, [refreshKey])

  useEffect(() => () => { chartRef.current?.destroy() }, [])

  return (
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
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
