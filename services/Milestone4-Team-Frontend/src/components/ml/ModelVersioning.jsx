import { useState } from 'react'
import mlClient from '../../api/mlClient'

const STATUS_LABEL = {
  Active: 'Active',
  Archived: 'Archived',
  Inactive: 'Inactive',
}

const STATUS_CLASS = {
  Active: 'active',
  Archived: 'archived',
  Inactive: 'training',
}

const EMPTY_FORM = {
  model_name: '',
  version_number: '',
  algorithm: '',
  dataset_name: '',
  accuracy: '',
  precision_score: '',
  recall_score: '',
  f1_score: '',
  model_path: '',
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
    .replace(/ /g, '-')
}

function formatPct(value) {
  if (value === null || value === undefined) return '—'
  return `${(Number(value) * 100).toFixed(1)}%`
}

// `models` and `onRefresh` are lifted to the parent (Models.jsx) so
// ShapExplainability can react to the same activate/refresh events without
// a second, out-of-sync fetch.
function ModelVersioning({ models, loading, error, onRefresh, selectedVersionId, onSelectVersion }) {
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleActivate = async (versionId) => {
    setActionError(null)
    setBusyId(versionId)
    try {
      await mlClient.put(`/models/${versionId}/activate`)
      onSelectVersion(versionId)
      await onRefresh()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to activate model version.')
    } finally {
      setBusyId(null)
    }
  }

  const handleArchive = async (versionId) => {
    setActionError(null)
    setBusyId(versionId)
    try {
      await mlClient.put(`/models/${versionId}/archive`)
      await onRefresh()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to archive model version.')
    } finally {
      setBusyId(null)
    }
  }

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      const payload = {
        model_name: form.model_name.trim(),
        version_number: form.version_number.trim(),
        algorithm: form.algorithm.trim(),
        dataset_name: form.dataset_name.trim(),
        accuracy: Number(form.accuracy),
        precision_score: Number(form.precision_score),
        recall_score: Number(form.recall_score),
        f1_score: Number(form.f1_score),
        model_path: form.model_path.trim(),
      }
      await mlClient.post('/models', payload)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await onRefresh()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to register model version.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">Model Versioning</h3>
        <button type="button" className="btn-link btn-link--accent" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Register version'}
        </button>
      </div>
      <p className="panel__subtext">
        Live model registry from the Medisphere-ML backend. Activating a version promotes it
        to production and archives the current one.
      </p>

      {error && <p className="prediction-panel__row" style={{ color: '#c0392b' }}>{error}</p>}
      {actionError && <p className="prediction-panel__row" style={{ color: '#c0392b' }}>{actionError}</p>}

      {showForm && (
        <form className="panel" style={{ marginBottom: '1rem' }} onSubmit={handleRegister}>
          {formError && <p className="prediction-panel__row" style={{ color: '#c0392b' }}>{formError}</p>}
          <div className="row g-2">
            <div className="col-md-3">
              <input className="model-select" placeholder="Model name" value={form.model_name} onChange={handleFormChange('model_name')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" placeholder="Version (e.g. v1.1)" value={form.version_number} onChange={handleFormChange('version_number')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" placeholder="Algorithm" value={form.algorithm} onChange={handleFormChange('algorithm')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" placeholder="Dataset name" value={form.dataset_name} onChange={handleFormChange('dataset_name')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" type="number" step="0.0001" min="0" max="1" placeholder="Accuracy (0-1)" value={form.accuracy} onChange={handleFormChange('accuracy')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" type="number" step="0.0001" min="0" max="1" placeholder="Precision (0-1)" value={form.precision_score} onChange={handleFormChange('precision_score')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" type="number" step="0.0001" min="0" max="1" placeholder="Recall (0-1)" value={form.recall_score} onChange={handleFormChange('recall_score')} required />
            </div>
            <div className="col-md-3">
              <input className="model-select" type="number" step="0.0001" min="0" max="1" placeholder="F1 (0-1)" value={form.f1_score} onChange={handleFormChange('f1_score')} required />
            </div>
            <div className="col-md-6">
              <input className="model-select" placeholder="Model path (e.g. models/patient_risk_v1_1.pkl)" value={form.model_path} onChange={handleFormChange('model_path')} required />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn-link btn-link--accent" disabled={submitting}>
                {submitting ? 'Registering…' : 'Register'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="panel__subtext">Loading model versions…</p>
      ) : models.length === 0 ? (
        <p className="panel__subtext">No model versions registered yet.</p>
      ) : (
        <div className="version-table">
          <div className="version-table__row version-table__row--head">
            <span>Version</span>
            <span>Status</span>
            <span>Accuracy</span>
            <span>Trained</span>
            <span>Algorithm</span>
            <span>Actions</span>
          </div>
          {models.map((v) => (
            <div
              className={`version-table__row${
                v.version_id === selectedVersionId ? ' version-table__row--selected' : ''
              }`}
              key={v.version_id}
            >
              <span className="version-table__tag">
                {v.model_name} {v.version_number}
              </span>
              <span>
                <span className={`status-badge status-badge--${STATUS_CLASS[v.status] || 'archived'}`}>
                  {STATUS_LABEL[v.status] || v.status}
                </span>
              </span>
              <span>{formatPct(v.accuracy)}</span>
              <span>{formatDate(v.training_date)}</span>
              <span className="version-table__notes">{v.algorithm || '—'}</span>
              <span className="version-table__actions">
                <button type="button" className="btn-link" onClick={() => onSelectVersion(v.version_id)}>
                  View
                </button>
                {v.status !== 'Active' && (
                  <button
                    type="button"
                    className="btn-link btn-link--accent"
                    disabled={busyId === v.version_id}
                    onClick={() => handleActivate(v.version_id)}
                  >
                    {busyId === v.version_id ? 'Activating…' : 'Activate'}
                  </button>
                )}
                {v.status !== 'Archived' && v.status !== 'Active' && (
                  <button
                    type="button"
                    className="btn-link"
                    disabled={busyId === v.version_id}
                    onClick={() => handleArchive(v.version_id)}
                  >
                    Archive
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ModelVersioning
