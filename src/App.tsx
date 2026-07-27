import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wifi, WifiOff, Activity } from 'lucide-react'
import { supabase, type Subscription } from './lib/supabase'
import { computeMetrics, computeVelocity } from './lib/metrics'
import { readCache, writeCache, isOnline } from './lib/storage'
import { KpiCards } from './components/KpiCards'
import { DateRangeFilter, type DateRange } from './components/DateRangeFilter'
import { AddSubscriptionForm } from './components/AddSubscriptionForm'
import { RevenueVelocityChart } from './components/RevenueVelocityChart'
import { SubscriptionsTable } from './components/SubscriptionsTable'

export default function App() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(isOnline())
  const [usingCache, setUsingCache] = useState(false)
  const [range, setRange] = useState<DateRange>({ start: '', end: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []) as Subscription[]
      setSubs(rows)
      writeCache(rows)
      setUsingCache(false)
    } catch {
      // Network failed — fall back to cached LocalStorage data.
      const cached = readCache()
      setSubs(cached)
      setUsingCache(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      load()
    }
    const goOffline = () => {
      setOnline(false)
      setUsingCache(true)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [load])

  const filtered = useMemo(() => {
    if (!range.start && !range.end) return subs
    return subs.filter((s) => {
      const d = new Date(s.start_date).getTime()
      const start = range.start ? new Date(range.start).getTime() : -Infinity
      const end = range.end ? new Date(range.end).getTime() + 86_400_000 : Infinity
      return d >= start && d <= end
    })
  }, [subs, range])

  const metrics = useMemo(() => computeMetrics(filtered), [filtered])
  const velocity = useMemo(() => computeVelocity(filtered), [filtered])

  function handleCreated(sub: Subscription) {
    setSubs((prev) => {
      const next = [sub, ...prev]
      writeCache(next)
      return next
    })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            <Activity size={22} />
          </div>
          <div>
            <h1>SaaSify Metrics Hub</h1>
            <p>Real-time subscription revenue analytics</p>
          </div>
        </div>
        <span
          className="status-pill"
          aria-live="polite"
          aria-label={online ? 'Online — connected to database' : 'Offline — using cached data'}
        >
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          {online ? 'Live · Connected' : 'Offline · Cached'}
        </span>
      </header>

      {usingCache && (
        <div className="banner info" role="status">
          You're offline. Showing cached data from your last session — new entries are saved
          locally and sync when you reconnect.
        </div>
      )}

      <KpiCards metrics={metrics} loading={loading} />

      <DateRangeFilter
        value={range}
        onChange={setRange}
        onReset={() => setRange({ start: '', end: '' })}
      />

      <div className="layout">
        <AddSubscriptionForm onCreated={handleCreated} />
        <div>
          <RevenueVelocityChart data={velocity} loading={loading} />
          <SubscriptionsTable subscriptions={filtered} loading={loading} />
        </div>
      </div>
    </div>
  )
}
