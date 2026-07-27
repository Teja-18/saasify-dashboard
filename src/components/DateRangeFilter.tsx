import { useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'

export type DateRange = { start: string; end: string }

type Props = {
  value: DateRange
  onChange: (range: DateRange) => void
  onReset: () => void
}

export function DateRangeFilter({ value, onChange, onReset }: Props) {
  const [localError, setLocalError] = useState<string | null>(null)

  function handleStart(next: string) {
    const range = { ...value, start: next }
    if (range.end && next && new Date(next) > new Date(range.end)) {
      setLocalError('Start date cannot be after end date')
    } else {
      setLocalError(null)
    }
    onChange(range)
  }

  function handleEnd(next: string) {
    const range = { ...value, end: next }
    if (range.start && next && new Date(range.start) > new Date(next)) {
      setLocalError('Start date cannot be after end date')
    } else {
      setLocalError(null)
    }
    onChange(range)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">
          <Filter size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Date Range Filter
        </h3>
        <button className="btn btn-ghost" onClick={onReset} aria-label="Reset date filter">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      <div className="filter-row">
        <div className="field">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            className="input"
            value={value.start}
            onChange={(e) => handleStart(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            className="input"
            value={value.end}
            onChange={(e) => handleEnd(e.target.value)}
          />
        </div>
      </div>
      {localError && <p className="field-error" role="alert">{localError}</p>}
    </div>
  )
}
