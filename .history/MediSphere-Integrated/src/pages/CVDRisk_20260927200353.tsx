import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';

type FormState = {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  systolicBp: string;
  diastolicBp: string;
  cholesterol: string;
  heartRate: string;
  bmi: string;
  diabetes: boolean;
};

const initialForm: FormState = {
  patientId: '',
  patientName: 'John Doe',
  age: '',
  gender: 'Female',
  systolicBp: '',
  diastolicBp: '',
  cholesterol: '',
  heartRate: '',
  bmi: '',
  diabetes: false
};

export const CvdRisk: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cvd/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          systolicBp: Number(form.systolicBp),
          diastolicBp: Number(form.diastolicBp),
          cholesterol: Number(form.cholesterol),
          heartRate: Number(form.heartRate),
          bmi: Number(form.bmi),
          saveRecord: true
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'CVD prediction failed');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the CVD prediction API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span className="badge badge-success">MOD-CVD-01 • Milestone 2</span>
        <h1 style={{ marginTop: '10px' }}>CVD Risk Prediction</h1>
        <p style={{ marginTop: '6px' }}>
          Cardiovascular risk assessment using the configured backend prediction model.
        </p>
      </div>

      <div className="card-panel">
        <h2>Clinical Input Features</h2>

        <form onSubmit={submit} style={{ marginTop: '18px' }}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Patient ID</label>
              <input className="form-input" value={form.patientId} onChange={(e) => update('patientId', e.target.value)} placeholder="Optional" />
            </div>

            <div className="form-field">
              <label className="form-label">Patient Name</label>
              <input className="form-input" value={form.patientName} onChange={(e) => update('patientName', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="1" value={form.age} onChange={(e) => update('age', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Systolic BP</label>
              <input className="form-input" type="number" min="0" value={form.systolicBp} onChange={(e) => update('systolicBp', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Diastolic BP</label>
              <input className="form-input" type="number" min="0" value={form.diastolicBp} onChange={(e) => update('diastolicBp', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Cholesterol</label>
              <input className="form-input" type="number" min="0" value={form.cholesterol} onChange={(e) => update('cholesterol', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">Heart Rate</label>
              <input className="form-input" type="number" min="0" value={form.heartRate} onChange={(e) => update('heartRate', e.target.value)} required />
            </div>

            <div className="form-field">
              <label className="form-label">BMI</label>
              <input className="form-input" type="number" step="0.1" min="0" value={form.bmi} onChange={(e) => update('bmi', e.target.value)} required />
            </div>

            <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
              <input id="diabetes" type="checkbox" checked={form.diabetes} onChange={(e) => update('diabetes', e.target.checked)} />
              <label htmlFor="diabetes" className="form-label" style={{ margin: 0 }}>Known diabetes</label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Calculating...' : 'Predict CVD Risk'}
            </button>
          </div>
        </form>

        {error && <div className="auth-error-banner" style={{ display: 'block', marginTop: '16px' }}>{error}</div>}
      </div>

      <div className="card-panel">
        <h2>Prediction Result</h2>

        {!result && (
          <div style={{ marginTop: '14px', color: '#94A3B8' }}>
            Enter the clinical features and run the prediction.
          </div>
        )}

        {result && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '16px' }}>
              <div className="stat-card">
                <div className="stat-label">Risk Score</div>
                <div className="stat-value">{result.riskScore}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Risk Level</div>
                <div className="stat-value" style={{ fontSize: '1.35rem' }}>{result.riskLevel}</div>
              </div>
            </div>

            <h3 style={{ marginTop: '22px' }}>Feature Contributions</h3>
            <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
              {Object.entries(result.shapExplanation || {}).map(([feature, value]) => (
                <div key={feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#0F172A', borderRadius: '8px' }}>
                  <span>{feature}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>

            {result.recommendations?.length > 0 && (
              <>
                <h3 style={{ marginTop: '22px' }}>Model Recommendations</h3>
                <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#CBD5E1' }}>
                  {result.recommendations.map((item: string, index: number) => <li key={index}>{item}</li>)}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};