import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import { DataTable, Column } from '../components/DataTable';
import { DigitalTwin } from '../types';

export const DigitalTwinPage: React.FC = () => {
  const [digitalTwins] = useState(MediStorage.getDigitalTwins());
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwin | null>(digitalTwins[0] || null);

  const columns: Column<DigitalTwin>[] = [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'patientName', label: 'Patient Name' },
    {
      key: 'completeness',
      label: 'Twin Completeness %',
      render: (v) => <span style={{ fontWeight: 700, color: v >= 90 ? '#10B981' : '#F59E0B' }}>{v}%</span>
    },
    {
      key: 'organRisks',
      label: 'Heart Status',
      render: (v) => <span className={`badge ${v.heart === 'High' ? 'badge-danger' : 'badge-success'}`}>{v.heart}</span>
    },
    {
      key: 'organRisks_kidney',
      label: 'Kidney Status',
      render: (_, r) => <span className={`badge ${r.organRisks.kidneys === 'Moderate' ? 'badge-warning' : 'badge-success'}`}>{r.organRisks.kidneys}</span>
    },
    {
      key: 'actions',
      label: 'Inspect Model',
      render: (_, r) => (
        <button className="btn btn-primary btn-sm" onClick={() => setSelectedTwin(r)}>
          🧬 View Organ Twin
        </button>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Digital Patient Twin Store</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Multi-organ Physiological Simulations & AI Readmission Risk Modeling
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => MediToast.success('Simulated physiological stress test on active patient twins complete!')}>
          ⚙️ Run AI Stress Simulation
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card-panel">
          <DataTable
            data={digitalTwins}
            columns={columns}
            pageSize={8}
            exportFilename="medisphere_digital_twins.csv"
          />
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Organ Physiological Risk Inspection</h3>
          {selectedTwin ? (
            <div>
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#60A5FA', margin: 0 }}>{selectedTwin.patientName} ({selectedTwin.patientId})</h4>
                  <span className="badge badge-success">{selectedTwin.completeness}% Telemetry Sync</span>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '4px' }}>Last Telemetry Sync: {new Date(selectedTwin.lastSync).toLocaleString()}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1E293B', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>🧠 Brain / Neurological</div>
                  <div style={{ color: '#10B981', fontWeight: 700, marginTop: '2px' }}>{selectedTwin.organRisks.brain}</div>
                </div>
                <div style={{ background: '#1E293B', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>❤️ Cardiovascular / Heart</div>
                  <div style={{ color: selectedTwin.organRisks.heart === 'High' ? '#EF4444' : '#10B981', fontWeight: 700, marginTop: '2px' }}>{selectedTwin.organRisks.heart}</div>
                </div>
                <div style={{ background: '#1E293B', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>🫁 Lungs / Respiratory</div>
                  <div style={{ color: '#10B981', fontWeight: 700, marginTop: '2px' }}>{selectedTwin.organRisks.lungs}</div>
                </div>
                <div style={{ background: '#1E293B', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>🩸 Kidneys / Renal</div>
                  <div style={{ color: selectedTwin.organRisks.kidneys === 'Moderate' ? '#F59E0B' : '#10B981', fontWeight: 700, marginTop: '2px' }}>{selectedTwin.organRisks.kidneys}</div>
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ color: '#FFF', margin: '0 0 8px 0' }}>AI Predictive Clinical Recommendations</h5>
                <ul style={{ color: '#D1D5DB', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
                  {selectedTwin.aiRecommendations.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>Select a patient twin from the list.</div>
          )}
        </div>
      </div>
    </div>
  );
};
