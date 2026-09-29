import { useState } from 'react'
import mlClient from '../../api/mlClient'

function PredictionPanel() {
  const [patientId, setPatientId] = useState('P001')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePredict = async (e) => {
    e.preventDefault()
    const id = patientId.trim()
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const res = await mlClient.post('/predict', { patient_id: id })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate a prediction.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prediction-panel">
      <h3 className="prediction-panel__title">Patient Risk Prediction</h3>

      <form className="panel__header" onSubmit={handlePredict} style={{ gap: '0.5rem' }}>
        <input
          className="model-select"
          placeholder="Patient ID (e.g. P001)"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button type="submit" className="btn-link btn-link--accent" disabled={loading}>
          {loading ? 'Predicting…' : 'Run Prediction'}
        </button>
      </form>

      {error && (
        <p className="prediction-panel__row" style={{ color: '#c0392b' }}>
          {error}
        </p>
      )}

      {!result && !loading && !error && (
        <p className="prediction-panel__row">
          Enter a patient ID and click Run Prediction to call the live model.
        </p>
      )}

      {result && (
        <>
          <p className="prediction-panel__row">
            <span className="prediction-panel__key">Patient:</span> {result.patient_id}
          </p>

          <p className="prediction-panel__row">
            <span className="prediction-panel__key">Model Version:</span> {result.model_version}
          </p>

          <p className="prediction-panel__risk">
            Predicted Risk: {result.risk_level} (confidence {(result.confidence_score * 100).toFixed(1)}%)
          </p>

          <p className="prediction-panel__row">
            <span className="prediction-panel__key">Prediction ID:</span> {result.prediction_id}
          </p>
        </>
      )}
    </div>
  )
}

export default PredictionPanel
