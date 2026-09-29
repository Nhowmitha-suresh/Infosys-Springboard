import React, { useState } from 'react';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';
import { Column, DataTable } from '../components/DataTable';
import { MediModal } from '../components/Modal';
import { MediStorage } from '../services/storage';
import { Appointment } from '../types';

export const Doctor: React.FC = () => {
  const currentUser = MediStorage.getCurrentUser();
  const [appointments, setAppointments] = useState(MediStorage.getAppointments());
  const [patients] = useState(MediStorage.getPatients());

  const doctorAppts = appointments.filter(a => a.doctorName.includes(currentUser?.name || 'Ananthakrishna'));

  const apptColumns: Column<Appointment>[] = [
    { key: 'id', label: 'Appt ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'symptoms', label: 'Chief Complaint' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const cls = val === 'Confirmed' ? 'badge-success' : val === 'Pending' ? 'badge-warning' : 'badge-info';
        return <span className={`badge ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, r) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            r.status = 'Completed';
            MediStorage.saveAppointment(r);
            MediStorage.logActivity('Doctor completed consultation', `Dr. ${currentUser?.name} completed ${r.id} for ${r.patientName}`);
            setAppointments(MediStorage.getAppointments());
          }}
        >
          ✓ Complete
        </button>
      )
    }
  ];

  const myPatients = patients.filter(p => p.assignedDoctor.includes(currentUser?.name || 'Ananthakrishna') || true).slice(0, 8);

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Doctor Clinical Dashboard</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Welcome, {currentUser?.name || 'Dr. Ananthakrishna Bhat'} | Cardiology & Outpatient Unit
        </p>
      </div>

      <ClinicalModuleLinks />

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-title">My Total Appointments</div>
          <div className="metric-value">{doctorAppts.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Pending Consultations</div>
          <div className="metric-value">{doctorAppts.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Completed Today</div>
          <div className="metric-value">{doctorAppts.filter(a => a.status === 'Completed').length}</div>
        </div>
      </div>

      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <DataTable
          title="Clinical Consultations Queue"
          data={doctorAppts.length > 0 ? doctorAppts : appointments.slice(0, 15)}
          columns={apptColumns}
          pageSize={8}
          exportFilename="doctor_consultations.csv"
        />
      </div>

      <div className="card-panel">
        <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Inpatient Vitals Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {myPatients.slice(0, 4).map(p => (
            <div key={p.id} style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#FFF', fontSize: '1rem' }}>{p.name}</strong>
                <span className="badge badge-primary">{p.id}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>HR: <strong style={{ color: '#EF4444' }}>{p.vitals.hr} bpm</strong></div>
                <div>BP: <strong style={{ color: '#3B82F6' }}>{p.vitals.bp}</strong></div>
                <div>SpO2: <strong style={{ color: '#10B981' }}>{p.vitals.spo2}%</strong></div>
                <div>Temp: <strong style={{ color: '#F59E0B' }}>{p.vitals.temp}°F</strong></div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => MediModal.openRecordVitals(p.id, p.name)}>Update Vitals</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
