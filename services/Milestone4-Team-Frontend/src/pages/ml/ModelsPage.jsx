import { useCallback, useEffect, useState } from 'react'
import mlClient from '../../api/mlClient'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PredictionPanel from '../../components/ml/PredictionPanel'
import ShapExplainability from '../../components/ml/ShapExplainability'
import ModelVersioning from '../../components/ml/ModelVersioning'
import '../../styles/ml.css'

/**
 * ML Console — Model Versioning, Prediction & SHAP Explainability.
 *
 * Talks directly to the ml-service/ Flask microservice (see
 * src/api/mlClient.js), NOT the Java backend. This is a genuinely
 * separate, trained Random Forest model (ml-service/models/patient_risk_v1.pkl)
 * operating over its own feature table (ml_patient_data, seeded with demo
 * patients P001-P003) — it is intentionally kept apart from the
 * operational "Predictions" page under /predictions, which runs the
 * transparent heuristic risk score wired into the main patient records,
 * alerts, and care-plan workflow. Use patient IDs like "P001" here, not
 * the numeric patient IDs from Patients/Appointments.
 */
export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVersionId, setSelectedVersionId] = useState(null)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await mlClient.get('/models')
      setModels(res.data)
      const active = res.data.find((m) => m.status === 'Active')
      setSelectedVersionId((prev) => prev ?? active?.version_id ?? res.data[0]?.version_id ?? null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load model versions from the ML service.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return (
    <DashboardLayout title="ML Models">
      <main className="dashboard">
        <h1 className="dashboard__title">ML Models — Risk Prediction Engine</h1>
        <p className="dashboard__subtitle" style={{ marginTop: -8, marginBottom: 20, color: '#6b7280' }}>
          Served by the Python/Flask ML microservice (ml-service/). Demo patient IDs: P001, P002, P003.
        </p>

        <PredictionPanel />

        <div className="models-grid">
          <ShapExplainability />
          <ModelVersioning
            models={models}
            loading={loading}
            error={error}
            onRefresh={fetchModels}
            selectedVersionId={selectedVersionId}
            onSelectVersion={setSelectedVersionId}
          />
        </div>
      </main>
    </DashboardLayout>
  )
}
