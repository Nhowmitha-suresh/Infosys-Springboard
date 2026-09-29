import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediModal } from '../components/Modal';
import { DataTable, Column } from '../components/DataTable';
import { Doctor } from '../types';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState(MediStorage.getDoctors());

  const columns: Column<Doctor>[] = [
    { key: 'id', label: 'Doctor ID' },
    { key: 'name', label: 'Doctor Name' },
    { key: 'department', label: 'Department' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experience', label: 'Experience' },
    { key: 'phone', label: 'Contact Phone' },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => <span style={{ color: '#F59E0B', fontWeight: 600 }}>⭐ {val}</span>
    },
    {
      key: 'status',
      label: 'Availability',
      render: (val) => <span className={`badge ${val === 'Available' ? 'badge-success' : 'badge-warning'}`}>{val}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, r) => (
        <button className="btn btn-secondary btn-sm" onClick={() => MediModal.openBookAppointment(r.name)}>
          Book Appt
        </button>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Doctors Directory</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Attending Physicians, Specialists, and Departmental Roster (Karnataka Healthcare Network)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => MediModal.openAddDoctor(() => setDoctors(MediStorage.getDoctors()))}>
          + Add New Doctor
        </button>
      </div>

      <div className="card-panel">
        <DataTable
          data={doctors}
          columns={columns}
          pageSize={10}
          exportFilename="medisphere_doctors_directory.csv"
        />
      </div>
    </div>
  );
};
