import { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Users, Percent } from 'lucide-react'
import type { Metrics } from '../lib/metrics'
import { formatCurrency, formatPercent } from '../lib/metrics'

type Props = {
  metrics: Metrics
  loading: boolean
}

export function KpiCards({ metrics, loading }: Props) {
  return (
    <section className="grid-kpi" aria-label="Key performance indicators">
      <KpiCard
        label="Monthly Recurring Revenue"
        value={formatCurrency(metrics.mrr)}
        sub={`${metrics.activeCount} active subscriptions`}
        icon={<TrendingUp size={16} />}
        live
        loading={loading}
      />
      <KpiCard
        label="Annual Recurring Revenue"
        value={formatCurrency(metrics.arr)}
        sub="MRR × 12"
        icon={<Calendar size={16} />}
        loading={loading}
      />
      <KpiCard
        label="Total Customers"
        value={String(metrics.totalCustomers)}
        sub={`${metrics.activeCount} active · ${metrics.totalCustomers - metrics.activeCount} others`}
        icon={<Users size={16} />}
        loading={loading}
      />
      <KpiCard
        label="Churn Rate"
        value={formatPercent(metrics.churnRate)}
        sub={`ARPU ${formatCurrency(metrics.arpu)}`}
        icon={<Percent size={16} />}
        loading={loading}
      />
    </section>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  live,
  loading,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  live?: boolean
  loading: boolean
}) {
  const [display, setDisplay] = useState(value)
  useEffect(() => setDisplay(value), [value])

  return (
    <div className="kpi-card">
      <p className="kpi-label">
        {icon}
        {label}
      </p>
      {loading ? (
        <div className="skeleton" style={{ width: '70%', height: 28 }} />
      ) : (
        <p
          className="kpi-value"
          aria-live={live ? 'polite' : undefined}
          aria-label={`${label}: ${display}`}
        >
          {display}
        </p>
      )}
      <p className="kpi-sub">{sub}</p>
    </div>
  )
}
