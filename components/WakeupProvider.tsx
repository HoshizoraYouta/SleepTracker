'use client'

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react'
import { getDay, saveDay } from '@/lib/storage'
import { todayStr } from '@/lib/dateUtils'

interface WakeupContextValue {
  selectedDate: string
  setSelectedDate: (d: string) => void
  wakeTime: string
  setWakeTime: (t: string) => void
  times: string[]
  addWakeup: () => void
  removeWakeup: (t: string) => void
  toast: string
  toastVisible: boolean
  refreshKey: number
}

const WakeupContext = createContext<WakeupContextValue | null>(null)

export function useWakeup() {
  const ctx = useContext(WakeupContext)
  if (!ctx) throw new Error('useWakeup must be used within WakeupProvider')
  return ctx
}

export default function WakeupProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState(todayStr)
  const [wakeTime, setWakeTime] = useState('')
  const [times, setTimes] = useState<string[]>(() => getDay(todayStr()))
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200)
  }, [])

  const setSelectedDate = useCallback((d: string) => {
    setSelectedDateState(d)
    setTimes(getDay(d))
  }, [])

  const addWakeup = useCallback(() => {
    if (!wakeTime) { showToast('Please pick a time first'); return }
    const current = getDay(selectedDate)
    if (current.includes(wakeTime)) { showToast('Already logged that time!'); return }
    const updated = [...current, wakeTime]
    saveDay(selectedDate, updated)
    setTimes(getDay(selectedDate))
    setRefreshKey(k => k + 1)
    showToast(`Logged ${wakeTime} ✓`)
  }, [wakeTime, selectedDate, showToast])

  const removeWakeup = useCallback((t: string) => {
    const updated = getDay(selectedDate).filter(x => x !== t)
    saveDay(selectedDate, updated)
    setTimes(getDay(selectedDate))
    setRefreshKey(k => k + 1)
  }, [selectedDate])

  return (
    <WakeupContext.Provider value={{ selectedDate, setSelectedDate, wakeTime, setWakeTime, times, addWakeup, removeWakeup, toast, toastVisible, refreshKey }}>
      {children}
    </WakeupContext.Provider>
  )
}
