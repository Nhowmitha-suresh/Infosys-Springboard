import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { Patient } from '../types';

type ConsentItem = { key: string; label: string; description: string; granted: boolean };

const consentTypes = [
  { key: 'care-team', label: 'Share records with the care team', description: 'Allow clinicians involved in care to access relevant records.' },
  { key: 'research', label: 'Use de-identified data for research', description: 'Allow de-identified clinical information to support approved research.' },
  { key: 'notifications', label: 'Send care and appointment notifications', description: 'Allow reminders and care updates through configured contact channels.' },
  { key: 'wearables', label: 'Share wearable and remote-monitoring data', description: 'Allow connected device readings to be included in the patient record.' },
];

const readConsents = (patientId: string): ConsentItem[] => {
  try {
    const saved = localStorage.getItem(`medisphere_consent_settings_${patientId}`);
    if (saved) return JSON.parse(saved) as ConsentItem[];
  } catch {
    // Use the default consent choices when stored data cannot be read.
  }
  return consentTypes.map((consent, index) => ({ ...consent, granted: index === 0 || index === 2 }));
};

export const ConsentSettings: React.FC = () => {
  const currentUser = MediStorage.getCurrentUser();
  const allPatients: Patient[] = MediStorage.getPatients();
  const patients = currentUser?.role === 'patient'
    ? allPatients.filter((patient) => patient.name === currentUser.name || patient.email === currentUser.email)
    : allPatients;
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [consents, setConsents] = useState<ConsentItem[]>(() => patients[0] ? readConsents(patients[0].id) : []);
  const [saved, setSaved] = useState(false);

  const choosePatient = (nextPatientId: string) => {
    setPatientId(nextPatientId);
    setConsents(readConsents(nextPatientId));
    setSaved(false);
  };

  const toggleConsent = (key: string) => {
    setConsents((current) => current.map((consent) => consent.key === key ? { ...consent, granted: !consent.granted } : consent));
    setSaved(false);
  };

  const saveConsents = () => {
    if (!patientId) return;
    localStorage.setItem(`medisphere_consent_settings_${patientId}`, JSON.stringify(consents));
    setSaved(true);
  };

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Consent Settings</h1>
        <p style={{ margin: '5px 0 0' }}>Manage patient permissions for care coordination and data use.</p>
      </header>
      {!patients.length ? <div className="card-panel">Add a patient record before managing consent settings.</div> : (
        <div className="card-panel" style={{ maxWidth: 860 }}>
          <label className="form-field" style={{ display: 'block', marginBottom: 18 }}>
            <span className="form-label">Patient</span>
            <select className="form-input" value={patientId} onChange={(event) => choosePatient(event.target.value)}>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} · {patient.id}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gap: 10 }}>
            {consents.map((consent) => (
              <label key={consent.key} className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', padding: 16, cursor: 'pointer' }}>
                <span><strong style={{ display: 'block', color: '#F8FAFC' }}>{consent.label}</strong><small style={{ color: '#94A3B8' }}>{consent.description}</small></span>
                <input aria-label={consent.label} type="checkbox" checked={consent.granted} onChange={() => toggleConsent(consent.key)} />
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 18 }}>
            {saved && <span role="status" style={{ color: '#34D399' }}>Consent settings saved.</span>}
            <button type="button" className="btn btn-primary" onClick={saveConsents}>Save settings</button>
          </div>
        </div>
      )}
    </div>
  );
};