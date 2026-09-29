import React from 'react';
import { MonitoredPatient } from '../../services/monitoringService';

interface MonitoringRowProps {
  patient: MonitoredPatient;
  onViewPatient: (patient: MonitoredPatient) => void;
}

export const MonitoringRow: React.FC<MonitoringRowProps> = ({ patient, onViewPatient }) => {
  const isAnomaly = patient.status === 'Anomaly';

  return (
    <tr
      style={{
        backgroundColor: isAnomaly ? 'rgba(239, 68, 68, 0.07)' : 'transparent',
        transition: 'background-color 0.2s ease',
        borderBottom: '1px solid #1E293B'
      }}
      className="monitoring-table-row"
    >
      {/* Patient */}
      <td style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: isAnomaly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: isAnomaly ? '#EF4444' : '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {patient.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {patient.room}
            </div>
          </div>
        </div>
      </td>

      {/* Vital */}
      <td style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#0F172A',
              color: '#38BDF8',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {patient.vitalType}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
            {patient.vitalLabel}
          </span>
        </div>
      </td>

      {/* Value */}
      <td style={{ padding: '14px 18px' }}>
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: isAnomaly ? '#EF4444' : '#FFFFFF',
            fontFeatureSettings: '"tnum"'
          }}
        >
          {patient.value}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 18px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: isAnomaly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isAnomaly ? '#EF4444' : '#10B981',
            border: isAnomaly ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
          }}
        >
          <span>{isAnomaly ? '🔴' : '🟢'}</span>
          <span>{patient.status}</span>
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
        <button
          onClick={() => onViewPatient(patient)}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.8rem',
            padding: '5px 12px',
            borderRadius: '6px',
            borderColor: isAnomaly ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.12)'
          }}
        >
          View Patient
        </button>
      </td>
    </tr>
  );
};
