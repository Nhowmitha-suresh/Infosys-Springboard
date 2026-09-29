import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediUtils } from '../services/utils';
import { DataTable, Column } from '../components/DataTable';

export const MedicalRecords: React.FC = () => {
  const patients = MediStorage.getPatients();

  const records = patients.map((p, idx) => ({
    id: `EMR-${7000 + idx}`,
    patientId: p.id,
    patientName: p.name,
    doctorName: p.assignedDoctor,
    diagnosis: p.conditions.join(', '),
    prescription: idx % 2 === 0 ? 'Dolo 650mg, Pan 40mg, Telma 40mg' : 'Metformin 500mg, Atorvastatin 10mg',
    labReport: idx % 3 === 0 ? 'Complete Blood Count (CBC) - Normal' : 'HbA1c: 6.8% (Controlled)',
    date: p.onboardedDate
  }));

  const columns: Column<typeof records[0]>[] = [
    { key: 'id', label: 'Record ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'doctorName', label: 'Attending Doctor' },
    { key: 'diagnosis', label: 'Clinical Diagnosis' },
    { key: 'prescription', label: 'Prescription' },
    { key: 'labReport', label: 'Lab Findings' },
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'PDF Report',
      render: (_, r) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            MediUtils.downloadSimulatedPDF(`Medical Record ${r.id} - ${r.patientName}`, `
Patient Name: ${r.patientName} (${r.patientId})
Attending Physician: ${r.doctorName}
Clinical Diagnosis: ${r.diagnosis}
Active Prescriptions: ${r.prescription}
Laboratory Test Results: ${r.labReport}
Onboarded Date: ${r.date}
            `);
          }}
        >
          📄 PDF
        </button>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Medical Records Repository</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Electronic Medical Records (EMR), Clinical Prescriptions & Lab Diagnostics
        </p>
      </div>

      <div className="card-panel">
        <DataTable
          data={records}
          columns={columns}
          pageSize={10}
          exportFilename="medisphere_emr_records.csv"
        />
      </div>
    </div>
  );
};
