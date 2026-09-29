import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MediStorage } from '../services/storage';
import { GlobalModalContainer } from './Modal';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MediToast, ToastContainer } from './Toast';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = MediStorage.getCurrentUser();
  const token = sessionStorage.getItem('medisphere_token');

  useEffect(() => {
    if (!currentUser || !token) {
      sessionStorage.setItem('medisphere_login_notice', 'Please login to continue.');
      navigate('/login');
      return;
    }

    // Access control mapper
    const path = location.pathname;
    const PAGE_PERMISSIONS: Record<string, string[]> = {
      '/dashboard': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/models': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/ml-models': ['admin', 'doctor', 'employee'],
      '/cvd-risk': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/predictions': ['admin', 'doctor', 'employee'],
      '/diabetes-risk': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/continuous-monitoring': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/alerts': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/federated-training': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/patients': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/reports': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/analytics': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/ml-analytics': ['admin', 'doctor', 'employee'],
      '/authentication': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/model-versioning': ['admin', 'doctor', 'employee'],
      '/clinical-rule-engine': ['admin', 'doctor', 'employee'],
      '/admin': ['admin'],
      '/fhir': ['admin'],
      '/kafka-streaming': ['admin'],
      '/settings': ['admin'],
      '/doctor': ['admin', 'doctor'],
      '/patient': ['admin', 'patient'],
      '/receptionist': ['admin', 'receptionist'],
      '/employee': ['admin', 'employee'],
      '/doctors': ['admin', 'doctor', 'receptionist'],
      '/appointments': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/medical-records': ['admin', 'doctor', 'patient', 'employee'],
      '/digital-twin': ['admin', 'doctor', 'patient'],
      '/twins': ['admin', 'doctor', 'patient'],
      '/careplans': ['admin', 'doctor', 'employee'],
      '/consent-settings': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/consent-verification': ['admin', 'doctor', 'receptionist', 'employee'],
      '/precision-care': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/prediction-care': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/patient-360': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/personalized-intervention': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/clinical-guideline-compliance': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/outcomes': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/provider-collaboration': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/fhir-validation': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/patient-consent': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/audit-logs': ['admin', 'doctor', 'receptionist'],
      '/team-c/model-accuracy': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/federated-convergence': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/shap-validity': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/alert-fatigue-prevention': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/anomaly-detection-precision': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/vitals-range-validation': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/careplan-safety-checks': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/clinical-guideline-compliance': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-c/drug-interaction-validation': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/rbac': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/twin-data-completeness': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/vitals-range-validation': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/bias-audit': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/clinical-guidelines-compliance': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/prediction-calibration': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/acknowledgment-tracking': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/alert-routing': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/false-alert-rate': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/adherence-calculation-accuracy': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/outcome-tracking-integrity': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
      '/team-d/provider-approval-workflow': ['admin', 'doctor', 'patient', 'receptionist', 'employee'],
    };

    const allowedRoles = PAGE_PERMISSIONS[path];
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      MediToast.error(`Access Denied: Your role (${currentUser.role.toUpperCase()}) cannot access ${path}`, 'Access Security Warning');
      navigate('/dashboard');
    }
  }, [location.pathname, currentUser, token, navigate]);

  if (!currentUser || !token) {
    return null;
  }

  return (
    <div className="app-shell">
      <Navbar currentUser={currentUser} />
      <div className="app-container">
        <Sidebar currentUser={currentUser} />
        <main className="main-content" style={{ padding: '32px 36px' }}>
          {children}
        </main>
      </div>
      <ToastContainer />
      <GlobalModalContainer />
    </div>
  );
};
