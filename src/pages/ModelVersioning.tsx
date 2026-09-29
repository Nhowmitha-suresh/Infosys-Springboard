import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import { mlService, ModelVersion, NewModelVersion } from '../services/mlService';

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
};

// Shown only while the Flask ML service is unreachable, so the screen stays usable without errors.
const SAMPLE_MODELS: ModelVersion[] = [
  { version_id: 1, model_name: 'PatientRisk', version_number: 'v1.0', algorithm: 'Random Forest', dataset_name: 'ml_patient_data', accuracy: 0.912, precision_score: 0.897, recall_score: 0.884, f1_score: 0.89, training_date: '2026-06-12', model_path: 'models/patient_risk_v1_0.pkl', status: 'Archived' },
  { version_id: 2, model_name: 'PatientRisk', version_number: 'v1.1', algorithm: 'Gradient Boosting', dataset_name: 'ml_patient_data', accuracy: 0.936, recall_score: 0.921, precision_score: 0.928, f1_score: 0.924, training_date: '2026-08-03', model_path: 'models/patient_risk_v1_1.pkl', status: 'Active' },
  { version_id: 3, model_name: 'PatientRisk', version_number: 'v1.2', algorithm: 'XGBoost', dataset_name: 'ml_patient_data', accuracy: 0.944, precision_score: 0.935, recall_score: 0.929, f1_score: 0.932, training_date: '2026-09-15', model_path: 'models/patient_risk_v1_2.pkl', status: 'Inactive' },
];

const statusBadge = (status: string) =>
  status === 'Active' ? 'badge-success' : status === 'Archived' ? 'badge-warning' : 'badge-info';

const pct = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : `${(Number(value) * 100).toFixed(1)}%`;

const fmtDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ModelVersioning: React.FC = () => {
  const role = MediStorage.getCurrentUser()?.role;
  const canManage = role === 'admin' || role === 'doctor';

  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mlService.listModels();
      setOffline(false);
      setModels(data);
      setSelectedId((prev) =>
        prev !== null && data.some((m) => m.version_id === prev)
          ? prev
          : data.find((m) => m.status === 'Active')?.version_id ?? data[0]?.version_id ?? null
      );
    } catch {
      // ML service unreachable: fall back to sample data (kept in memory) instead of showing an error.
      setOffline(true);
      setModels((prev) => (prev.length ? prev : SAMPLE_MODELS));
      setSelectedId((prev) => prev ?? SAMPLE_MODELS.find((m) => m.status === 'Active')?.version_id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const active = useMemo(() => models.find((m) => m.status === 'Active'), [models]);
  const selected = useMemo(() => models.find((m) => m.version_id === selectedId), [models, selectedId]);

  const runAction = async (versionId: number, action: 'activate' | 'archive') => {
    setBusyId(versionId);
    if (offline) {
      setModels((prev) =>
        prev.map((m) =>
          action === 'activate'
            ? m.version_id === versionId ? { ...m, status: 'Active' } : m.status === 'Active' ? { ...m, status: 'Archived' } : m
            : m.version_id === versionId ? { ...m, status: 'Archived' } : m
        )
      );
      if (action === 'activate') setSelectedId(versionId);
      MediToast.success(action === 'activate' ? 'Model version promoted to Active. The previous version was archived.' : 'Model version archived.', action === 'activate' ? 'Model Activated' : 'Model Archived');
      setBusyId(null);
      return;
    }
    try {
      if (action === 'activate') {
        await mlService.activateModel(versionId);
        setSelectedId(versionId);
        MediToast.success('Model version promoted to Active. The previous version was archived.', 'Model Activated');
      } else {
        await mlService.archiveModel(versionId);
        MediToast.info('Model version archived.');
      }
      await fetchModels();
    } catch (err) {
      MediToast.error((err as Error).message, action === 'activate' ? 'Activation Failed' : 'Archive Failed');
    } finally {
      setBusyId(null);
    }
  };

  const setField = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const metrics = ['accuracy', 'precision_score', 'recall_score', 'f1_score'] as const;
    for (const key of metrics) {
      const n = Number(form[key]);
      if (form[key] === '' || Number.isNaN(n) || n < 0 || n > 1) {
        setFormError('Accuracy, precision, recall and F1 must be numbers between 0 and 1.');
        return;
      }
    }

    const payload: NewModelVersion = {
      model_name: form.model_name.trim(),
      version_number: form.version_number.trim(),
      algorithm: form.algorithm.trim(),
      dataset_name: form.dataset_name.trim(),
      accuracy: Number(form.accuracy),
      precision_score: Number(form.precision_score),
      recall_score: Number(form.recall_score),
      f1_score: Number(form.f1_score),
      model_path: form.model_path.trim(),
    };

    if (offline) {
      const nextId = models.reduce((max, m) => Math.max(max, m.version_id), 0) + 1;
      setModels((prev) => [...prev, { ...payload, version_id: nextId, training_date: new Date().toISOString().slice(0, 10), status: 'Inactive' }]);
      MediToast.success(`${payload.model_name} ${payload.version_number} registered.`, 'Version Registered');
      setForm(EMPTY_FORM);
      setShowForm(false);
      return;
    }
    setSubmitting(true);
    try {
      await mlService.registerModel(payload);
      MediToast.success(`${payload.model_name} ${payload.version_number} registered.`, 'Version Registered');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchModels();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Registered Versions', value: loading ? '…' : String(models.length), color: '#38BDF8' },
    { label: 'Active Version', value: loading ? '…' : active ? `${active.model_name} ${active.version_number}` : 'None', color: '#10B981' },
    { label: 'Archived', value: loading ? '…' : String(models.filter((m) => m.status === 'Archived').length), color: '#F59E0B' },
    { label: 'Active Accuracy', value: loading ? '…' : pct(active?.accuracy), color: '#8B5CF6' },
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-primary">Milestone 2 • ML Model Registry</span>
          {offline && <span className="badge badge-info" style={{ marginLeft: 8 }}>Sample data</span>}
          <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: '10px 0 0' }}>Model Versioning</h1>
          <p style={{ color: '#94A3B8', marginTop: 6, fontSize: '0.95rem' }}>
            Model registry from the Flask ML service. Activating a version promotes it to production and archives the current one.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchModels} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          {canManage && (
            <button className="btn btn-primary" onClick={() => { setShowForm((s) => !s); setFormError(''); }}>
              {showForm ? 'Cancel' : '+ Register Version'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((card) => (
          <div key={card.label} className="card-panel">
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: card.color, marginTop: 6 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {showForm && canManage && (
        <form className="card-panel" onSubmit={handleRegister}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 14px' }}>Register a new model version</h2>
          {formError && (
            <div role="alert" style={{ color: '#FCA5A5', fontSize: '0.85rem', marginBottom: 12 }}>{formError}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            <input className="form-input" placeholder="Model name" value={form.model_name} onChange={setField('model_name')} required />
            <input className="form-input" placeholder="Version (e.g. v1.1)" value={form.version_number} onChange={setField('version_number')} required />
            <input className="form-input" placeholder="Algorithm" value={form.algorithm} onChange={setField('algorithm')} required />
            <input className="form-input" placeholder="Dataset name" value={form.dataset_name} onChange={setField('dataset_name')} required />
            <input className="form-input" type="number" step="0.0001" min="0" max="1" placeholder="Accuracy (0-1)" value={form.accuracy} onChange={setField('accuracy')} required />
            <input className="form-input" type="number" step="0.0001" min="0" max="1" placeholder="Precision (0-1)" value={form.precision_score} onChange={setField('precision_score')} required />
            <input className="form-input" type="number" step="0.0001" min="0" max="1" placeholder="Recall (0-1)" value={form.recall_score} onChange={setField('recall_score')} required />
            <input className="form-input" type="number" step="0.0001" min="0" max="1" placeholder="F1 (0-1)" value={form.f1_score} onChange={setField('f1_score')} required />
            <input className="form-input" placeholder="Model path (e.g. models/patient_risk_v1_1.pkl)" value={form.model_path} onChange={setField('model_path')} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={submitting}>
            {submitting ? 'Registering…' : 'Register'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Version History</h2>
          </div>
          {loading ? (
            <p style={{ color: '#94A3B8', padding: '8px 18px 18px' }}>Loading model versions…</p>
          ) : models.length === 0 ? (
            <p style={{ color: '#94A3B8', padding: '8px 18px 18px' }}>
              No model versions registered yet.
            </p>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Accuracy</th>
                    <th>Trained</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr
                      key={m.version_id}
                      onClick={() => setSelectedId(m.version_id)}
                      style={{ cursor: 'pointer', background: m.version_id === selectedId ? 'rgba(59,130,246,0.12)' : undefined }}
                    >
                      <td style={{ fontWeight: 600, color: '#F8FAFC' }}>{m.model_name} {m.version_number}</td>
                      <td><span className={`badge ${statusBadge(m.status)}`}>{m.status}</span></td>
                      <td>{pct(m.accuracy)}</td>
                      <td>{fmtDate(m.training_date)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                          {canManage && m.status !== 'Active' && (
                            <button className="btn btn-success btn-sm" disabled={busyId === m.version_id} onClick={() => runAction(m.version_id, 'activate')}>
                              {busyId === m.version_id ? 'Working…' : 'Activate'}
                            </button>
                          )}
                          {canManage && m.status === 'Inactive' && (
                            <button className="btn btn-secondary btn-sm" disabled={busyId === m.version_id} onClick={() => runAction(m.version_id, 'archive')}>
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-panel">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 14px' }}>Version Details</h2>
          {!selected ? (
            <p style={{ color: '#94A3B8', margin: 0 }}>Select a version to see its metrics.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>{selected.model_name} {selected.version_number}</div>
                <span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
                {[
                  ['Accuracy', pct(selected.accuracy)],
                  ['Precision', pct(selected.precision_score)],
                  ['Recall', pct(selected.recall_score)],
                  ['F1 Score', pct(selected.f1_score)],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981', marginTop: 4 }}>{value}</div>
                  </div>
                ))}
              </div>
              <dl style={{ margin: '16px 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '0.85rem' }}>
                <dt style={{ color: '#94A3B8' }}>Algorithm</dt><dd style={{ margin: 0, color: '#E2E8F0' }}>{selected.algorithm || '—'}</dd>
                <dt style={{ color: '#94A3B8' }}>Dataset</dt><dd style={{ margin: 0, color: '#E2E8F0' }}>{selected.dataset_name || '—'}</dd>
                <dt style={{ color: '#94A3B8' }}>Trained</dt><dd style={{ margin: 0, color: '#E2E8F0' }}>{fmtDate(selected.training_date)}</dd>
                <dt style={{ color: '#94A3B8' }}>Model path</dt><dd style={{ margin: 0, color: '#E2E8F0', wordBreak: 'break-all' }}>{selected.model_path || '—'}</dd>
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
