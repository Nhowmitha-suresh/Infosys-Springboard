import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAppointments } from '../../api/appointmentService'
import { getMyPatient } from '../../api/patientService'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import DashboardModules from '../../components/dashboard/DashboardModules'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime } from '../../utils/dateUtils'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState(null)
  const [myPatientRecord, setMyPatientRecord] = useState(null)

  useEffect(() => {
    Promise.all([getAppointments(), getMyPatient()]).then(([allAppointments, patient]) => {
      setAppointments(allAppointments.filter((appointment) => appointment.patient === user?.name))
      setMyPatientRecord(patient)
    })
  }, [user])

  const upcoming = (appointments || []).filter((a) => a.status !== 'Cancelled')

  return (
    <DashboardLayout title="My Health Dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Welcome back, {user?.name?.split(' ')[0]}. Here's your care summary.</p>
        {myPatientRecord && (
  <Link to={`/patients/${myPatientRecord.id}/360`} className="btn btn-outline-primary btn-sm me-2">
    <i className="bi bi-person-vcard me-1"></i> View My Full Profile
  </Link>
)}
        <Link to="/patient/appointments" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Book appointment
        </Link>
      </div>
      <DashboardModules role={user?.role} />

      {!appointments ? (
        <Loader />
      ) : upcoming.length === 0 ? (
        <div className="ms-card p-4">
          <EmptyState icon="bi-calendar2-heart" title="No upcoming appointments" subtitle="Book your next visit to get started." />
        </div>
      ) : (
        <div className="row g-3">
          {upcoming.map((a) => (
            <div className="col-md-6 col-lg-4" key={a.id}>
              <div className="ms-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="fw-semibold">{a.doctor}</span>
                  <Badge status={a.status} />
                </div>
                <div className="text-muted small mb-1"><i className="bi bi-calendar3 me-1"></i>{formatDate(a.date)}</div>
                <div className="text-muted small mb-1"><i className="bi bi-clock me-1"></i>{formatTime(a.time)}</div>
                <div className="text-muted small"><i className="bi bi-clipboard2-pulse me-1"></i>{a.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
