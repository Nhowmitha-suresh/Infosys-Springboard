import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../../api/dashboardService'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import StatCard from '../../components/common/StatCard'
import DashboardModules from '../../components/dashboard/DashboardModules'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime } from '../../utils/dateUtils'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getDashboardSummary('ADMIN').then(setSummary)
  }, [])

  return (
    <DashboardLayout title="Admin Dashboard">
      <p className="text-muted mb-4">Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening across MediSphere today.</p>
      <DashboardModules role={user?.role} />

      {!summary ? (
        <Loader />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <StatCard icon="bi-people-fill" label="Total patients" value={summary.totalPatients} tint="#1c9184" />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard icon="bi-calendar2-check-fill" label="Today's appointments" value={summary.todaysAppointments} tint="#c98a2e" />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard icon="bi-person-badge-fill" label="Active doctors" value={summary.activeDoctors} tint="#16232b" />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard icon="bi-hourglass-split" label="Pending approvals" value={summary.pendingApprovals} tint="#d95c4f" />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-7">
              <div className="ms-card p-3 p-md-4">
                <h6 className="brand-font mb-3">Recent appointments</h6>
                {summary.recentAppointments.map((a) => (
                  <div key={a.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold small">{a.patient}</div>
                      <div className="text-muted small">{a.doctor} • {formatDate(a.date)} at {formatTime(a.time)}</div>
                    </div>
                    <Badge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="ms-card p-3 p-md-4">
                <h6 className="brand-font mb-3">Recently added patients</h6>
                {summary.recentPatients.map((p) => (
                  <div key={p.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold small">{p.name}</div>
                      <div className="text-muted small">{p.condition}</div>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
