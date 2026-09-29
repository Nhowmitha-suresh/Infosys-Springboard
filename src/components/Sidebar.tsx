import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { monitoringService } from '../services/monitoringService';
import { User } from '../types';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6' },
  { path: '/patients', label: 'Patients', icon: 'M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8m8-1a4 4 0 010 8m4 3v-2a4 4 0 00-3-3.87' },
  { path: '/appointments', label: 'Appointments', icon: 'M8 2v4m8-4v4M3 10h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
  { path: '/digital-twin', label: 'Twins', icon: 'M12 3v18m9-9H3m15.36-6.36L5.64 17.64M18.36 17.64L5.64 6.36' },
  { path: '/predictions', label: 'Predictions', icon: 'M4 19V5m0 14h16M7 15l3-4 3 2 5-7' },
  { path: '/alerts', label: 'Alerts', icon: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 004 0', alertCount: true },
  { path: '/careplans', label: 'Careplans', icon: 'M6 3h12v18H6zM9 7h6m-6 4h6m-6 4h4' },
  { path: '/consent-settings', label: 'Consent Settings', icon: 'M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3zm-3 9l2 2 4-4' },
  { path: '/consent-verification', label: 'Consent Verification', icon: 'M8 4h8a2 2 0 012 2v14H6V6a2 2 0 012-2zm2 5h4m-4 4h2m-1 4l1.5 1.5L16 15' },
  { path: '/ml-models', label: 'ML Models', icon: 'M4 4h16v12H4zM8 20h8m-4-4v4M8 9h3m2 0h3m-8 3h8' },
  { path: '/ml-analytics', label: 'ML Analytics', icon: 'M4 19V5m0 14h16M8 15v-3m4 3V8m4 7V5' },
  { path: '/prediction-care', label: 'Prediction Care', icon: 'M12 3l2.2 4.6L19 9l-4.8 1.4L12 15l-2.2-4.6L5 9l4.8-1.4L12 3z' },
  { path: '/continuous-monitoring', label: 'Continuous Monitoring', icon: 'M13 2L4 14h7l-1 8 10-13h-7l1-7', badge: 'LIVE' },
  { path: '/federated-training', label: 'Federated Training', icon: 'M12 3v18m9-9H3m15.36-6.36L5.64 17.64M18.36 17.64L5.64 6.36' },
  { path: '/clinical-guidelines', label: 'Clinical Guideline Engine', icon: 'M9 12l2 2 4-4m5-5a12 12 0 01-8-3 12 12 0 01-8 3v5c0 5 3 8 8 10 5-2 8-5 8-10V5z' },
  { path: '/adherence-tracking', label: 'Adherence Tracking', icon: 'M4 19V5m0 14h16M8 15v-4m4 4V8m4 7V5' },
  { path: '/patient-360', label: 'Patient 360', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8m-8 9a8 8 0 0116 0' },
  { path: '/personalized-intervention', label: 'Personalized Intervention', icon: 'M12 3v18m9-9H3m15.36-6.36L5.64 17.64M18.36 17.64L5.64 6.36' },
  { path: '/clinical-guideline-compliance', label: 'Clinical Guideline Compliance', icon: 'M9 12l2 2 4-4m5-5a12 12 0 01-8-3 12 12 0 01-8 3v5c0 5 3 8 8 10 5-2 8-5 8-10V5z' },
  { path: '/outcomes', label: 'Outcomes', icon: 'M4 19V5m0 14h16M7 15l3-4 3 2 5-7' },
  { path: '/provider-collaboration', label: 'Provider Collaboration', icon: 'M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8m8-1a4 4 0 010 8m4 3v-2a4 4 0 00-3-3.87' },
  { path: '/authentication', label: 'Authentication', icon: 'M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3zm-1 9a1 1 0 112 0v2h-2v-2z' },
  { path: '/model-versioning', label: 'Model Versioning', icon: 'M6 3v12m0 0a3 3 0 103 3 3 3 0 00-3-3zm12-9a3 3 0 10-3-3 3 3 0 003 3zm0 0v3a4 4 0 01-4 4H9' },
  { path: '/clinical-rule-engine', label: 'Clinical Rule Engine', icon: 'M4 6h16M4 12h10M4 18h7m7-6l2 2 3-4', badge: 'NEW' },
  { path: '/reports', label: 'Reports', icon: 'M6 3h9l5 5v13H6zM14 3v6h6m-10 4h6m-6 4h6' },
  { path: '/team-c/fhir-validation', label: 'FHIR Validation', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/patient-consent', label: 'Patient Consent Verification', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/audit-logs', label: 'HIPAA Audit Logs', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/model-accuracy', label: 'Model Accuracy', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/federated-convergence', label: 'Federated Convergence', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/shap-validity', label: 'SHAP Validity', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/alert-fatigue-prevention', label: 'Alert Fatigue Prevention', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/anomaly-detection-precision', label: 'Anomaly Detection Precision', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/vitals-range-validation', label: 'Vitals Range Validation', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/careplan-safety-checks', label: 'Careplan Safety Checks', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/clinical-guideline-compliance', label: 'Clinical Guideline Compliance', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-c/drug-interaction-validation', label: 'Drug Interaction Validation', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/rbac', label: 'RBAC', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/twin-data-completeness', label: 'Twin Data Completeness', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/vitals-range-validation', label: 'Vitals Range Validation', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/bias-audit', label: 'Bias Audit', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/clinical-guidelines-compliance', label: 'Clinical Guidelines Compliance', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/prediction-calibration', label: 'Prediction Calibration', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/acknowledgment-tracking', label: 'Acknowledgment Tracking', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/alert-routing', label: 'Alert Routing', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/false-alert-rate', label: 'False Alert Rate', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/adherence-calculation-accuracy', label: 'Adherence Calculation Accuracy', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/outcome-tracking-integrity', label: 'Outcome Tracking Integrity', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { path: '/team-d/provider-approval-workflow', label: 'Provider Approval Workflow', icon: 'M4 4h16v16H4zM4 9h16M9 9v11' },
];

const roleAccess: Record<string, string[]> = {
  '/digital-twin': ['admin', 'doctor', 'patient'],
  '/twins': ['admin', 'doctor', 'patient'],
  '/predictions': ['admin', 'doctor', 'employee'],
  '/careplans': ['admin', 'doctor', 'employee'],
  '/consent-verification': ['admin', 'doctor', 'receptionist', 'employee'],
  '/ml-models': ['admin', 'doctor', 'employee'],
  '/ml-analytics': ['admin', 'doctor', 'employee'],
  '/model-versioning': ['admin', 'doctor', 'employee'],
  '/clinical-rule-engine': ['admin', 'doctor', 'employee'],
};

export const Sidebar: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
  const [unacknowledgedAlerts, setUnacknowledgedAlerts] = useState<number>(() =>
    monitoringService.getAlerts().filter((alert) => !alert.acknowledged).length
  );

  useEffect(() => {
    const unsubscribe = monitoringService.subscribe(() => {
      setUnacknowledgedAlerts(monitoringService.getAlerts().filter((alert) => !alert.acknowledged).length);
    });
    return unsubscribe;
  }, []);

  const visibleItems = navItems.filter((item) => {
    const allowedRoles = roleAccess[item.path];
    return !allowedRoles || (currentUser && allowedRoles.includes(currentUser.role));
  });

  return (
    <aside id="app-left-sidebar" className="sidebar" aria-label="Main Navigation">
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ fontSize: '0.95rem', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </span>
            {item.badge && <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(56,189,248,.2)', color: '#38BDF8' }}>{item.badge}</span>}
            {item.alertCount && unacknowledgedAlerts > 0 && <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#EF4444', color: '#FFF' }}>{unacknowledgedAlerts}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
