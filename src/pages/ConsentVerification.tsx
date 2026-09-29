import React, { FormEvent, useState } from 'react';
import { MediStorage } from '../services/storage';
import { Patient } from '../types';

type VerificationRecord = {
  id: string;
  patientId: string;
  patientName: string;
  consentType: string;
  decision: 'Granted' | 'Declined';
  consentDate: string;
  expiryDate: string;
  verifiedAt: string;
};

const auditStorageKey = 'medisphere_consent_verification_audit';
const consentOptions = ['Share records with treating care team', 'Clinical research participation', 'Remote monitoring data sharing', 'Care and appointment notifications'];

const readAudit = (): VerificationRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(auditStorageKey) || '[]') as VerificationRecord[];
  } catch {
    return [];
  }
};

export const ConsentVerification: React.FC = () => {
  const patients: Patient[] = MediStorage.getPatients();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [consentType, setConsentType] = useState(consentOptions[0]);
  const [consentDate, setConsentDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [audit, setAudit] = useState<VerificationRecord[]>(readAudit);
  const [error, setError] = useState('');

  const submitVerification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const patient = patients.find((entry) => entry.id === patientId);
    if (!patient) {
      setError('Select a valid patient to record consent.');
      return;
    }
    if (expiryDate && expiryDate < consentDate) {
      setError('Expiry date cannot be earlier than the consent date.');
      return;
    }

    const nextRecord: VerificationRecord = {
      id: `CV-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      consentType,
      decision: consentGiven ? 'Granted' : 'Declined',
      consentDate,
      expiryDate,
      verifiedAt: new Date().toISOString(),
    };
    const nextAudit = [nextRecord, ...audit];
    localStorage.setItem(auditStorageKey, JSON.stringify(nextAudit));
    setAudit(nextAudit);
    setError('');
  };

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Consent Verification</h1>
        <p style={{ margin: '5px 0 0' }}>Record a patient decision and review the verification history.</p>
      </header>
      {!patients.length ? <div className="card-panel">Add a patient record before verifying consent.</div> : (
        <>
          <form className="card-panel form-grid" style={{ maxWidth: 860 }} onSubmit={submitVerification}>
            <div className="form-field full-width">
              <label className="form-label" htmlFor="consent-patient">Patient</label>
              <select id="consent-patient" className="form-input" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} · {patient.id}</option>)}
              </select>
            </div>
            <div className="form-field full-width">
              <label className="form-label" htmlFor="consent-kind">Consent type</label>
              <select id="consent-kind" className="form-input" value={consentType} onChange={(event) => setConsentType(event.target.value)}>
                {consentOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="consent-date">Decision date</label>
              <input id="consent-date" className="form-input" type="date" required value={consentDate} onChange={(event) => setConsentDate(event.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="consent-expiry">Expiry date (optional)</label>
              <input id="consent-expiry" className="form-input" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
            </div>
            <label className="form-field full-width" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={consentGiven} onChange={(event) => setConsentGiven(event.target.checked)} />
              Patient grants this consent
            </label>
            {error && <div role="alert" className="form-field full-width" style={{ color: '#FCA5A5' }}>{error}</div>}
            <div className="form-field full-width" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" type="submit">Record verification</button>
            </div>
          </form>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ color: '#F8FAFC', fontSize: '1.15rem', marginBottom: 12 }}>Recent verification records</h2>
            <div className="card-panel" style={{ overflowX: 'auto' }}>
              {!audit.length ? <p>No consent verification records yet.</p> : (
                <table className="data-table" style={{ width: '100%' }}>
                  <thead><tr><th>Patient</th><th>Consent</th><th>Decision</th><th>Decision date</th><th>Verified</th></tr></thead>
                  <tbody>{audit.slice(0, 12).map((record) => <tr key={record.id}><td>{record.patientName}</td><td>{record.consentType}</td><td>{record.decision}</td><td>{record.consentDate}</td><td>{new Date(record.verifiedAt).toLocaleString()}</td></tr>)}</tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};