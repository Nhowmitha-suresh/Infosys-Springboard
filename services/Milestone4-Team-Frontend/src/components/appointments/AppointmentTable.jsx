import React from 'react'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'
import { formatDate, formatTime } from '../../utils/dateUtils'

export default function AppointmentTable({ appointments, onEdit, onDelete, onStatusChange, readOnly = false }) {
  if (!appointments.length) {
    return <EmptyState icon="bi-calendar2-x" title="No appointments found" subtitle="Try adjusting your filters." />
  }

  return (
    <div className="table-responsive">
      <table className="table ms-table align-middle mb-0">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Status</th>
            {!readOnly && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td className="fw-semibold">{a.patient}</td>
              <td>{a.doctor}</td>
              <td>{formatDate(a.date)}</td>
              <td>{formatTime(a.time)}</td>
              <td>{a.type}</td>
              <td>
                {onStatusChange && !readOnly ? (
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 130 }}
                    value={a.status}
                    onChange={(e) => onStatusChange(a, e.target.value)}
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Cancelled</option>
                  </select>
                ) : (
                  <Badge status={a.status} />
                )}
              </td>
              {!readOnly && (
                <td className="text-end">
                  {onEdit && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(a)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(a)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
