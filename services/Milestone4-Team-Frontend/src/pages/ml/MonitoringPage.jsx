import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMonitoringSocket } from '../../api/monitoringSocket'
import {
  listRules,
  evaluateVitals,
  listExecutions,
  listNotifications,
  markNotificationStatus,
} from '../../api/monitoringService'
import DashboardLayout from '../../components/layout/DashboardLayout'
import MetricCard from '../../components/ml/MetricCard'
import '../../styles/ml.css'

const DEMO_PATIENTS = ['P001', 'P002', 'P003']

const SEVERITY_COLOR = {
  critical: '#ff4d4d',
  warning: '#f5a524',
  info: '#4c86f5',
}

const DEFAULT_VITALS = {
  hr: 78,
  spo2: 97,
  systolic: 122,
  diastolic: 78,
  temp: 36.9,
  context: 'At rest',
  baselineHr: 70,
}

function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function MonitoringPage() {
  const [rules, setRules] = useState([])
  const [rulesError, setRulesError] = useState(null)
  const [rulesLoading, setRulesLoading] = useState(true)

  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0])
  const [vitals, setVitals] = useState(DEFAULT_VITALS)
  const [evaluating, setEvaluating] = useState(false)
  const [evalError, setEvalError] = useState(null)
  const [lastFired, setLastFired] = useState(null)

  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(true)
  const [notifError, setNotifError] = useState(null)

  const [executions, setExecutions] = useState([])
  const [execLoading, setExecLoading] = useState(true)

  const fetchRules = useCallback(async () => {
    setRulesLoading(true)
    setRulesError(null)
    try {
      const data = await listRules()
      setRules(data)
    } catch (err) {
      setRulesError(
        err.displayMessage ||
          'Could not reach the monitoring-service (Milestone 3). Is it running on port 4000?'
      )
    } finally {
      setRulesLoading(false)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true)
    setNotifError(null)
    try {
      const data = await listNotifications({ limit: 20 })
      setNotifications(data)
    } catch (err) {
      setNotifError(err.displayMessage || 'Failed to load notifications.')
    } finally {
      setNotifLoading(false)
    }
  }, [])

  const fetchExecutions = useCallback(async () => {
    setExecLoading(true)
    try {
      const data = await listExecutions({ limit: 25 })
      setExecutions(data)
    } catch {
      // Non-critical panel — leave the previous list showing rather than
      // surfacing a second error banner on top of the rules/notifications ones.
    } finally {
      setExecLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
    fetchNotifications()
    fetchExecutions()
  }, [fetchRules, fetchNotifications, fetchExecutions])

  // Live notifications over Socket.IO — every connected client auto-joins
  // the global "notifications" room (see monitoring-service/src/sockets).
  useEffect(() => {
    const socket = getMonitoringSocket()
    const onNew = (payload) => {
      setNotifications((prev) => [
        {
          notification_id: payload.id,
          patient_id: payload.patientId,
          rule_name: payload.alert?.ruleName,
          notification_type: payload.notificationType,
          title: payload.title,
          message: payload.message,
          status: payload.status,
          created_at: payload.createdAt,
        },
        ...prev,
      ].slice(0, 20))
    }
    socket.on('notification:new', onNew)
    return () => socket.off('notification:new', onNew)
  }, [])

  const activeCount = useMemo(() => rules.filter((r) => r.is_active).length, [rules])
  const criticalToday = useMemo(
    () => notifications.filter((n) => n.notification_type === 'critical').length,
    [notifications]
  )

  const handleVitalChange = (field) => (e) => {
    const value = field === 'context' ? e.target.value : Number(e.target.value)
    setVitals((v) => ({ ...v, [field]: value }))
  }

  const handleEvaluate = async (e) => {
    e.preventDefault()
    setEvaluating(true)
    setEvalError(null)
    setLastFired(null)
    try {
      const result = await evaluateVitals({
        patient: { id: patientId, name: patientId, baselineHr: vitals.baselineHr },
        vitals,
        history: [],
      })
      setLastFired(result.fired || [])
      fetchExecutions()
      // Notifications also arrive over the socket in real time; refetch too
      // so the list is correct even if the socket briefly missed a beat.
      fetchNotifications()
    } catch (err) {
      setEvalError(
        err.displayMessage ||
          'Evaluation failed. Make sure this patient has a prediction on ML Models -> Prediction first.'
      )
    } finally {
      setEvaluating(false)
    }
  }

  const handleAcknowledge = async (notificationId) => {
    try {
      await markNotificationStatus(notificationId, 'READ')
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === notificationId ? { ...n, status: 'READ' } : n))
      )
    } catch {
      // Best-effort — leave status as-is if the request fails.
    }
  }

  return (
    <DashboardLayout title="Continuous Monitoring">
      <main className="dashboard">
        <h1 className="dashboard__title">Continuous Monitoring &amp; Alerts</h1>
        <p className="dashboard__subtitle" style={{ marginTop: -8, marginBottom: 20, color: '#6b7280' }}>
          Milestone 3 — served by the Node/Express + Socket.IO monitoring-service. Evaluates vitals
          against a database-backed clinical rule catalog and pushes alerts in real time. Demo patient
          IDs: {DEMO_PATIENTS.join(', ')} (same set as ML Models).
        </p>

        {(rulesError || notifError) && (
          <div className="ml-demo-banner" role="alert">
            {rulesError || notifError}
          </div>
        )}

        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3">
            <MetricCard label="Active Rules" value={rulesLoading ? '…' : activeCount} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard label="Rule Catalog" value={rulesLoading ? '…' : rules.length} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard label="Recent Notifications" value={notifLoading ? '…' : notifications.length} />
          </div>
          <div className="col-6 col-md-3">
            <MetricCard label="Critical (recent)" value={notifLoading ? '…' : criticalToday} />
          </div>
        </div>

        <div className="models-grid">
          {/* Simulate a vitals reading */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__title">Simulate a Vitals Reading</span>
            </div>
            <p className="panel__subtext">
              Runs every active clinical rule against this reading (<strong>POST /api/monitoring/evaluate</strong>),
              logs the audit trail, and pushes a notification for anything that fires.
            </p>

            <form onSubmit={handleEvaluate} className="d-flex flex-column gap-2">
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <label className="panel__subtext mb-0" style={{ minWidth: 70 }}>Patient</label>
                <select
                  className="model-select"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  {DEMO_PATIENTS.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>

                <select
                  className="model-select"
                  value={vitals.context}
                  onChange={handleVitalChange('context')}
                >
                  <option value="At rest">At rest</option>
                  <option value="Light activity">Light activity</option>
                </select>
              </div>

              <div className="row g-2">
                <div className="col-4">
                  <label className="panel__subtext mb-1">HR (bpm)</label>
                  <input type="number" className="model-select w-100" value={vitals.hr} onChange={handleVitalChange('hr')} />
                </div>
                <div className="col-4">
                  <label className="panel__subtext mb-1">SpO2 (%)</label>
                  <input type="number" className="model-select w-100" value={vitals.spo2} onChange={handleVitalChange('spo2')} />
                </div>
                <div className="col-4">
                  <label className="panel__subtext mb-1">Temp (°C)</label>
                  <input type="number" step="0.1" className="model-select w-100" value={vitals.temp} onChange={handleVitalChange('temp')} />
                </div>
                <div className="col-4">
                  <label className="panel__subtext mb-1">Systolic</label>
                  <input type="number" className="model-select w-100" value={vitals.systolic} onChange={handleVitalChange('systolic')} />
                </div>
                <div className="col-4">
                  <label className="panel__subtext mb-1">Diastolic</label>
                  <input type="number" className="model-select w-100" value={vitals.diastolic} onChange={handleVitalChange('diastolic')} />
                </div>
                <div className="col-4">
                  <label className="panel__subtext mb-1">Baseline HR</label>
                  <input type="number" className="model-select w-100" value={vitals.baselineHr} onChange={handleVitalChange('baselineHr')} />
                </div>
              </div>

              <button type="submit" className="btn-link btn-link--accent mt-2" disabled={evaluating}>
                {evaluating ? 'Evaluating…' : 'Run Rule Evaluation'}
              </button>
            </form>

            {evalError && <p className="prediction-panel__row mt-2" style={{ color: '#ff4d4d' }}>{evalError}</p>}

            {lastFired && (
              <div className="mt-3">
                {lastFired.length === 0 ? (
                  <p className="prediction-panel__row">No rule fired for this reading — all clear.</p>
                ) : (
                  lastFired.map((alert) => (
                    <div key={alert.id} className="prediction-panel__row" style={{ borderLeft: `3px solid ${SEVERITY_COLOR[alert.severity] || '#8a97a0'}`, paddingLeft: 10, marginBottom: 8 }}>
                      <strong>{alert.ruleName}</strong> — {alert.message}
                      <br />
                      <span style={{ color: '#9ca3af' }}>{alert.analysis} · confidence {(alert.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Clinical rule catalog */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__title">Clinical Rule Catalog</span>
              <button className="btn-link" onClick={fetchRules} disabled={rulesLoading}>Refresh</button>
            </div>
            {rulesLoading ? (
              <p className="panel__subtext">Loading rules…</p>
            ) : rules.length === 0 ? (
              <p className="panel__subtext">No rules configured yet.</p>
            ) : (
              <div className="data-table">
                <div className="data-table__row data-table__row--head">
                  <span>Rule</span>
                  <span>Category</span>
                  <span>Status</span>
                </div>
                {rules.map((rule) => (
                  <div key={rule.rule_id} className="data-table__row">
                    <span className="data-table__primary">{rule.rule_name}</span>
                    <span>{rule.category}</span>
                    <span style={{ color: rule.is_active ? '#12b76a' : '#8a97a0' }}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="models-grid mt-3">
          {/* Live notifications */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__title">Live Notifications</span>
              <button className="btn-link" onClick={fetchNotifications} disabled={notifLoading}>Refresh</button>
            </div>
            <p className="panel__subtext">
              Streamed in real time over Socket.IO as rules fire, in addition to the periodic refresh.
            </p>
            {notifLoading ? (
              <p className="panel__subtext">Loading notifications…</p>
            ) : notifications.length === 0 ? (
              <p className="panel__subtext">No notifications yet — run an evaluation above to generate one.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {notifications.map((n) => (
                  <div
                    key={n.notification_id}
                    className="prediction-panel__row"
                    style={{ borderLeft: `3px solid ${SEVERITY_COLOR[n.notification_type] || '#8a97a0'}`, paddingLeft: 10 }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <strong>{n.title}</strong> — {n.message}
                        <br />
                        <span style={{ color: '#9ca3af' }}>{n.patient_id} · {formatTime(n.created_at)} · {n.status}</span>
                      </div>
                      {n.status !== 'READ' && (
                        <button className="btn-link" onClick={() => handleAcknowledge(n.notification_id)}>
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rule execution audit trail */}
          <div className="panel">
            <div className="panel__header">
              <span className="panel__title">Rule Execution Audit Trail</span>
              <button className="btn-link" onClick={fetchExecutions} disabled={execLoading}>Refresh</button>
            </div>
            {execLoading ? (
              <p className="panel__subtext">Loading executions…</p>
            ) : executions.length === 0 ? (
              <p className="panel__subtext">No evaluations logged yet.</p>
            ) : (
              <div className="data-table">
                <div className="data-table__row data-table__row--head">
                  <span>Patient</span>
                  <span>Rule</span>
                  <span>Result</span>
                </div>
                {executions.map((ex) => (
                  <div key={ex.execution_id} className="data-table__row">
                    <span className="data-table__primary">{ex.patient_id}</span>
                    <span>{ex.rule_name}</span>
                    <span style={{ color: ex.triggered ? '#ff4d4d' : '#8a97a0' }}>
                      {ex.triggered ? 'Fired' : 'No match'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
