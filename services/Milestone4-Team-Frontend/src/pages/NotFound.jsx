import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '100vh' }}>
      <i className="bi bi-heart-pulse-fill text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
      <h1 className="brand-font">404</h1>
      <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/login" className="btn btn-primary">Back to sign in</Link>
    </div>
  )
}
