import React from 'react'

const STATUS_STYLES = {
  Active: '#12b76a',
  Confirmed: '#12b76a',
  Pending: '#f5a524',
  Cancelled: '#ef4444',
  Discharged: '#8b97ab',
  Completed: '#4c86f5',
  Synced: '#12b76a',
  Syncing: '#f5a524',
  Error: '#ef4444',
  Critical: '#ef4444',
  Warning: '#f5a524',
  Info: '#4c86f5',
  High: '#ef4444',
  Moderate: '#f5a524',
  Low: '#12b76a',
}

export default function Badge({ status }) {
  const color = STATUS_STYLES[status] || '#8a97a0'
  return (
    <span className="ms-badge-status">
      <span className="dot" style={{ background: color }}></span>
      {status}
    </span>
  )
}
