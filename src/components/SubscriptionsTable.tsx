import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Subscription } from '../lib/supabase'
import { formatCurrency } from '../lib/metrics'

type Props = {
  subscriptions: Subscription[]
  loading: boolean
}

const PAGE_SIZE = 8

export function SubscriptionsTable({ subscriptions, loading }: Props) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subscriptions
    return subscriptions.filter(
      (s) =>
        s.customer_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q),
    )
  }, [subscriptions, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function statusBadge(status: Subscription['status']) {
    const cls = status === 'Active' ? 'active' : status === 'Churned' ? 'churned' : 'trialing'
    return <span className={`badge ${cls}`}>{status}</span>
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Subscriptions</h3>
      </div>

      <div className="search-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: 11, color: '#8a9bbd' }}
            aria-hidden
          />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name, email, plan, or status…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            aria-label="Search subscriptions"
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Plan</th>
              <th>MRR</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Start</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <p className="empty">No subscriptions match your search.</p>
                </td>
              </tr>
            ) : (
              pageRows.map((s) => (
                <tr key={s.id}>
                  <td>{s.customer_name}</td>
                  <td>{s.email}</td>
                  <td>{s.plan}</td>
                  <td>{formatCurrency(Number(s.mrr))}</td>
                  <td>{s.contract_duration_months} mo</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>{s.start_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="pagination">
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span>
            Page {safePage + 1} of {pageCount} · {filtered.length} rows
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next page"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
