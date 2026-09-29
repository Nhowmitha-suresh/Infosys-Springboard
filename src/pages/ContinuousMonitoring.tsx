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

// --- Sub-component: MonitoringRow ---
export const MonitoringRow: React.FC<{
  patient: MonitoredPatient;
  onViewPatient: (patient: MonitoredPatient) => void;
}> = ({ patient, onViewPatient }) => {
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

// --- Sub-component: MonitoringTable ---
export const MonitoringTable: React.FC<{
  patients: MonitoredPatient[];
  onViewPatient: (patient: MonitoredPatient) => void;
  filterStatus?: 'ALL' | 'ANOMALY' | 'NORMAL';
}> = ({
  patients,
  onViewPatient,
  filterStatus = 'ALL'
}) => {
  const filteredPatients = patients.filter((p) => {
    if (filterStatus === 'ANOMALY') return p.status === 'Anomaly';
    if (filterStatus === 'NORMAL') return p.status === 'Normal';
    return true;
  });

  return (
    <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vital
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Value
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <MonitoringRow
                key={patient.id}
                patient={patient}
                onViewPatient={onViewPatient}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                No active monitored patients matching this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

// --- Main Page Component: ContinuousMonitoring ---
export const ContinuousMonitoring: React.FC = () => {
  const [patients, setPatients] = useState<MonitoredPatient[]>(monitoringService.getPatients());
  const [metrics, setMetrics] = useState(monitoringService.getMetrics());
  const [selectedPatient, setSelectedPatient] = useState<MonitoredPatient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<'ALL' | 'ANOMALY' | 'NORMAL'>('ALL');

  useEffect(() => {
    const unsubscribe = monitoringService.subscribe(() => {
      setPatients([...monitoringService.getPatients()]);
      setMetrics({ ...monitoringService.getMetrics() });
      if (selectedPatient) {
        const updated = monitoringService.getPatientById(selectedPatient.id);
        if (updated) setSelectedPatient(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedPatient]);

  const handleViewPatient = (patient: MonitoredPatient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleAcknowledgeAlert = (patientId: string) => {
    const alerts = monitoringService.getAlerts().filter((a) => a.patientId === patientId);
    alerts.forEach((a) => monitoringService.acknowledgeAlert(a.id));
  };

  const summaryMetrics = [
    {
      id: 'metric-twins',
      title: 'Active Twins',
      value: metrics.activeTwins,
      subtitle: 'Synchronized digital patient models',
      accentColor: '#60A5FA',
      badgeText: 'Live Stream',
      badgeType: 'info' as const,
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'metric-alerts',
      title: 'Alerts',
      value: metrics.alerts,
      subtitle: 'Critical & moderate telemetry events',
      accentColor: '#EF4444',
      badgeText: 'Real-time',
      badgeType: 'danger' as const,
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'metric-response',
      title: 'Avg Response Time',
      value: metrics.avgResponseTime,
      subtitle: 'Clinical anomaly triage latency',
      accentColor: '#10B981',
      badgeText: 'Optimal SLA',
      badgeType: 'success' as const,
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const anomalyCount = patients.filter((p) => p.status === 'Anomaly').length;

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
            Real-time Health Surveillance
          </h1>
          <p
            style={{
              color: '#94A3B8',
              marginTop: '8px',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            Continuous physiological telemetry streams, digital twins synchronization, and instant anomaly detection.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '8px 16px',
              borderRadius: '10px',
              color: '#34D399',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981',
                animation: 'pulse 2s infinite'
              }}
            />
            Live Telemetry Engine Active
          </div>
        </div>
      </div>

      <section aria-label="Surveillance Key Performance Indicators">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {summaryMetrics.map((m) => (
            <MetricCard
              key={m.id}
              title={m.title}
              value={m.value}
              subtitle={m.subtitle}
              accentColor={m.accentColor}
              badgeText={m.badgeText}
              badgeType={m.badgeType}
              icon={m.icon}
            />
          ))}
        </div>
      </section>

      <section aria-label="Live Telemetry Monitoring Table" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              marginBottom: '20px'
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                Live Monitoring
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '4px' }}>
                High-frequency vital sign feeds updating automatically across connected units.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setFilter('ALL')}
                className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                All ({patients.length})
              </button>
              <button
                onClick={() => setFilter('ANOMALY')}
                className={`btn btn-sm ${filter === 'ANOMALY' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                🔴 Anomalies ({anomalyCount})
              </button>
              <button
                onClick={() => setFilter('NORMAL')}
                className={`btn btn-sm ${filter === 'NORMAL' ? 'btn-success' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                🟢 Normal ({patients.length - anomalyCount})
              </button>
            </div>
          </div>

          <MonitoringTable
            patients={patients}
            onViewPatient={handleViewPatient}
            filterStatus={filter}
          />
        </div>
      </section>

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />
    </div>
  );
};
