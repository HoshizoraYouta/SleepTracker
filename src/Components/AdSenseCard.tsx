import { useEffect } from 'react'
import Card from './Card'

export default function AdSenseCard() {
  useEffect(() => {
    if (!document.querySelector('script[data-adsense]')) {
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3748697422526362'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.dataset.adsense = 'true'
      document.head.appendChild(script)
    }

    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <Card>
      <span className="ad-label">advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: 250, minHeight: 250 }}
        data-ad-client="ca-pub-3748697422526362"
        data-ad-slot="3789967810"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </Card>
  )
}