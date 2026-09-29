// src/pages/precisioncare/PrecisionCarePage.jsx
//
// Milestone 4: AI-assisted risk prediction, personalized care plans,
// outcome measurement, provider collaboration and clinical guideline
// compliance — backed by the Spring Boot backend's PrecisionCareController
// (see src/api/precisionCareService.js), not mock data. Every number here
// comes from the `pc_*` tables, seeded for patient 102 (Arjun Verma) in
// backend/src/main/resources/data.sql.

import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import KpiCard from '../../components/precisioncare/KpiCard'
import CareplanCard from '../../components/precisioncare/CareplanCard'
import OutcomeMeasurement from '../../components/precisioncare/OutcomeMeasurement'
import ProviderCollaboration from '../../components/precisioncare/ProviderCollaboration'
import ClinicalGuidelineCompliance from '../../components/precisioncare/ClinicalGuidelineCompliance'
import { getSummary } from '../../api/precisionCareService'
import { getPatients } from '../../api/patientService'
import '../../styles/precision-care.css'

export default function PrecisionCarePage() {
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, patientList] = await Promise.all([getSummary(), getPatients()])
      setSummary(summaryData)
      setPatients(patientList)
      setPatientId((prev) => {
        if (prev) return prev
        // Default to patient 102 (Arjun Verma), the demo patient seeded with
        // precision-care data, falling back to whichever patient is first.
        const hasDemoPatient = patientList.some((p) => p.id === 102)
        return hasDemoPatient ? 102 : patientList[0]?.id ?? null
      })
    } catch (err) {
      setError(err.displayMessage || 'Failed to load the Precision Care summary.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <DashboardLayout title="Precision Care Management">
      <div className="precision-care-scope">
        <div className="page predictions-page">
          <div className="page-header">
            <div>
              <div className="eyebrow">MILESTONE 4 / AI CLINICAL DECISION SUPPORT</div>
              <h1>Precision Care Management</h1>
              <p>AI-assisted risk prediction, personalized interventions and measurable outcomes for the care team.</p>
            </div>
            <div className="header-actions">
              {patients.length > 0 && (
                <select
                  className="patient-select"
                  value={patientId ?? ''}
                  onChange={(e) => setPatientId(Number(e.target.value))}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {loading && <Loader label="Loading Precision Care summary…" />}
          {!loading && error && <div className="pc-error-banner">{error}</div>}

          {!loading && !error && summary && (
            <div className="kpi-grid four">
              <KpiCard label="Patients assessed" value={summary.patientsAssessed} trend={`At-risk cohort ${summary.atRiskCohort}`} trendDirection="up" icon="people" />
              <KpiCard label="Prediction confidence" value={`${summary.predictionConfidencePercent}%`} trend="Avg. across active plans" trendDirection="up" icon="cpu" />
              <KpiCard label="Adherence rate" value={`${summary.adherenceRatePercent}%`} trend="Avg. across active plans" trendDirection="up" icon="clipboard-check" />
              <KpiCard label="Hospitalization risk" value={`↓ ${summary.hospitalizationRiskReductionPercent}%`} trend="Avg. prevented events" trendDirection="down" icon="shield-check" />
            </div>
          )}

          {!loading && !error && patientId && (
            <>
              <CareplanCard patientId={patientId} />
              <OutcomeMeasurement patientId={patientId} />
              <ProviderCollaboration patientId={patientId} />
              <ClinicalGuidelineCompliance patientId={patientId} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
