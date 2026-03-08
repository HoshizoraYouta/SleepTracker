'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useWakeup } from '@/components/WakeupProvider'
import { getDay } from '@/lib/storage'
import { last7Dates, timeToHour, hourLabel, dotColor } from '@/lib/dateUtils'

Chart.register(...registerables)

interface WakeupPoint { x: number; y: number; label: string }

export default function DispersionChart() {
  const { refreshKey } = useWakeup()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [peakInfo, setPeakInfo] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
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

    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(canvasRef.current, {
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
  }, [refreshKey])

  useEffect(() => () => { chartRef.current?.destroy() }, [])

  return (
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
        <canvas ref={canvasRef} />
      </div>
      {peakInfo && (
        <div className="peak-window" dangerouslySetInnerHTML={{ __html: peakInfo.replace(/(\d{2}:\d{2})/g, '<strong>$1</strong>') }} />
      )}
    </div>
  )
}
