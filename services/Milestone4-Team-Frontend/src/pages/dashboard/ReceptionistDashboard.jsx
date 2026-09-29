import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../../api/dashboardService'
import AppointmentTable from '../../components/appointments/AppointmentTable'
import Loader from '../../components/common/Loader'
import StatCard from '../../components/common/StatCard'
import DashboardModules from '../../components/dashboard/DashboardModules'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'

export default function ReceptionistDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getDashboardSummary('RECEPTIONIST').then(setSummary)
  }, [])

  return (
    <DashboardLayout title="Front Desk Dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Manage walk-ins, patient registration and today's schedule.</p>
        <div className="d-flex gap-2">
          <Link to="/receptionist/patients" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-person-plus me-1"></i> New patient
          </Link>
          <Link to="/receptionist/appointments" className="btn btn-primary btn-sm">
            <i className="bi bi-calendar-plus me-1"></i> Book appointment
          </Link>
        </div>
      </div>
      <DashboardModules role={user?.role} />

      {!summary ? (
        <Loader />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-people-fill" label="Registered patients" value={summary.totalPatients} tint="#1c9184" />
            </div>
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-calendar2-check-fill" label="Today's appointments" value={summary.todaysAppointments} tint="#c98a2e" />
            </div>
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-hourglass-split" label="Awaiting confirmation" value={summary.pendingApprovals} tint="#d95c4f" />
            </div>
          </div>

          <div className="ms-card p-3 p-md-4">
            <h6 className="brand-font mb-3">Today's schedule</h6>
            <AppointmentTable appointments={summary.recentAppointments} readOnly />
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
