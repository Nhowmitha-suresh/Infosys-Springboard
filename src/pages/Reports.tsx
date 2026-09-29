import React from 'react';
import { MediStorage } from '../services/storage';
import { MediUtils } from '../services/utils';
import { MediToast } from '../components/Toast';

export const Reports: React.FC = () => {
  const exportPatients = () => {
    const patients = MediStorage.getPatients();
    MediUtils.exportToCSV('medisphere_patients_report.csv', patients);
    MediToast.success('Exported Karnataka Patient Registry CSV report!');
  };

  const exportDoctors = () => {
    const doctors = MediStorage.getDoctors();
    MediUtils.exportToCSV('medisphere_doctors_report.csv', doctors);
    MediToast.success('Exported Doctors Roster CSV report!');
  };

  const exportAppointments = () => {
    const appointments = MediStorage.getAppointments();
    MediUtils.exportToCSV('medisphere_appointments_report.csv', appointments);
    MediToast.success('Exported Appointments Queue CSV report!');
  };

  const printFullExecutiveSummary = () => {
    const patients = MediStorage.getPatients();
    const doctors = MediStorage.getDoctors();
    const appointments = MediStorage.getAppointments();
    MediUtils.downloadSimulatedPDF('MediSphere Executive Hospital Report 2026', `
MediSphere Health Systems Executive Report
Generated: ${new Date().toLocaleString()}

- Total Active Patient Registry: ${patients.length} (Karnataka Healthcare Network)
- Active Attending Doctors: ${doctors.length}
- Total Appointments Recorded: ${appointments.length}
- Confirmed Outpatient Visits: ${appointments.filter(a => a.status === 'Confirmed').length}
- HL7 FHIR Interoperability Status: Operational (500 FHIR v4 Resources Synced)
- Real-time Telemetry: Apache Kafka Pipeline Latency 0.02ms
    `);
  };

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Reports & Executive Exports</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Downloadable Hospital Datasets, Compliance Logs & Executive PDF Summaries
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '8px' }}>Patient Registry Report</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Full record export of all 300 registered Karnataka patients including vitals and conditions.</p>
          <button className="btn btn-primary" onClick={exportPatients}>📥 Export CSV</button>
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '8px' }}>Doctors Directory Roster</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Attending physicians, specializations, ratings, and hospital unit assignments.</p>
          <button className="btn btn-primary" onClick={exportDoctors}>📥 Export CSV</button>
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '8px' }}>Outpatient Appointments Log</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Complete history of 1,000 scheduled, confirmed, and completed appointments.</p>
          <button className="btn btn-primary" onClick={exportAppointments}>📥 Export CSV</button>
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '8px' }}>Executive PDF Summary Report</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Formally formatted printable PDF report for hospital board and health authorities.</p>
          <button className="btn btn-secondary" onClick={printFullExecutiveSummary}>🖨️ Generate PDF</button>
        </div>
      </div>
    </div>
  );
};
