import React from 'react';
import { MonitoredPatient } from '../../services/monitoringService';
import { MonitoringRow } from './MonitoringRow';

interface MonitoringTableProps {
  patients: MonitoredPatient[];
  onViewPatient: (patient: MonitoredPatient) => void;
  filterStatus?: 'ALL' | 'ANOMALY' | 'NORMAL';
}

export const MonitoringTable: React.FC<MonitoringTableProps> = ({
  patients,
  onViewPatient,
  filterStatus = 'ALL'
}) => {
  const filteredPatients = patients.filter((p) => {
    if (filterStatus === 'ANOMALY') return p.status === 'Anomaly';
    if (filterStatus === 'NORMAL') return p.status === 'Normal';
    return true;
  });

  return (
    <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vital
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Value
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </th>
            <th style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <MonitoringRow
                key={patient.id}
                patient={patient}
                onViewPatient={onViewPatient}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                No active monitored patients matching this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
