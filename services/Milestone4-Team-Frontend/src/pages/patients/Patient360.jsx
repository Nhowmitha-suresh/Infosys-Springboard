// src/pages/patients/Patient360.jsx
//
// A single consolidated view of one patient — demographics, live vitals,
// allergies, prescriptions, appointment history, and consent status —
// instead of that information being spread across separate pages.
//
// Route suggestion (add to App.jsx):
//   <Route path="/patients/:id/360" element={
//     <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}>
//       <Patient360 />
//     </ProtectedRoute>
//   } />

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPatientById, getPatientAllergies, getPatientPrescriptions, getPatientAppointments } from '../../api/patientService'
import VitalsMonitor from '../../components/vitals/VitalsMonitor'
import Loader from '../../components/common/Loader'

export default function Patient360() {
  const { id } = useParams()
  const patientId = Number(id)

  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [allergies, setAllergies] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getPatientById(patientId),
      getPatientAllergies(patientId),
      getPatientPrescriptions(patientId),
      getPatientAppointments(patientId),
    ]).then(([p, a, rx, appts]) => {
      if (cancelled) return
      setPatient(p)
      setAllergies(a)
      setPrescriptions(rx)
      setAppointments(appts)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [patientId])

  if (loading || !patient) {
    return <Loader />
  }

  return (
    <div>
      <Link to="/doctor/patients" className="text-decoration-none" style={{ fontSize: '0.85rem' }}>
        <i className="bi bi-arrow-left me-1" /> Back to patients
      </Link>

      {/* Header */}
      <div className="ms-card p-3 p-md-4 my-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h4 className="brand-font mb-1">{patient.name}</h4>
          <div className="text-muted" style={{ fontSize: '0.86rem' }}>
            {patient.age} yrs · {patient.gender} · Blood group {patient.bloodGroup} · {patient.condition}
          </div>
        </div>
        <div className="d-flex gap-2">
          <span className="ms-badge-status">
            <span className="dot" style={{ background: patient.status === 'Active' ? 'var(--teal-500)' : 'var(--ink-soft)' }} />
            {patient.status}
          </span>
          <Link to={`/patients/${patient.id}/consent`} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-shield-check me-1" /> Consent settings
          </Link>
        </div>
      </div>

      {/* Live vitals */}
      <div className="ms-card p-3 p-md-4 mb-4">
        <VitalsMonitor patientId={patient.id} />
      </div>

      <div className="row g-4">
        {/* Allergies */}
        <div className="col-md-6">
          <div className="ms-card p-3 p-md-4 h-100">
            <h6 className="brand-font mb-3">Allergies</h6>
            {allergies.map((a, i) => (
              <span key={i} className="badge me-2 mb-2" style={{ background: 'var(--coral-100)', color: 'var(--coral)', fontWeight: 500 }}>
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="col-md-6">
          <div className="ms-card p-3 p-md-4 h-100">
            <h6 className="brand-font mb-3">Current Prescriptions</h6>
            {prescriptions.length === 0 && <div className="text-muted small">No active prescriptions.</div>}
            {prescriptions.map(rx => (
              <div key={rx.id} className="mb-2 pb-2 border-bottom" style={{ borderColor: 'var(--line)' }}>
                <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{rx.drug}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {rx.dosage} · {rx.prescribedBy} · <span className="ms-mono-cell">{rx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment history */}
        <div className="col-12">
          <div className="ms-card p-0">
            <div className="p-3 pb-0"><h6 className="brand-font">Appointment History</h6></div>
            <table className="table ms-table mb-0">
              <thead>
                <tr><th>Date</th><th>Time</th><th>Doctor</th><th>Type</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.length === 0 && (
                  <tr><td colSpan={5} className="text-muted small">No appointments on record.</td></tr>
                )}
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td className="ms-mono-cell">{a.date}</td>
                    <td className="ms-mono-cell">{a.time}</td>
                    <td>{a.doctor}</td>
                    <td>{a.type}</td>
                    <td>
                      <span className="ms-badge-status">
                        <span className="dot" style={{
                          background: a.status === 'Confirmed' ? 'var(--teal-500)' : a.status === 'Pending' ? 'var(--amber)' : 'var(--coral)',
                        }} />
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
