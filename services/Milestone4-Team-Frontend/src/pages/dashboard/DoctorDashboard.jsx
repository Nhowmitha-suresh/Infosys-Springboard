import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../../api/dashboardService'
import AppointmentTable from '../../components/appointments/AppointmentTable'
import Loader from '../../components/common/Loader'
import StatCard from '../../components/common/StatCard'
import DashboardModules from '../../components/dashboard/DashboardModules'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getDashboardSummary('DOCTOR').then(setSummary)
  }, [])

  return (
    <DashboardLayout title="Doctor Dashboard">
      <p className="text-muted mb-4">Good to see you, {user?.name}. Here's your schedule at a glance.</p>
      <DashboardModules role={user?.role} />

      {!summary ? (
        <Loader />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-people-fill" label="Patients under your care" value={summary.totalPatients} tint="#1c9184" />
            </div>
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-calendar2-check-fill" label="Today's appointments" value={summary.todaysAppointments} tint="#c98a2e" />
            </div>
            <div className="col-sm-6 col-lg-4">
              <StatCard icon="bi-hourglass-split" label="Pending confirmations" value={summary.pendingApprovals} tint="#d95c4f" />
            </div>
          </div>

          <div className="ms-card p-3 p-md-4">
            <h6 className="brand-font mb-3">Upcoming appointments</h6>
            <AppointmentTable appointments={summary.recentAppointments} readOnly />
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
