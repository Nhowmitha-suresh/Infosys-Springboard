import React, { useState } from 'react';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';
import { Column, DataTable } from '../components/DataTable';
import { MediModal } from '../components/Modal';
import { MediStorage } from '../services/storage';
import { Patient } from '../types';

export const Employee: React.FC = () => {
  const [patients, setPatients] = useState(MediStorage.getPatients());
  const currentUser = MediStorage.getCurrentUser();

  const columns: Column<Patient>[] = [
    { key: 'id', label: 'Patient ID' },
    { key: 'name', label: 'Patient Name' },
    { key: 'hospital', label: 'Ward / Facility' },
    {
      key: 'vitals',
      label: 'Heart Rate',
      render: (v) => <span style={{ color: '#EF4444', fontWeight: 600 }}>{v?.hr} bpm</span>
    },
    {
      key: 'vitals_bp',
      label: 'Blood Pressure',
      render: (_, r) => <span style={{ color: '#3B82F6', fontWeight: 600 }}>{r.vitals?.bp}</span>
    },
    {
      key: 'vitals_spo2',
      label: 'SpO2 Oxygen',
      render: (_, r) => <span style={{ color: '#10B981', fontWeight: 600 }}>{r.vitals?.spo2}%</span>
    },
    {
      key: 'actions',
      label: 'Nursing Action',
      render: (_, r) => (
        <button className="btn btn-primary btn-sm" onClick={() => MediModal.openRecordVitals(r.id, r.name, () => setPatients(MediStorage.getPatients()))}>
          💉 Record Vitals
        </button>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Medical Staff & Nursing Portal</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Logged in as {currentUser?.name || 'Keerthana Bhat'} | Ward Vitals Recording & Triage Station
          </p>
        </div>
      </div>

      <ClinicalModuleLinks />

      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Ward Vitals Telemetry Monitor</h3>
        <DataTable
          data={patients}
          columns={columns}
          pageSize={8}
          exportFilename="medical_staff_vitals.csv"
        />
      </div>
    </div>
  );
};
