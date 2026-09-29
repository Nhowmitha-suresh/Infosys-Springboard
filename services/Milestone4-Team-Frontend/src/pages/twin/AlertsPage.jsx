// src/pages/twin/AlertsPage.jsx
import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { getAlerts, acknowledgeAlert, deleteAlert } from '../../api/alertService'
import { useAuth } from '../../context/AuthContext'

export default function AlertsPage() {
  const { user } = useAuth()
  const canDelete = user?.role === 'ADMIN'

  const [alerts, setAlerts] = useState(null)
  const [filter, setFilter] = useState('open')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    const data = await getAlerts()
    setAlerts(data)
  }

  useEffect(() => { load() }, [])

  async function handleAcknowledge(id) {
    setBusyId(id)
    try {
      await acknowledgeAlert(id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this alert?')) return
    await deleteAlert(id)
    await load()
  }

  const visible = alerts ? (filter === 'open' ? alerts.filter((a) => !a.acknowledged) : alerts) : null

  return (
    <DashboardLayout title="Clinical Alerts">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p className="text-muted mb-0">
          Raised automatically from the live vitals stream and high-risk predictions, or added manually.
        </p>
        <select className="form-select" style={{ maxWidth: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="open">Open only</option>
          <option value="all">All (incl. acknowledged)</option>
        </select>
      </div>

      <div className="ms-card p-2 p-md-3">
        {!visible ? (
          <Loader />
        ) : visible.length === 0 ? (
          <EmptyState icon="bi-bell" title={filter === 'open' ? 'No open alerts' : 'No alerts'} subtitle="All clear for now." />
        ) : (
          <div className="table-responsive">
            <table className="table ms-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Patient</th>
                  <th>Alert</th>
                  <th>Source</th>
                  <th>Raised</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id}>
                    <td><Badge status={a.severity} /></td>
                    <td className="fw-semibold">{a.patientName || `Patient #${a.patientId}`}</td>
                    <td>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{a.title}</div>
                      <div className="text-muted small" style={{ maxWidth: 340 }}>{a.message}</div>
                    </td>
                    <td>{a.source}</td>
                    <td className="ms-mono-cell">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                    <td className="text-end">
                      {!a.acknowledged && (
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleAcknowledge(a.id)}
                          disabled={busyId === a.id}
                        >
                          {busyId === a.id ? '…' : 'Acknowledge'}
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
