import { useCallback, useEffect, useState } from 'react'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import { getCarePlan, approveCarePlan, sendCarePlanToPatient } from '../../api/precisionCareService'

function CareplanCard({ patientId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getCarePlan(patientId))
    } catch (err) {
      if (err?.response?.status === 404) {
        setData(null)
      } else {
        setError(err.displayMessage || 'Failed to load the care plan.')
      }
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2200) }

  const handleApprove = async () => {
    setBusy(true)
    try {
      await approveCarePlan(patientId)
      await load()
      notify('Care plan approved')
    } catch (err) {
      notify(err.displayMessage || 'Failed to approve plan')
    } finally {
      setBusy(false)
    }
  }

  const handleSend = async () => {
    setBusy(true)
    try {
      await sendCarePlanToPatient(patientId)
      await load()
      notify('Care plan sent to patient')
    } catch (err) {
      notify(err.displayMessage || 'Failed to send plan')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <section className="careplan-section"><Loader label="Loading care plan…" /></section>
  if (error) return <section className="careplan-section"><div className="pc-error-banner">{error}</div></section>
  if (!data) {
    return (
      <section className="careplan-section">
        <EmptyState icon="bi-clipboard2-x" title="No precision care plan yet" subtitle="This patient doesn't have an AI-generated intervention plan on file." />
      </section>
    )
  }

  const { plan, patientName, goals } = data

  return (
    <section className="careplan-section">
      <div className="careplan-head">
        <div>
          <div className="eyebrow">AI-GENERATED INTERVENTION PLAN</div>
          <h2>Personalized Careplan</h2>
          <p>{patientName} • {plan.diagnosisSummary} • {plan.planVersion}</p>
        </div>
        <span className="ai-status"><i className="bi bi-stars" /> {plan.status}</span>
      </div>
      <div className="careplan-grid">
        {goals.map((goal) => (
          <article className="goal-card" key={goal.id}>
            <div className="goal-number">{String(goal.goalNumber).padStart(2, '0')}</div>
            <div>
              <span className="goal-label">{goal.label}</span>
              <h3>{goal.title}</h3>
              <p><b>Intervention:</b> {goal.intervention}</p>
              <p><b>Monitoring:</b> {goal.monitoring}</p>
            </div>
            <span className="goal-state">{goal.state}</span>
          </article>
        ))}
      </div>
      <div className="careplan-footer">
        <div>
          <span>Predicted outcome</span>
          <strong>CVD risk ↓ to {plan.predictedCvdRisk}%</strong>
          <small>Adherence score: {plan.adherenceScore}% • Hospitalization risk ↓ {plan.hospitalizationRiskReduction}%</small>
        </div>
        <div className="careplan-actions">
          <button className="secondary-btn" disabled={busy} onClick={() => notify('Plan edit workflow not implemented yet')}>Modify plan</button>
          <button className="primary-btn" disabled={busy} onClick={handleApprove}>Approve plan</button>
          <button className="text-btn" disabled={busy} onClick={handleSend}>Send to patient</button>
        </div>
      </div>
      {toast && <div className="m4-toast"><i className="bi bi-check-circle-fill" /> {toast}</div>}
    </section>
  )
}

export default CareplanCard
