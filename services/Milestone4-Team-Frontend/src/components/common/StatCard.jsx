import React from 'react'

export default function StatCard({ icon, label, value, tint = '#1c9184' }) {
  return (
    <div className="ms-stat-card" style={{ '--tint': tint }}>
      <div className="ms-stat-icon" style={{ background: `${tint}17`, color: tint }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="ms-stat-value">{value}</div>
        <div className="ms-stat-label">{label}</div>
      </div>
    </div>
  )
}
