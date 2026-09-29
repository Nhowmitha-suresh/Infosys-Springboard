import React, { useState } from 'react';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';
import { Column, DataTable } from '../components/DataTable';
import { MediModal } from '../components/Modal';
import { MediStorage } from '../services/storage';
import { Appointment } from '../types';

export const Receptionist: React.FC = () => {
  const [appointments, setAppointments] = useState(MediStorage.getAppointments());
  const currentUser = MediStorage.getCurrentUser();

  const columns: Column<Appointment>[] = [
    { key: 'id', label: 'Token / Appt ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'department', label: 'Department' },
    { key: 'time', label: 'Slot Time' },
    {
      key: 'status',
      label: 'Desk Status',
      render: (val) => {
        const cls = val === 'Confirmed' ? 'badge-success' : val === 'Pending' ? 'badge-warning' : 'badge-info';
        return <span className={`badge ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Front Desk Action',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {r.status === 'Pending' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                r.status = 'Confirmed';
                MediStorage.saveAppointment(r);
                MediStorage.logActivity('Receptionist confirmed appointment', `Receptionist ${currentUser?.name} confirmed ${r.id} for ${r.patientName}`);
                setAppointments(MediStorage.getAppointments());
              }}
            >
              Confirm & Check-in
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => MediModal.openPrintAppointmentSlip(r)}>
            Print Slip
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Front Desk & Reception Desk</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Patient Intake, Outpatient Queue Management & Slip Printing (Reception Desk Unit)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => MediModal.openBookAppointment(undefined, () => setAppointments(MediStorage.getAppointments()))}>
            + Book Walk-in Appointment
          </button>
          <button className="btn btn-secondary" onClick={() => MediModal.openAddPatient()}>
            + Patient Intake Registration
          </button>
        </div>
      </div>

      <ClinicalModuleLinks />

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-title">Walk-in Queue Today</div>
          <div className="metric-value">{appointments.filter(a => a.status === 'Pending').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Checked-in & Confirmed</div>
          <div className="metric-value">{appointments.filter(a => a.status === 'Confirmed').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Consultations Finished</div>
          <div className="metric-value">{appointments.filter(a => a.status === 'Completed').length}</div>
        </div>
      </div>

      <div className="card-panel">
        <DataTable
          title="Reception Desk Appointments Queue"
          data={appointments}
          columns={columns}
          pageSize={10}
          exportFilename="reception_intake_queue.csv"
        />
      </div>
    </div>
  );
};