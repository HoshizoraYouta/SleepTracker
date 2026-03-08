'use client'

import { useWakeup } from '@/components/WakeupProvider'

export default function Toast() {
  const { toast, toastVisible } = useWakeup()
  return <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
}
