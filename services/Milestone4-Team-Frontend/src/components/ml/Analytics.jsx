import MetricCard from './MetricCard'

// Mock analytics aggregates. In production these would come from
// GET /analytics/summary on the reporting service.
const RISK_DISTRIBUTION = [
  { label: 'Low Risk', value: 186, color: '#2ecc71' },
  { label: 'Moderate Risk', value: 98, color: '#6cb4ff' },
  { label: 'High Risk', value: 58, color: '#ff4d4d' },
]

const PREDICTION_VOLUME = [
  { label: 'Mar', value: 940 },
  { label: 'Apr', value: 1020 },
  { label: 'May', value: 1145 },
  { label: 'Jun', value: 1080 },
  { label: 'Jul', value: 1210 },
  { label: 'Aug', value: 1284 },
]

const ACCURACY_BY_VERSION = [
  { label: 'v1.4', value: 85.7 },
  { label: 'v2.0', value: 89.2 },
  { label: 'v2.1', value: 91.6 },
  { label: 'v3.0-beta', value: 93.1 },
]

function BarList({ data, unit = '', maxOverride }) {
  const max = maxOverride ?? Math.max(...data.map((d) => d.value))
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <span className="bar-row__label">{d.label}</span>
          <div className="bar-row__track">
            <div
              className="bar-row__fill"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color || '#6cb4ff',
              }}
            />
          </div>
          <span className="bar-row__value">
            {d.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

function Analytics() {
  const totalPatients = RISK_DISTRIBUTION.reduce((sum, d) => sum + d.value, 0)

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">Analytics</h1>

      <div className="row g-3 metrics-row">
        <div className="col-md-3">
          <MetricCard label="Predictions This Month" value="1,284" sublabel="+6.1% vs. July" />
        </div>
        <div className="col-md-3">
          <MetricCard label="Avg. Model Latency" value="142ms" sublabel="p95 inference time" />
        </div>
        <div className="col-md-3">
          <MetricCard label="High-Risk Flagged" value="17%" sublabel="Of total predictions" />
        </div>
        <div className="col-md-3">
          <MetricCard label="Data Freshness" value="Daily" sublabel="Last sync: 06:00 UTC" />
        </div>
      </div>

      <div className="models-grid">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Risk Distribution</h3>
          </div>
          <p className="panel__subtext">
            Current risk classification across {totalPatients} patients with an
            active prediction on record.
          </p>
          <BarList data={RISK_DISTRIBUTION} />
        </div>

        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Model Accuracy by Version</h3>
          </div>
          <p className="panel__subtext">
            Cross-validated accuracy at each release, tracked across federated
            training rounds.
          </p>
          <BarList data={ACCURACY_BY_VERSION} unit="%" maxOverride={100} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel__header">
          <h3 className="panel__title">Prediction Volume Trend</h3>
        </div>
        <p className="panel__subtext">Monthly risk predictions generated, last 6 months.</p>
        <BarList data={PREDICTION_VOLUME} />
      </div>
    </main>
  )
}

export default Analytics
