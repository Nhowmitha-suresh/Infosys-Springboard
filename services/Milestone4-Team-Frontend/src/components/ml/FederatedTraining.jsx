import MetricCard from './MetricCard'

// Mock federated learning state. In production this would come from
// GET /federated/rounds/current and GET /federated/nodes on the
// training coordinator service.
const ROUND = {
  current: 47,
  total: 70,
  status: 'Aggregating client updates',
  eta: '~18 min',
}

const NODES = [
  { hospital: 'St. Vincent Medical Center', location: 'Chicago, IL', status: 'online', samples: '18,420', accuracy: '92.1%', lastSync: '2 min ago' },
  { hospital: 'Riverside General Hospital', location: 'Austin, TX', status: 'online', samples: '14,860', accuracy: '90.8%', lastSync: '2 min ago' },
  { hospital: 'Mercy Health Network', location: 'Portland, OR', status: 'syncing', samples: '21,205', accuracy: '91.4%', lastSync: 'syncing…' },
  { hospital: 'Lakeshore Regional Clinic', location: 'Cleveland, OH', status: 'online', samples: '9,730', accuracy: '89.6%', lastSync: '3 min ago' },
  { hospital: 'Northgate Care Alliance', location: 'Seattle, WA', status: 'offline', samples: '12,050', accuracy: '—', lastSync: '1 hr ago' },
  { hospital: 'Sunrise Community Hospital', location: 'Tampa, FL', status: 'online', samples: '16,340', accuracy: '92.7%', lastSync: '4 min ago' },
]

const STATUS_LABEL = { online: 'Online', syncing: 'Syncing', offline: 'Offline' }
const STATUS_BADGE = { online: 'active', syncing: 'training', offline: 'archived' }

function FederatedTraining() {
  const progressPct = Math.round((ROUND.current / ROUND.total) * 100)
  const onlineCount = NODES.filter((n) => n.status !== 'offline').length

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">Federated Training</h1>

      <div className="row g-3 metrics-row">
        <div className="col-md-3">
          <MetricCard label="Connected Hospitals" value="23" sublabel="Registered nodes" />
        </div>
        <div className="col-md-3">
          <MetricCard label="Current Round" value={`${ROUND.current}/${ROUND.total}`} sublabel={ROUND.status} />
        </div>
        <div className="col-md-3">
          <MetricCard label="Global Accuracy" value="91.6%" sublabel="Validated post-aggregation" />
        </div>
        <div className="col-md-3">
          <MetricCard label="Active Nodes" value={`${onlineCount}/${NODES.length}`} sublabel="Shown below" />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel__header">
          <h3 className="panel__title">Training Round Progress</h3>
          <span className="status-badge status-badge--training">{ROUND.status}</span>
        </div>
        <p className="panel__subtext">
          Round {ROUND.current} of {ROUND.total} · Estimated completion {ROUND.eta}.
          Each round aggregates locally-trained weight updates from participating
          hospitals via secure averaging — raw patient data never leaves a node.
        </p>
        <div className="progress-track">
          <div className="progress-track__fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="progress-track__label">{progressPct}% complete</div>
      </div>

      <div className="panel">
        <div className="panel__header">
          <h3 className="panel__title">Participating Nodes</h3>
        </div>
        <p className="panel__subtext">
          Local training status for each connected hospital in the federation.
        </p>

        <div className="data-table data-table--nodes">
          <div className="data-table__row data-table__row--head">
            <span>Hospital</span>
            <span>Location</span>
            <span>Status</span>
            <span>Local Samples</span>
            <span>Local Accuracy</span>
            <span>Last Sync</span>
          </div>
          {NODES.map((n) => (
            <div className="data-table__row" key={n.hospital}>
              <span className="data-table__primary">{n.hospital}</span>
              <span>{n.location}</span>
              <span>
                <span className={`status-badge status-badge--${STATUS_BADGE[n.status]}`}>
                  {STATUS_LABEL[n.status]}
                </span>
              </span>
              <span>{n.samples}</span>
              <span>{n.accuracy}</span>
              <span>{n.lastSync}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default FederatedTraining
