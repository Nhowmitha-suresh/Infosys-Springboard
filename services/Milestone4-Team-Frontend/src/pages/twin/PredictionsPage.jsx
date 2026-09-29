// src/pages/twin/PredictionsPage.jsx
import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { getPredictions, runPrediction, deletePrediction } from '../../api/predictionService'
import { getPatients } from '../../api/patientService'
import { useAuth } from '../../context/AuthContext'

export default function PredictionsPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'DOCTOR'

  const [predictions, setPredictions] = useState(null)
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    const [predData, patientData] = await Promise.all([getPredictions(), getPatients()])
    setPredictions(predData)
    setPatients(patientData)
    setSelectedPatientId((prev) => prev || (patientData[0] ? String(patientData[0].id) : ''))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRun() {
    if (!selectedPatientId) return
    setRunning(true)
    setError(null)
    try {
      await runPrediction(Number(selectedPatientId))
      await load()
    } catch (err) {
      setError(err.displayMessage || 'Failed to run prediction')
    } finally {
      setRunning(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this prediction?')) return
    await deletePrediction(id)
    await load()
  }

  return (
    <DashboardLayout title="Risk Predictions">
      <p className="text-muted mb-4">Run the risk model against a patient's condition, age, and latest vitals.</p>

      {canManage && (
        <div className="ms-card p-3 p-md-4 mb-4">
          <h6 className="brand-font mb-3">Run a new prediction</h6>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <div className="d-flex gap-2 flex-wrap align-items-end">
            <div>
              <label className="form-label small text-muted">Patient</label>
              <select
                className="form-select"
                style={{ minWidth: 260 }}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.condition})</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleRun} disabled={running || !selectedPatientId}>
              <i className="bi bi-graph-up-arrow me-1"></i> {running ? 'Running…' : 'Run Prediction'}
            </button>
          </div>
        </div>
      )}

      <div className="ms-card p-2 p-md-3">
        {!predictions ? (
          <Loader />
        ) : predictions.length === 0 ? (
          <EmptyState icon="bi-graph-up-arrow" title="No predictions yet" subtitle="Run a prediction above to see risk model output here." />
        ) : (
          <div className="table-responsive">
            <table className="table ms-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Risk Type</th>
                  <th>Risk</th>
                  <th>Contributing Factors</th>
                  <th>Run At</th>
                  {canManage && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => {
                  const patient = patients.find((pt) => pt.id === p.patientId)
                  return (
                    <tr key={p.id}>
                      <td className="fw-semibold">{patient ? patient.name : `Patient #${p.patientId}`}</td>
                      <td>{p.riskType}</td>
                      <td>
                        <span className="ms-mono-cell me-2">{p.riskPercent}%</span>
                        <Badge status={p.riskLevel} />
                      </td>
                      <td className="text-muted small" style={{ maxWidth: 320 }}>{p.factors}</td>
                      <td className="ms-mono-cell">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
                      {canManage && (
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
