import React from 'react';
import { MonitoredPatient } from '../../services/monitoringService';

interface PatientDetailsModalProps {
  patient: MonitoredPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert?: (patientId: string) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  isOpen,
  onClose,
  onAcknowledgeAlert
}) => {
  if (!isOpen || !patient) return null;

  const isAnomaly = patient.status === 'Anomaly';

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0F172A',
          border: isAnomaly ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '580px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                {patient.name}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {patient.id}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '4px' }}>
              {patient.room} • Age: {patient.age} yrs • Continuous Telemetry Stream
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: '#94A3B8',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Vital Status Highlight Box */}
        <div
          style={{
            background: isAnomaly
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: isAnomaly ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {patient.vitalLabel}
            </span>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: isAnomaly ? '#EF4444' : '#10B981',
                lineHeight: 1.1,
                marginTop: '4px'
              }}
            >
              {patient.value}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 700,
                background: isAnomaly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isAnomaly ? '#EF4444' : '#10B981',
                border: isAnomaly ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>{isAnomaly ? '🔴' : '🟢'}</span>
              <span>{patient.status}</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Updated: {patient.lastUpdated}
            </span>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: '#0B1120', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Monitoring Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#38BDF8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
              Active Surveillance
            </div>
          </div>

          <div style={{ background: '#0B1120', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Recent Alert</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: isAnomaly ? '#FCA5A5' : '#E2E8F0', marginTop: '4px' }}>
              {patient.recentAlert || 'All vitals within safe parameters'}
            </div>
          </div>
        </div>

        {/* Recent Trend Bars */}
        <div style={{ background: '#0B1120', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
            5-Minute Stream Trend
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '60px', paddingTop: '10px' }}>
            {patient.history.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '100%',
                    background: isAnomaly && i === patient.history.length - 1 ? '#EF4444' : '#3B82F6',
                    borderRadius: '4px 4px 0 0',
                    height: `${Math.min(100, Math.max(20, (h.value / (patient.numericValue * 1.3)) * 50))}px`,
                    transition: 'height 0.3s ease'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{h.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          {isAnomaly && onAcknowledgeAlert && (
            <button
              className="btn btn-warning"
              onClick={() => {
                onAcknowledgeAlert(patient.id);
                onClose();
              }}
              style={{ fontWeight: 600 }}
            >
              Acknowledge Alert
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
