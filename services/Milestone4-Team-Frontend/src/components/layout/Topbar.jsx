import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../utils/roles'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="ms-topbar d-flex align-items-center justify-content-between px-3 px-md-4 py-3">
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-sm btn-light d-md-none" onClick={onToggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
      </div>
      <h4 className="brand-font mb-0 position-absolute start-50 translate-middle-x d-none d-md-block">{title}</h4>
      <h4 className="brand-font mb-0 d-md-none">{title}</h4>
      <div className="d-flex align-items-center gap-3">
        <span className="ms-topbar-role small d-none d-sm-inline">{ROLE_LABELS[user?.role]}</span>
        <div className="dropdown">
          <button
            className="btn d-flex align-items-center gap-2 p-0 border-0 bg-transparent"
            data-bs-toggle="dropdown"
          >
            <span className="ms-avatar">{initials}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li><span className="dropdown-item-text fw-semibold">{user?.name}</span></li>
            <li><span className="dropdown-item-text text-muted small">{user?.email}</span></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
