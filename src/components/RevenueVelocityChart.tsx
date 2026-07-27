import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { VelocityPoint } from '../lib/metrics'
import { formatCurrency } from '../lib/metrics'

type Props = {
  data: VelocityPoint[]
  loading: boolean
}

export function RevenueVelocityChart({ data, loading }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Revenue Velocity</h3>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : data.length === 0 ? (
        <p className="empty">No data in the selected range.</p>
      ) : (
        <div className="chart-wrap" aria-label="Revenue velocity chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid stroke="#1f2f4e" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#8a9bbd" fontSize={12} />
              <YAxis stroke="#8a9bbd" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: '#16233d',
                  border: '1px solid #1f2f4e',
                  borderRadius: 10,
                  color: '#e8eefc',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelStyle={{ color: '#8a9bbd' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="MRR added"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2dd4bf' }}
                activeDot={{ r: 5 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
