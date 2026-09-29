import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      navigate(roleHome(user.role))
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="row g-0 auth-split">
      <div className="col-lg-5 d-flex align-items-center justify-content-center p-4">
        <div style={{ maxWidth: 380, width: '100%' }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-heart-pulse-fill fs-3 text-primary"></i>
            <span className="fs-4 fw-bold brand-font">MediSphere</span>
          </div>
          <h3 className="brand-font mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to manage patients, appointments and care.</p>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-muted">Email address</label>
              <input
                type="email" className="form-control" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@medisphere.com"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Password</label>
              <input
                type="password" className="form-control" value={password}
                onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-3 auth-demo-box">
            <div className="small fw-semibold mb-1">Demo credentials</div>
            <div className="small text-muted">admin@medisphere.com / admin123</div>
            <div className="small text-muted">doctor@medisphere.com / doctor123</div>
            <div className="small text-muted">patient@medisphere.com / patient123</div>
            <div className="small text-muted">reception@medisphere.com / reception123</div>
          </div>

          <p className="text-center text-muted small mt-4 mb-0">
            New patient? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

      <div className="col-lg-7 auth-visual d-none d-lg-flex align-items-center justify-content-center p-5">
        <div style={{ maxWidth: 460, position: 'relative', zIndex: 1 }}>
          <h2 className="brand-font mb-3">Care, coordinated.</h2>
          <p className="opacity-75 mb-4">
            One platform for admins, doctors, receptionists and patients to manage records,
            schedule visits and keep every care team in sync.
          </p>
          <div className="auth-badge-row">
            <div>
              <div className="num">4</div>
              <div className="small opacity-75">Role dashboards</div>
            </div>
            <div>
              <div className="num">24/7</div>
              <div className="small opacity-75">Appointment access</div>
            </div>
          </div>
        </div>
        <div className="pulse-line">
          <svg viewBox="0 0 600 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 45 H210 L232 45 L250 8 L272 82 L292 45 L318 45 L332 26 L346 45 H600"
              stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
