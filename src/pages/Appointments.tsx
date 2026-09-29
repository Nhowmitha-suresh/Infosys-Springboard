import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediModal } from '../components/Modal';
import { DataTable, Column } from '../components/DataTable';
import { Appointment } from '../types';

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState(MediStorage.getAppointments());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredData = filterStatus === 'all' ? appointments : appointments.filter(a => a.status.toLowerCase() === filterStatus.toLowerCase());

  const columns: Column<Appointment>[] = [
    { key: 'id', label: 'Appt ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'doctorName', label: 'Doctor Assigned' },
    { key: 'department', label: 'Department' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time Slot' },
    { key: 'symptoms', label: 'Chief Complaint' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const cls = val === 'Confirmed' ? 'badge-success' : val === 'Pending' ? 'badge-warning' : val === 'Completed' ? 'badge-info' : 'badge-danger';
        return <span className={`badge ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, r) => (
        <button className="btn btn-secondary btn-sm" onClick={() => MediModal.openPrintAppointmentSlip(r)}>
          Slip
        </button>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Appointments Management</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Outpatient & Specialty Clinical Consultation Schedule
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => MediModal.openBookAppointment(undefined, () => setAppointments(MediStorage.getAppointments()))}>
          + Book New Appointment
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(st => (
          <button
            key={st}
            className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st} ({st === 'all' ? appointments.length : appointments.filter(a => a.status.toLowerCase() === st).length})
          </button>
        ))}
      </div>

      <div className="card-panel">
        <DataTable
          data={filteredData}
          columns={columns}
          pageSize={10}
          exportFilename="medisphere_appointments.csv"
        />
      </div>
    </div>
  );
};
