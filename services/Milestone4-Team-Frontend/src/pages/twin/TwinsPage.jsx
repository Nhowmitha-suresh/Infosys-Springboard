// src/pages/twin/TwinsPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { getTwins, syncTwin, getTwinSummary } from '../../api/twinService'
import { getPatients } from '../../api/patientService'

export default function TwinsPage() {
  const navigate = useNavigate()
  const [twins, setTwins] = useState(null)
  const [patientsById, setPatientsById] = useState({})
  const [summary, setSummary] = useState(null)
  const [syncingId, setSyncingId] = useState(null)

  async function load() {
    const [twinData, patientData, summaryData] = await Promise.all([
      getTwins(), getPatients(), getTwinSummary(),
    ])
    setTwins(twinData)
    setPatientsById(Object.fromEntries(patientData.map((p) => [p.id, p])))
    setSummary(summaryData)
  }

  useEffect(() => { load() }, [])

  async function handleSync(patientId) {
    setSyncingId(patientId)
    try {
      await syncTwin(patientId)
      await load()
    } finally {
      setSyncingId(null)
    }
  }

  return (
    <DashboardLayout title="Digital Health Twins">
      <p className="text-muted mb-4">One digital twin per patient — FHIR resource sync status and record coverage.</p>

      {!summary ? (
        <Loader />
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <StatCard icon="bi-people-fill" label="Patients onboarded" value={summary.patientsOnboarded} tint="#1c9184" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard icon="bi-diagram-3-fill" label="Twins created" value={summary.twinsCreated} tint="#4c86f5" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard icon="bi-hdd-network-fill" label="FHIR resources synced" value={summary.fhirResourcesSynced} tint="#c98a2e" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard icon="bi-shield-check" label="Twin coverage" value={`${summary.twinCoveragePercent}%`} tint="#12b76a" />
          </div>
        </div>
      )}

      <div className="ms-card p-2 p-md-3">
        {!twins ? (
          <Loader />
        ) : twins.length === 0 ? (
          <EmptyState icon="bi-diagram-3" title="No twins provisioned yet" subtitle="Twins are created automatically the first time a patient's twin is opened." />
        ) : (
          <div className="table-responsive">
            <table className="table ms-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Condition</th>
                  <th>FHIR Status</th>
                  <th>Resources</th>
                  <th>Last Synced</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {twins.map((t) => {
                  const patient = patientsById[t.patientId]
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="fw-semibold">{patient ? patient.name : `Patient #${t.patientId}`}</div>
                        <div className="text-muted small">{patient?.phone}</div>
                      </td>
                      <td>{patient?.condition || '—'}</td>
                      <td><Badge status={t.fhirSyncStatus} /></td>
                      <td className="ms-mono-cell">{t.fhirResourceCount}</td>
                      <td className="ms-mono-cell">{t.lastSyncedAt ? new Date(t.lastSyncedAt).toLocaleString() : '—'}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          title="View full patient profile"
                          onClick={() => navigate(`/patients/${t.patientId}/360`)}
                        >
                          <i className="bi bi-person-vcard"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleSync(t.patientId)}
                          disabled={syncingId === t.patientId}
                        >
                          <i className={`bi ${syncingId === t.patientId ? 'bi-arrow-repeat' : 'bi-arrow-repeat'} me-1`}></i>
                          {syncingId === t.patientId ? 'Syncing…' : 'Re-sync'}
                        </button>
                      </td>
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
