import type { Subscription } from './supabase'

export type Metrics = {
  mrr: number
  arr: number
  churnRate: number
  activeCount: number
  totalCustomers: number
  arpu: number
}

export function computeMetrics(subs: Subscription[]): Metrics {
  const active = subs.filter((s) => s.status === 'Active')
  const churned = subs.filter((s) => s.status === 'Churned')
  const mrr = active.reduce((sum, s) => sum + Number(s.mrr), 0)
  const arr = mrr * 12
  const total = subs.length
  // Churn rate = churned / (active + churned). Guard against divide-by-zero.
  const denom = active.length + churned.length
  const churnRate = denom === 0 ? 0 : (churned.length / denom) * 100
  const arpu = active.length === 0 ? 0 : mrr / active.length
  return {
    mrr,
    arr,
    churnRate,
    activeCount: active.length,
    totalCustomers: total,
    arpu,
  }
}

export type VelocityPoint = {
  month: string
  revenue: number
  customers: number
}

// Build a month-by-month revenue velocity series from subscription start dates.
export function computeVelocity(subs: Subscription[]): VelocityPoint[] {
  const map = new Map<string, { revenue: number; customers: number }>()
  for (const s of subs) {
    const d = new Date(s.start_date)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = map.get(key) ?? { revenue: 0, customers: 0 }
    entry.revenue += Number(s.mrr)
    entry.customers += 1
    map.set(key, entry)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({
      month,
      revenue: Math.round(v.revenue),
      customers: v.customers,
    }))
}

// Average contract value over the contract duration. Guard against zero duration
// (the "NaN Metric Crash" bug from the report).
export function averageContractValue(sub: Subscription): number {
  const duration = Number(sub.contract_duration_months)
  if (!duration || duration === 0) return 0
  return (Number(sub.mrr) * duration) / duration
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}
