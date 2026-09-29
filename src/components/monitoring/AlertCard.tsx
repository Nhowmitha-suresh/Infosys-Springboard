import React from 'react';
import { MonitoringAlert } from '../../services/monitoringService';

interface AlertCardProps {
  alert: MonitoringAlert;
  onAcknowledge: (alertId: string) => void;
  onViewPatient: (patientId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onViewPatient }) => {
  const getSeverityBadge = () => {
    switch (alert.severity) {
      case 'HIGH':
        return {
          label: 'HIGH',
          className: 'badge-danger',
          border: 'rgba(239, 68, 68, 0.4)',
          bg: 'rgba(239, 68, 68, 0.1)'
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM',
          className: 'badge-warning',
          border: 'rgba(245, 158, 11, 0.4)',
          bg: 'rgba(245, 158, 11, 0.1)'
        };
      case 'NORMAL':
      default:
        return {
          label: 'NORMAL',
          className: 'badge-success',
          border: 'rgba(16, 185, 129, 0.4)',
          bg: 'rgba(16, 185, 129, 0.1)'
        };
    }
  };

  const style = getSeverityBadge();

  return (
    <div
      className="card-panel"
      style={{
        background: alert.acknowledged ? 'rgba(17, 24, 39, 0.5)' : style.bg,
        border: `1px solid ${alert.acknowledged ? 'rgba(255, 255, 255, 0.08)' : style.border}`,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: alert.acknowledged ? 0.75 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`badge ${style.className}`} style={{ fontSize: '0.78rem', padding: '4px 10px', fontWeight: 700 }}>
            {style.label}
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
            {alert.patientName}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            ({alert.patientId})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            {alert.detectedTime}
          </span>
          {alert.acknowledged && (
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              ✓ Acknowledged
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
              Vital Parameter
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#CBD5E1' }}>
              {alert.vital}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
              Telemetry Value
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: alert.severity === 'HIGH' ? '#EF4444' : alert.severity === 'MEDIUM' ? '#F59E0B' : '#10B981' }}>
              {alert.value}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!alert.acknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="btn btn-warning btn-sm"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              Acknowledge
            </button>
          )}

          <button
            onClick={() => onViewPatient(alert.patientId)}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            View Patient
          </button>
        </div>
      </div>

      {alert.notes && (
        <div style={{ fontSize: '0.825rem', color: '#94A3B8', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '8px' }}>
          {alert.notes}
        </div>
      )}
    </div>
  );
};
