import { useState } from 'react'
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase, type Subscription, type NewSubscription } from '../lib/supabase'
import { validateSubscription, sanitizeText, type SubscriptionInput, type FieldErrors } from '../lib/validation'

type Props = {
  onCreated: (sub: Subscription) => void
}

const PLANS = ['Starter', 'Pro', 'Enterprise'] as const
const STATUSES = ['Active', 'Trialing', 'Churned'] as const

export function AddSubscriptionForm({ onCreated }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [input, setInput] = useState<SubscriptionInput>({
    customer_name: '',
    email: '',
    plan: 'Starter',
    mrr: '',
    contract_duration_months: '12',
    status: 'Active',
    start_date: today,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [banner, setBanner] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null)

  function update<K extends keyof SubscriptionInput>(key: K, val: string) {
    setInput((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBanner(null)
    const { errors: errs, clean } = validateSubscription(input)
    setErrors(errs)
    if (!clean) {
      setBanner({ kind: 'error', msg: 'Please fix the highlighted fields before submitting.' })
      return
    }

    const payload: NewSubscription = {
      customer_name: sanitizeText(input.customer_name),
      email: sanitizeText(input.email),
      plan: input.plan as NewSubscription['plan'],
      mrr: Number(input.mrr),
      contract_duration_months: Number(input.contract_duration_months) || 0,
      status: input.status as NewSubscription['status'],
      start_date: input.start_date,
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      if (!data) {
        // Safe fallback per the security audit: never bind a partial/error body.
        setBanner({ kind: 'error', msg: 'Subscription not found. Please try again.' })
        return
      }
      onCreated(data as Subscription)
      setBanner({ kind: 'success', msg: 'Subscription added — metrics updated.' })
      setInput({
        customer_name: '',
        email: '',
        plan: 'Starter',
        mrr: '',
        contract_duration_months: '12',
        status: 'Active',
        start_date: today,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add subscription.'
      setBanner({ kind: 'error', msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <Plus size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Add Subscription
        </h3>
      </div>

      {banner && (
        <div className={`banner ${banner.kind}`} role="alert">
          {banner.kind === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}{' '}
          {banner.msg}
        </div>
      )}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="f-name">Customer Name</label>
          <input
            id="f-name"
            className={`input ${errors.customer_name ? 'error' : ''}`}
            value={input.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            aria-invalid={!!errors.customer_name}
            aria-describedby={errors.customer_name ? 'err-name' : undefined}
          />
          {errors.customer_name && (
            <p id="err-name" className="field-error">{errors.customer_name}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input
            id="f-email"
            type="email"
            className={`input ${errors.email ? 'error' : ''}`}
            value={input.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'err-email' : undefined}
          />
          {errors.email && (
            <p id="err-email" className="field-error">{errors.email}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="f-plan">Plan</label>
          <select
            id="f-plan"
            className="select"
            value={input.plan}
            onChange={(e) => update('plan', e.target.value)}
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-mrr">MRR (USD / month)</label>
          <input
            id="f-mrr"
            type="number"
            min={0}
            step="0.01"
            className={`input ${errors.mrr ? 'error' : ''}`}
            value={input.mrr}
            onChange={(e) => update('mrr', e.target.value)}
            aria-invalid={!!errors.mrr}
            aria-describedby={errors.mrr ? 'err-mrr' : undefined}
          />
          {errors.mrr && (
            <p id="err-mrr" className="field-error">{errors.mrr}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="f-dur">Contract Duration (months)</label>
          <input
            id="f-dur"
            type="number"
            min={0}
            className={`input ${errors.contract_duration_months ? 'error' : ''}`}
            value={input.contract_duration_months}
            onChange={(e) => update('contract_duration_months', e.target.value)}
          />
          {errors.contract_duration_months && (
            <p className="field-error">{errors.contract_duration_months}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select
            id="f-status"
            className="select"
            value={input.status}
            onChange={(e) => update('status', e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-date">Start Date</label>
          <input
            id="f-date"
            type="date"
            className={`input ${errors.start_date ? 'error' : ''}`}
            value={input.start_date}
            onChange={(e) => update('start_date', e.target.value)}
          />
          {errors.start_date && (
            <p className="field-error">{errors.start_date}</p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Subscription'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setErrors({})
              setBanner(null)
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
