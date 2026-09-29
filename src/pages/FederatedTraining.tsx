import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FederatedTraining: React.FC = () => {
  const navigate = useNavigate();

  const hospitalNodes = [
    { name: 'Karnataka Central Medical Institute', id: 'NODE-BLR-01', location: 'Bangalore, KA', status: 'Online', statusColor: 'badge-success', samples: '14,280', latency: '12ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Victoria Multi-Specialty Hospital', id: 'NODE-BLR-02', location: 'Bangalore, KA', status: 'Online', statusColor: 'badge-success', samples: '9,840', latency: '18ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Mysore Regional Healthcare Center', id: 'NODE-MYS-01', location: 'Mysore, KA', status: 'Online', statusColor: 'badge-success', samples: '7,150', latency: '24ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Hubli Medical Science Academy', id: 'NODE-HBL-01', location: 'Hubli-Dharwad, KA', status: 'Online', statusColor: 'badge-success', samples: '6,420', latency: '28ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Mangalore Coastal Health Network', id: 'NODE-MNG-01', location: 'Mangalore, KA', status: 'Online', statusColor: 'badge-success', samples: '8,900', latency: '31ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Belagavi District Super Specialty', id: 'NODE-BLG-01', location: 'Belagavi, KA', status: 'Syncing', statusColor: 'badge-warning', samples: '5,310', latency: '45ms', lastRound: 'Round #48 (Validating)' },
    { name: 'Shimoga Clinical Research Institute', id: 'NODE-SHM-01', location: 'Shimoga, KA', status: 'Online', statusColor: 'badge-success', samples: '4,890', latency: '36ms', lastRound: 'Round #48 (Synced)' },
    { name: 'Gulbarga Institute of Medical Sciences', id: 'NODE-GLB-01', location: 'Kalaburagi, KA', status: 'Online', statusColor: 'badge-success', samples: '6,100', latency: '40ms', lastRound: 'Round #48 (Synced)' }
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Federated Learning & Distributed Training Network
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.95rem' }}>
            Multi-institution collaborative training mesh utilizing Secure Multi-Party Aggregation (FedAvg + Differential Privacy).
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/dashboard')}
          style={{ fontSize: '0.875rem', padding: '10px 18px' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Return to Dashboard
        </button>
      </div>

      {/* Overview Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Hospitals</span>
            <span className="badge badge-success">23/23 Online</span>
          </div>
          <div className="stat-value" style={{ color: '#38BDF8' }}>23</div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Connected hospital nodes</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Global Model Accuracy</span>
            <span className="badge badge-success">+1.4% this week</span>
          </div>
          <div className="stat-value" style={{ color: '#10B981' }}>91.6%</div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Cardiovascular Ensemble</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Federated Round</span>
            <span className="badge badge-info">Epoch 5/5</span>
          </div>
          <div className="stat-value" style={{ color: '#A78BFA' }}>#48 <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/ 50</span></div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Convergence threshold: 92.0%</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Privacy Guarantee</span>
            <span className="badge badge-primary">Differential Privacy</span>
          </div>
          <div className="stat-value" style={{ color: '#F8FAFC', fontSize: '1.4rem' }}>ε = 1.2, δ = 10⁻⁵</div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Zero raw patient data shared</span>
        </div>
      </div>

      {/* Protocol Pipeline Information */}
      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Privacy-Preserving Federated Architecture
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.9rem', marginBottom: '6px' }}>1. Local Model Optimization</div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
              Each participating hospital trains models locally on their isolated EHR/FHIR store behind strict organizational firewalls.
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 600, color: '#10B981', fontSize: '0.9rem', marginBottom: '6px' }}>2. Encrypted Gradient Aggregation</div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
              Only masked weight deltas and gradients are securely transmitted using homomorphic encryption protocols.
            </p>
          </div>
          <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontWeight: 600, color: '#A78BFA', fontSize: '0.9rem', marginBottom: '6px' }}>3. Global Consensus Sync</div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
              The central coordinator synchronizes the consensus weights back to all 23 hospital nodes without exposing patient identifiers.
            </p>
          </div>
        </div>
      </div>

      {/* Participating Hospital Nodes Table */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Federated Hospital Node Mesh (Showing 8 of 23 Active Nodes)
          </h2>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            All 23 Nodes Participating in Round #48
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Node ID</th>
                <th>Hospital Entity</th>
                <th>Region</th>
                <th>Local Training Cohort</th>
                <th>Network Latency</th>
                <th>Round Status</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {hospitalNodes.map((node) => (
                <tr key={node.id}>
                  <td style={{ fontWeight: 600, color: '#38BDF8' }}>{node.id}</td>
                  <td style={{ fontWeight: 600, color: '#FFFFFF' }}>{node.name}</td>
                  <td style={{ color: '#94A3B8' }}>{node.location}</td>
                  <td style={{ color: '#E2E8F0', fontWeight: 500 }}>{node.samples} records</td>
                  <td style={{ color: '#94A3B8' }}>{node.latency}</td>
                  <td style={{ color: '#34D399', fontWeight: 500 }}>{node.lastRound}</td>
                  <td>
                    <span className={`badge ${node.statusColor}`}>{node.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
