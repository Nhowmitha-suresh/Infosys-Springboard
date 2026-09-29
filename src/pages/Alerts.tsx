import React, { useState, useEffect } from 'react';
import { monitoringService, MonitoredPatient, MonitoringAlert } from '../services/monitoringService';

// --- Sub-component: MetricCard ---
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
}> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#FFFFFF',
  badgeText,
  badgeType = 'info'
}) => {
  const badgeClasses: Record<string, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info'
  };

  return (
    <div
      className="stat-card"
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '130px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}
    >
      <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <div
          className="stat-value"
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          {value}
        </div>
        {(subtitle || badgeText) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            {badgeText && (
              <span className={`badge ${badgeClasses[badgeType]}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                {badgeText}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: '0.825rem', color: '#94A3B8' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-component: AlertCard ---
export const AlertCard: React.FC<{
  alert: MonitoringAlert;
  onAcknowledge: (alertId: string) => void;
  onViewPatient: (patientId: string) => void;
}> = ({ alert, onAcknowledge, onViewPatient }) => {
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

// --- Sub-component: PatientDetailsModal ---
export const PatientDetailsModal: React.FC<{
  patient: MonitoredPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert?: (patientId: string) => void;
}> = ({
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

// --- Main Page Component: Alerts ---
export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(monitoringService.getAlerts());
  const [metrics, setMetrics] = useState(monitoringService.getMetrics());
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<MonitoredPatient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = monitoringService.subscribe(() => {
      setAlerts([...monitoringService.getAlerts()]);
      setMetrics({ ...monitoringService.getMetrics() });
    });
    return () => unsubscribe();
  }, []);

  const handleAcknowledge = (alertId: string) => {
    monitoringService.acknowledgeAlert(alertId);
  };

  const handleAcknowledgeAll = () => {
    monitoringService.acknowledgeAllAlerts();
  };

  const handleViewPatient = (patientId: string) => {
    const patient = monitoringService.getPatientById(patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsModalOpen(true);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const highCount = alerts.filter((a) => a.severity === 'HIGH' && !a.acknowledged).length;
  const unacknowledgedTotal = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
            Clinical Telemetry Alerts
          </h1>
          <p
            style={{
              color: '#94A3B8',
              marginTop: '8px',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            Active clinical anomaly detection events originating from continuous monitoring feeds.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {unacknowledgedTotal > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Acknowledge All ({unacknowledgedTotal})
            </button>
          )}
        </div>
      </div>

      <section aria-label="Alerts Status Summary">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          <MetricCard
            title="Active Anomalies"
            value={unacknowledgedTotal}
            subtitle="Requiring clinical review"
            accentColor="#EF4444"
            badgeText={unacknowledgedTotal > 0 ? 'Urgent' : 'All Clear'}
            badgeType={unacknowledgedTotal > 0 ? 'danger' : 'success'}
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <MetricCard
            title="High Severity"
            value={highCount}
            subtitle="Immediate intervention needed"
            accentColor="#F59E0B"
            badgeText="Tachycardia / Desat"
            badgeType="warning"
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <MetricCard
            title="Total Events Logged"
            value={metrics.alerts}
            subtitle="Continuous monitoring engine total"
            accentColor="#60A5FA"
            badgeText="Live Synced"
            badgeType="info"
            icon={
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>
      </section>

      <section aria-label="Alerts Stream Panel">
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '24px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Live Alert Queue
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '4px' }}>
                Sorted by most recent clinical telemetry anomaly detection.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`btn btn-sm ${filterSeverity === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilterSeverity('HIGH')}
                className={`btn btn-sm ${filterSeverity === 'HIGH' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                HIGH ({alerts.filter((a) => a.severity === 'HIGH').length})
              </button>
              <button
                onClick={() => setFilterSeverity('MEDIUM')}
                className={`btn btn-sm ${filterSeverity === 'MEDIUM' ? 'btn-warning' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                MEDIUM ({alerts.filter((a) => a.severity === 'MEDIUM').length})
              </button>
              <button
                onClick={() => setFilterSeverity('NORMAL')}
                className={`btn btn-sm ${filterSeverity === 'NORMAL' ? 'btn-success' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                NORMAL ({alerts.filter((a) => a.severity === 'NORMAL').length})
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onViewPatient={handleViewPatient}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                No clinical alerts found for this severity filter.
              </div>
            )}
          </div>
        </div>
      </section>

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcknowledgeAlert={(pid: string) => {
          const matching = alerts.filter((a) => a.patientId === pid);
          matching.forEach((a) => handleAcknowledge(a.id));
        }}
      />
    </div>
  );
};
