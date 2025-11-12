import { useEffect, useState } from 'react'

export default function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [realOnline, setRealOnline] = useState(navigator.onLine)

  useEffect(() => {
    function updateBasic() { setOnline(navigator.onLine) }
    window.addEventListener('online', updateBasic)
    window.addEventListener('offline', updateBasic)
    return () => {
      window.removeEventListener('online', updateBasic)
      window.removeEventListener('offline', updateBasic)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let interval

    async function ping() {
      if (!navigator.onLine) { if (!cancelled) setRealOnline(false); return }
      const ctrl = new AbortController()
      const timeoutId = setTimeout(() => ctrl.abort(), 3000) // 3s timeout
      try {
        // CORS-safe endpoint; no-cors will give an opaque response but resolves if online.
        await fetch('https://www.gstatic.com/generate_204?ts=' + Date.now(), {
          method: 'GET',
          cache: 'no-store',
          mode: 'no-cors',
          signal: ctrl.signal,
        })
        if (!cancelled) setRealOnline(true)
      } catch {
        if (!cancelled) setRealOnline(false)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // Initial and periodic checks
    ping()
    interval = setInterval(ping, 8000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Must have both: browser online and successful ping
  return online && realOnline
}
