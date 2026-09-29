import React from 'react';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';

export const Dashboard: React.FC = () => {
  const patientData = {
    name: 'John Doe',
    id: 'PAT-KA-2026-042',
    features: [
      { label: 'Age', value: '58 yrs', icon: '👤' },
      { label: 'BMI', value: '28.4 kg/m²', icon: '⚖️' },
      { label: 'Blood Pressure', value: '142/90 mmHg', icon: '🩺' },
      { label: 'Cholesterol', value: '235 mg/dL', icon: '🧪' },
      { label: 'Glucose', value: '118 mg/dL', icon: '🩸' },
      { label: 'CRP', value: '3.2 mg/L', icon: '🔬' }
    ]
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Main Heading */}
      <div>
        <h1
          style={{
            color: '#FFFFFF',
            fontSize: '2rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1.2
          }}
        >
          AI Risk Prediction Engine
        </h1>
        <p
          style={{
            color: '#94A3B8',
            marginTop: '8px',
            fontSize: '1rem',
            lineHeight: 1.5
          }}
        >
          Multi-modal clinical intelligence and continuous patient risk assessment system.
        </p>
      </div>

      <ClinicalModuleLinks />

      {/* 3 KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Card 1 — Patients */}
          <div
            className="stat-card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div className="stat-header">
              <span
                className="stat-label"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Patients
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60A5FA'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div
              className="stat-value"
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: '12px'
              }}
            >
              342
            </div>
          </div>

          {/* Card 2 — Model Accuracy */}
          <div
            className="stat-card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div className="stat-header">
              <span
                className="stat-label"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Model Accuracy
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div
              className="stat-value"
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#10B981',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: '12px'
              }}
            >
              91.6%
            </div>
          </div>

          {/* Card 3 — Active Hospitals */}
          <div
            className="stat-card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div className="stat-header">
              <span
                className="stat-label"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Active Hospitals
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A78BFA'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div
              className="stat-value"
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: '#60A5FA',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: '12px'
              }}
            >
              23
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Cards Grid */}
      <section aria-label="Clinical Risk Predictions" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* CVD RISK PREDICTION CARD */}
        <div
          className="card-panel"
          style={{
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Card Header & Patient */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '20px',
              marginBottom: '22px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444'
                  }}
                />
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Cardiovascular Risk Prediction
                </h2>
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  marginTop: '4px'
                }}
              >
                Patient: <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{patientData.name}</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                padding: '6px 14px',
                borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>
                Model: CVD-XG1 Ensemble
              </span>
            </div>
          </div>

          {/* Input Features Section */}
          <div style={{ marginBottom: '26px' }}>
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '14px'
              }}
            >
              Input Features
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}
            >
              {patientData.features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
                    {feature.label}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#FFFFFF', fontWeight: 600 }}>
                    {feature.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Result Highlight Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '16px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#FBBF24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Predicted Risk
              </span>
              <div
                style={{
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                  lineHeight: 1.1,
                  marginTop: '4px',
                  fontFeatureSettings: '"tnum"'
                }}
              >
                23.4%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#CBD5E1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Risk Level
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F59E0B',
                  color: '#000000',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#000000'
                  }}
                />
                Moderate Risk
              </div>
            </div>
          </div>
        </div>

        {/* DIABETES COMPLICATION RISK CARD */}
        <div
          className="card-panel"
          style={{
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Card Header & Patient */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '20px',
              marginBottom: '22px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6'
                  }}
                />
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Diabetes Complication Risk
                </h2>
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  marginTop: '4px'
                }}
              >
                Patient: <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{patientData.name}</span>
              </div>
            </div>

            <span
              className="badge badge-warning"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                fontWeight: 600,
                borderRadius: '8px'
              }}
            >
              In Pipeline
            </span>
          </div>

          {/* Risk & Status Information Boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Risk Box */}
            <div
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px 22px'
              }}
            >
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}
              >
                Risk
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ color: '#F59E0B' }}>⏳</span>
                Pending Model Integration
              </div>
            </div>

            {/* Status Box */}
            <div
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px 22px'
              }}
            >
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}
              >
                Status
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ color: '#60A5FA' }}>⚙️</span>
                Model Development in Progress
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
