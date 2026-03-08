import WakeupProvider from '@/components/WakeupProvider'
import LogForm from '@/components/LogForm'
import BarChart from '@/components/BarChart'
import DispersionChart from '@/components/DispersionChart'
import AdSense from '@/components/AdSense'
import Toast from '@/components/Toast'

export default function Page() {
  return (
    <WakeupProvider>
      <div className="container">
        <header>
          <span className="moon-icon">🌙</span>
          <h1>Night <em>Watch</em></h1>
          <p className="subtitle">Sleep disturbance tracker</p>
        </header>

        <div className="app-layout">
          <div className="sidebar">
            <LogForm />
            <AdSense />
          </div>
          <div className="charts-col">
            <BarChart />
            <DispersionChart />
          </div>
        </div>
      </div>
      <Toast />
    </WakeupProvider>
  )
}
