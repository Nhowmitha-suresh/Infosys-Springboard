import React from 'react';
import { Link } from 'react-router-dom';
import { MediStorage } from '../services/storage';

const modules = [
  { path: '/twins', label: 'Twins', detail: 'Patient digital twin records', roles: ['admin', 'doctor', 'patient'] },
  { path: '/predictions', label: 'Predictions', detail: 'CVD and diabetes risk', roles: ['admin', 'doctor', 'employee'] },
  { path: '/alerts', label: 'Alerts', detail: 'Review active alerts', roles: ['admin', 'doctor', 'patient', 'receptionist', 'employee'] },
  { path: '/careplans', label: 'Careplans', detail: 'Create intervention plans', roles: ['admin', 'doctor', 'employee'] },
  { path: '/consent-settings', label: 'Consent Settings', detail: 'Manage patient permissions', roles: ['admin', 'doctor', 'patient', 'receptionist', 'employee'] },
  { path: '/consent-verification', label: 'Consent Verification', detail: 'Record consent decisions', roles: ['admin', 'doctor', 'receptionist', 'employee'] },
  { path: '/ml-models', label: 'ML Models', detail: 'Models and explainability', roles: ['admin', 'doctor', 'employee'] },
  { path: '/ml-analytics', label: 'ML Analytics', detail: 'Prediction performance', roles: ['admin', 'doctor', 'employee'] },
  { path: '/prediction-care', label: 'Prediction Care', detail: 'Personalized clinical workflows', roles: ['admin', 'doctor', 'patient', 'receptionist', 'employee'] },
];

export const ClinicalModuleLinks: React.FC = () => {
  const role = MediStorage.getCurrentUser()?.role;
  const availableModules = modules.filter((module) => role && module.roles.includes(role));

  return (
    <section aria-label="Clinical modules" style={{ marginBottom: 4 }}>
      <h2 style={{ color: '#F8FAFC', fontSize: '1rem', marginBottom: 12 }}>Clinical modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
        {availableModules.map((module) => (
          <Link key={module.path} to={module.path} className="card-panel" style={{ display: 'block', padding: 14, borderRadius: 8, textDecoration: 'none' }}>
            <strong style={{ display: 'block', color: '#F8FAFC', marginBottom: 4 }}>{module.label}</strong>
            <span style={{ fontSize: '.78rem', color: '#94A3B8' }}>{module.detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};