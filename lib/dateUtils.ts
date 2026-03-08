export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function last7Dates() {
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }
  return dates
}

export function shortLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]} ${d}`
}

export function timeToHour(t: string) {
  const [h, m] = t.split(':').map(Number)
  let hour = h + m / 60
  if (hour < 13) hour += 24
  return hour
}

export function hourLabel(h: number) {
  const a = h >= 24 ? h - 24 : h
  return `${String(Math.floor(a)).padStart(2,'0')}:00`
}

export function dotColor(h: number) {
  const a = h >= 24 ? h - 24 : h
  if (a < 2) return 'rgba(180,142,245,0.9)'
  if (a < 4) return 'rgba(240,122,122,0.9)'
  if (a < 6) return 'rgba(240,200,122,0.9)'
  return 'rgba(126,184,247,0.9)'
}
