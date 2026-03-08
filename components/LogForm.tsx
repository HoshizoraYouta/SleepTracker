'use client'

import { useWakeup } from '@/components/WakeupProvider'

export default function LogForm() {
  const { selectedDate, setSelectedDate, wakeTime, setWakeTime, times, addWakeup, removeWakeup } = useWakeup()

  return (
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
  )
}
