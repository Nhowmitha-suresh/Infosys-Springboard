import React from 'react'

export default function EmptyState({ icon = 'bi-inbox', title = 'Nothing here yet', subtitle }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`bi ${icon} d-block mb-2`} style={{ fontSize: '2rem' }}></i>
      <div className="fw-semibold">{title}</div>
      {subtitle && <small>{subtitle}</small>}
    </div>
  )
}
