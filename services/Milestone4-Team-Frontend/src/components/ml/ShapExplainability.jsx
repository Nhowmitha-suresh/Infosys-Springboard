import { useMemo, useState } from 'react'
import mlClient from '../../api/mlClient'

function ShapExplainability() {
  const [patientId, setPatientId] = useState('P001')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [needsPrediction, setNeedsPrediction] = useState(false)
  const [predicting, setPredicting] = useState(false)

  const maxAbs = useMemo(() => {
    if (!result?.explanation?.length) return 1
    return Math.max(...result.explanation.map((c) => Math.abs(c.shap_value)))
  }, [result])

  const fetchExplanation = async (id) => {
    setError(null)
    setNeedsPrediction(false)
    setLoading(true)
    try {
      const res = await mlClient.get(`/explain/${encodeURIComponent(id)}`)
      setResult(res.data)
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.error || 'Failed to fetch SHAP explanation.'
      if (status === 404) {
        // Either the patient has no prediction yet, or the patient doesn't
        // exist -- either way, offer to run a fresh prediction, which will
        // itself 404 with a clearer message if the patient truly isn't in
        // ml_patient_data.
        setNeedsPrediction(true)
      }
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = (e) => {
    e.preventDefault()
    if (!patientId.trim()) return
    fetchExplanation(patientId.trim())
  }

  const handleRunPrediction = async () => {
    setPredicting(true)
    setError(null)
    try {
      await mlClient.post('/predict', { patient_id: patientId.trim() })
      await fetchExplanation(patientId.trim())
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate a prediction for this patient.')
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">SHAP Explainability</h3>
      </div>

      <form className="panel__header" onSubmit={handleExplain} style={{ gap: '0.5rem' }}>
        <input
          className="model-select"
          placeholder="Patient ID (e.g. P001)"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button type="submit" className="btn-link btn-link--accent" disabled={loading}>
          {loading ? 'Explaining…' : 'Explain'}
        </button>
      </form>

      {error && (
        <p className="prediction-panel__row" style={{ color: '#c0392b' }}>
          {error}
        </p>
      )}

      {needsPrediction && (
        <p className="prediction-panel__row">
          <button type="button" className="btn-link btn-link--accent" onClick={handleRunPrediction} disabled={predicting}>
            {predicting ? 'Running prediction…' : 'Run prediction for this patient'}
          </button>
        </p>
      )}

      {!result && !loading && !error && (
        <p className="panel__subtext">Enter a patient ID and click Explain to fetch a live SHAP breakdown.</p>
      )}

      {result && (
        <>
          <p className="panel__subtext">
            Patient <strong>{result.patient_id}</strong> — prediction:{' '}
            <strong>{result.risk_level}</strong>, model version{' '}
            <strong>{result.model_version}</strong>.
          </p>

          <div className="shap-chart">
            {result.explanation.map((c) => {
              const widthPct = (Math.abs(c.shap_value) / maxAbs) * 50
              const isPositive = c.shap_value >= 0
              return (
                <div className="shap-row" key={c.feature}>
                  <span className="shap-row__label">{c.feature}</span>
                  <div className="shap-row__track">
                    <div className="shap-row__midline" />
                    <div
                      className={`shap-row__bar ${
                        isPositive ? 'shap-row__bar--pos' : 'shap-row__bar--neg'
                      }`}
                      style={
                        isPositive
                          ? { left: '50%', width: `${widthPct}%` }
                          : { right: '50%', width: `${widthPct}%` }
                      }
                    />
                  </div>
                  <span
                    className={`shap-row__value ${
                      isPositive ? 'shap-row__value--pos' : 'shap-row__value--neg'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {c.shap_value.toFixed(3)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="shap-legend">
            <span className="shap-legend__item">
              <span className="shap-legend__swatch shap-legend__swatch--pos" />
              Increases risk
            </span>
            <span className="shap-legend__item">
              <span className="shap-legend__swatch shap-legend__swatch--neg" />
              Decreases risk
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default ShapExplainability
