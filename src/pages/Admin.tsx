import React, { useState } from 'react';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';
import { Column, DataTable } from '../components/DataTable';
import { MediModal } from '../components/Modal';
import { MediStorage } from '../services/storage';
import { ActivityLog, User } from '../types';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState(MediStorage.getUsers());
  const [activityLogs, setActivityLogs] = useState(MediStorage.getActivityLogs());

  const userColumns: Column<User>[] = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    {
      key: 'role',
      label: 'System Role',
      render: (val) => {
        const cls = val === 'admin' ? 'badge-danger' : val === 'doctor' ? 'badge-primary' : val === 'patient' ? 'badge-success' : val === 'receptionist' ? 'badge-warning' : 'badge-info';
        return <span className={`badge ${cls}`}>{val.toUpperCase()}</span>;
      }
    },
    { key: 'department', label: 'Department / Unit', render: (v) => v || 'General Staff' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`badge ${val === 'Active' ? 'badge-success' : 'badge-warning'}`}>{val}</span>
    }
  ];

  const logColumns: Column<ActivityLog>[] = [
    { key: 'id', label: 'Log ID' },
    { key: 'action', label: 'System Action' },
    { key: 'details', label: 'Details' },
    { key: 'user', label: 'Performed By' },
    { key: 'timestamp', label: 'Timestamp' }
  ];

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>User Management</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            System Administration, Role Credentials Control, and Security Audit Logs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => MediModal.openAddUser(() => setUsers(MediStorage.getUsers()))}>
            + Create New User
          </button>
          <button className="btn btn-secondary" onClick={() => MediModal.openAddDoctor(() => setUsers(MediStorage.getUsers()))}>
            👨‍⚕️ Add Doctor Account
          </button>
        </div>
      </div>

      <ClinicalModuleLinks />

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-title">System Admins</div>
          <div className="metric-value">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Doctors</div>
          <div className="metric-value">{users.filter(u => u.role === 'doctor').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Patients</div>
          <div className="metric-value">{users.filter(u => u.role === 'patient').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Receptionists</div>
          <div className="metric-value">{users.filter(u => u.role === 'receptionist').length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Medical Staff</div>
          <div className="metric-value">{users.filter(u => u.role === 'employee').length}</div>
        </div>
      </div>

      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <DataTable
          title="Hospital System Accounts"
          data={users}
          columns={userColumns}
          pageSize={10}
          exportFilename="medisphere_users.csv"
        />
      </div>

      <div className="card-panel">
        <DataTable
          title="System Audit & Activity Logs"
          data={activityLogs}
          columns={logColumns}
          pageSize={8}
          exportFilename="medisphere_audit_logs.csv"
        />
      </div>
    </div>
  );
};
