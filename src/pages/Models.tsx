import React from 'react';
import { useNavigate } from 'react-router-dom';

type ModelCard = {
  id: string;
  name: string;
  type: string;
  accuracy: string;
  rocAuc: string;
  status: string;
  statusColor: string;
  lastTrained: string;
  features: string[];
  description: string;
  route?: string;
};

export const Models: React.FC = () => {
  const navigate = useNavigate();

  const modelsList: ModelCard[] = [
    {
      id: 'MOD-CVD-01',
      name: 'Cardiovascular Risk Prediction Engine (CVD-XG1)',
      type: 'Supervised Predictive Model',
      accuracy: '81.75%',
      rocAuc: 'Pending Validation',
      status: 'Integrated',
      statusColor: 'badge-success',
      lastTrained: 'Parameters loaded from backend model configuration',
      features: ['Age', 'Gender', 'Systolic BP', 'Diastolic BP', 'Cholesterol', 'Heart Rate', 'BMI', 'Diabetes'],
      description: 'Calculates a cardiovascular risk score from the configured clinical feature vector and returns feature-level contribution information.',
      route: '/cvd-risk'
    },
    {
      id: 'MOD-DIA-02',
      name: 'Diabetes Complication Risk Model (DCR-NN2)',
      type: 'Deep Neural Network / Longitudinal Sequence',
      accuracy: 'Pending Validation',
      rocAuc: 'N/A',
      status: 'Model Development in Progress',
      statusColor: 'badge-warning',
      lastTrained: 'Trained model integration pending',
      features: ['HbA1c', 'Fasting Blood Sugar', 'eGFR', 'Microalbuminuria', 'Systolic BP', 'Neuropathy Score'],
      description: 'Assesses progressive microvascular and macrovascular complication timelines for type-2 diabetic patients.',
      route: '/diabetes-risk'
    },
    {
      id: 'MOD-FL-01',
      name: 'TensorFlow Federated Training Setup',
      type: 'Federated Learning / FedAvg Prototype',
      accuracy: 'Pending Validation',
      rocAuc: 'N/A',
      status: 'Integration / Prototype',
      statusColor: 'badge-info',
      lastTrained: 'Federated runtime integration pending',
      features: ['Client Nodes', 'Local Training', 'Model Updates', 'Aggregation', 'Global Model'],
      description: 'Demonstrates the Milestone 2 privacy-aware collaborative training workflow without centralizing raw patient data.',
      route: '/federated-training'
    }
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-primary">Milestone 2 • Federated Learning & Risk Models</span>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: '10px 0 0' }}>
            AI Predictive Models Directory
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.95rem' }}>
            Clinical prediction, diabetes complication risk, and federated learning components.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
          style={{ fontSize: '0.875rem', padding: '10px 18px' }}
        >
          Return to Dashboard
        </button>
      </div>

      <div className="card-panel" style={{ borderLeft: '3px solid #38BDF8' }}>
        <strong>Milestone 2 flow:</strong>
        <span style={{ color: '#CBD5E1', marginLeft: '8px' }}>
          Federated Training → CVD Risk → DCR-NN2 Diabetes Risk → Explainability / Validation
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {modelsList.map((model) => (
          <div key={model.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8', letterSpacing: '0.05em' }}>{model.id}</span>
                <span className={`badge ${model.statusColor}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>{model.status}</span>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                {model.name}
              </h2>

              <div style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '12px' }}>
                Architecture: <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{model.type}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '16px' }}>
                {model.description}
              </p>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Input / Training Components
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {model.features.map((feature) => (
                    <span key={feature} style={{ fontSize: '0.75rem', background: '#1E293B', color: '#E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: '#94A3B8', textTransform: 'uppercase' }}>Benchmark Accuracy</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: model.accuracy === 'Pending Validation' ? '#F59E0B' : '#10B981' }}>
                    {model.accuracy}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.725rem', color: '#94A3B8', textTransform: 'uppercase' }}>ROC-AUC</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {model.rocAuc}
                  </div>
                </div>
              </div>

              {model.route && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(model.route!)}
                  style={{ width: '100%', marginTop: '14px' }}
                >
                  Open Module
                </button>
              )}

              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#64748B' }}>
                {model.lastTrained}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};