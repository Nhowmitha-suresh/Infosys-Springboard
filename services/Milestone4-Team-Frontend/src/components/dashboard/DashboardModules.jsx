import { Link } from 'react-router-dom'
import { ROLES } from '../../utils/roles'

const MODULES_BY_ROLE = {
  [ROLES.ADMIN]: [
    { to: '/twins', label: 'Twins', icon: 'bi-diagram-3' },
    { to: '/predictions', label: 'Predictions', icon: 'bi-graph-up-arrow' },
    { to: '/alerts', label: 'Alerts', icon: 'bi-bell' },
    { to: '/careplans', label: 'Careplans', icon: 'bi-clipboard2-pulse' },
    { to: '/consent', label: 'Consent Settings', icon: 'bi-shield-check' },
    { to: '/consent/verify', label: 'Consent Verification', icon: 'bi-clipboard2-check' },
    { to: '/ml/models', label: 'ML Models', icon: 'bi-cpu' },
    { to: '/ml/analytics', label: 'ML Analytics', icon: 'bi-bar-chart-line' },
    { to: '/precision-care', label: 'Prediction Care', icon: 'bi-stars' },
  ],
  [ROLES.DOCTOR]: [
    { to: '/twins', label: 'Twins', icon: 'bi-diagram-3' },
    { to: '/predictions', label: 'Predictions', icon: 'bi-graph-up-arrow' },
    { to: '/alerts', label: 'Alerts', icon: 'bi-bell' },
    { to: '/careplans', label: 'Careplans', icon: 'bi-clipboard2-pulse' },
    { to: '/consent', label: 'Consent Settings', icon: 'bi-shield-check' },
    { to: '/consent/verify', label: 'Consent Verification', icon: 'bi-clipboard2-check' },
    { to: '/ml/models', label: 'ML Models', icon: 'bi-cpu' },
    { to: '/ml/analytics', label: 'ML Analytics', icon: 'bi-bar-chart-line' },
    { to: '/precision-care', label: 'Prediction Care', icon: 'bi-stars' },
  ],
  [ROLES.RECEPTIONIST]: [
    { to: '/twins', label: 'Twins', icon: 'bi-diagram-3' },
    { to: '/predictions', label: 'Predictions', icon: 'bi-graph-up-arrow' },
    { to: '/alerts', label: 'Alerts', icon: 'bi-bell' },
    { to: '/careplans', label: 'Careplans', icon: 'bi-clipboard2-pulse' },
    { to: '/consent', label: 'Consent Settings', icon: 'bi-shield-check' },
    { to: '/consent/verify', label: 'Consent Verification', icon: 'bi-clipboard2-check' },
  ],
  [ROLES.PATIENT]: [
    { to: '/consent', label: 'Consent Settings', icon: 'bi-shield-check' },
  ],
}

export default function DashboardModules({ role }) {
  const modules = MODULES_BY_ROLE[role] || []

  return (
    <section className="mb-4" aria-label="Clinical modules">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h6 brand-font mb-0">Clinical modules</h2>
        <span className="text-muted small">Quick access</span>
      </div>
      <div className="row g-2">
        {modules.map((module) => (
          <div className="col-6 col-md-4 col-xl-3" key={module.to}>
            <Link to={module.to} className="ms-card p-3 h-100 d-flex align-items-center gap-2 text-decoration-none">
              <i className={`bi ${module.icon} text-primary`} aria-hidden="true"></i>
              <span className="small fw-semibold text-body">{module.label}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}