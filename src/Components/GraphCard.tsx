import { useEffect, useRef } from 'react'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  ScatterController,
  LineController,
  BarController,
  Filler,
} from 'chart.js'
import Card from './Card'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  ScatterController,
  LineController,
  BarController,
  Filler,
)

const GraphType = {
  line: 'line',
  scatter: 'scatter',
  bar: 'bar',
} as const

type GraphType = typeof GraphType[keyof typeof GraphType]

interface GraphCardProps {
  graphType?: GraphType
  graphData: number[]
  graphLabels: string[]
  graphTitle: string
}

export default function GraphCard({ graphType = GraphType.line, graphData, graphLabels, graphTitle }: GraphCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    chartRef.current?.destroy()

    const isScatter = graphType === 'scatter'
    const data = isScatter
      ? graphData.map((y, i) => ({ x: i, y }))
      : graphData

    chartRef.current = new Chart(canvasRef.current, {
      type: graphType,
      data: {
        labels: isScatter ? undefined : graphLabels,
        datasets: [
          {
            data,
            borderColor: '#7eb8f7',
            backgroundColor: graphType === 'bar' ? 'rgba(126,184,247,0.3)' : 'rgba(126,184,247,0.15)',
            pointBackgroundColor: '#b48ef5',
            tension: 0.4,
            fill: graphType === 'line',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#4a5490', font: { family: 'DM Mono', size: 11 } },
            grid: { color: '#1e2440' },
          },
          y: {
            ticks: { color: '#4a5490', font: { family: 'DM Mono', size: 11 } },
            grid: { color: '#1e2440' },
          },
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [graphType, graphData, graphLabels])

  return (
    <Card title={graphTitle}>
      <div style={{ position: 'relative', height: '240px' }}>
        <canvas ref={canvasRef} />
      </div>
    </Card>
  )
}

