import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await register({ ...form, role: 'PATIENT' })
      navigate(roleHome(user.role))
    } catch (err) {
      setError(err.message || 'Unable to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="row g-0 auth-split">
      <div className="col-lg-5 d-flex align-items-center justify-content-center p-4 order-2 order-lg-1">
        <div style={{ maxWidth: 380, width: '100%' }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-heart-pulse-fill fs-3 text-primary"></i>
            <span className="fs-4 fw-bold brand-font">MediSphere</span>
          </div>
          <h3 className="brand-font mb-1">Create your account</h3>
          <p className="text-muted mb-4">Register as a patient to book appointments and view your records.</p>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-muted">Full name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Email address</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small text-muted">Password</label>
              <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="col-lg-7 auth-visual d-none d-lg-flex align-items-center justify-content-center p-5 order-1 order-lg-2">
        <div style={{ maxWidth: 460, position: 'relative', zIndex: 1 }}>
          <h2 className="brand-font mb-3">Your health, on your terms.</h2>
          <p className="opacity-75 mb-0">
            Book visits, track upcoming appointments and stay connected with your care team —
            all from one place.
          </p>
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
