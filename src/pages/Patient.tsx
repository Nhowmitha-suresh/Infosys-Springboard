import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicalModuleLinks } from '../components/ClinicalModuleLinks';
import { MediModal } from '../components/Modal';
import { MediStorage } from '../services/storage';

export const Patient: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = MediStorage.getCurrentUser();
  const patients = MediStorage.getPatients();
  const patient = patients.find(p => p.name === currentUser?.name || p.email === currentUser?.email) || patients[0];
  const appointments = MediStorage.getAppointments().filter(a => a.patientName === patient.name);

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Patient Health Dashboard</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Welcome back, {patient.name} | Patient ID: {patient.id}
        </p>
      </div>

      <ClinicalModuleLinks />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Vitals Summary Card */}
        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Current Health Vitals</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Heart Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#EF4444', marginTop: '4px' }}>{patient.vitals.hr} <span style={{ fontSize: '0.9rem' }}>bpm</span></div>
            </div>
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Blood Pressure</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3B82F6', marginTop: '4px' }}>{patient.vitals.bp}</div>
            </div>
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Oxygen Saturation</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>{patient.vitals.spo2}%</div>
            </div>
            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Body Temp</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>{patient.vitals.temp}°F</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ color: '#FFF', marginBottom: '8px' }}>Diagnosed Conditions:</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {patient.conditions.map((c, i) => (
                <span key={i} className="badge badge-info">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Digital Twin Widget */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#FFF', marginBottom: '12px' }}>Digital Twin Health Model</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981' }}>{patient.twinCompleteness}%</div>
            <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '4px' }}>Telemetry Completeness Score</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/digital-twin')} style={{ marginTop: '16px', width: '100%' }}>
            🧬 View Digital Twin Model
          </button>
        </div>
      </div>

      {/* Patient Appointments */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#FFF', margin: 0 }}>My Scheduled Appointments</h3>
          <button className="btn btn-primary btn-sm" onClick={() => MediModal.openBookAppointment(patient.name)}>
            + Book New Appointment
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Slip</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>No active appointments found.</td>
                </tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.department}</td>
                    <td>{a.date}, {a.time}</td>
                    <td>{a.symptoms}</td>
                    <td><span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => MediModal.openPrintAppointmentSlip(a)}>Print</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
