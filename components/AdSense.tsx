'use client'

import { useEffect, useRef } from 'react'

export default function AdSense() {
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
