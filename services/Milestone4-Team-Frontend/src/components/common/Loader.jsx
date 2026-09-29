import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2.2rem', height: '2.2rem' }}>
        <span className="visually-hidden">Loading</span>
      </div>
      <small>{label}</small>
    </div>
  )
}
