import React from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'
import { formatDate } from '../../utils/dateUtils'

export default function PatientTable({ patients, onEdit, onDelete, onView, readOnly = false }) {
  const navigate = useNavigate()
  if (!patients.length) {
    return <EmptyState icon="bi-people" title="No patients found" subtitle="Try adjusting your search." />
  }

  return (
    <div className="table-responsive">
      <table className="table ms-table align-middle mb-0">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age / Gender</th>
            <th>Condition</th>
            <th>Doctor</th>
            <th>Last Visit</th>
            <th>Status</th>
            {!readOnly && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} style={{ cursor: onView ? 'pointer' : 'default' }}>
              <td onClick={() => onView && onView(p)}>
                <div className="fw-semibold">{p.name}</div>
                <div className="text-muted small">{p.phone}</div>
              </td>
              <td>{p.age} / {p.gender}</td>
              <td>{p.condition}</td>
              <td>{p.doctor}</td>
              <td>{formatDate(p.lastVisit)}</td>
              <td><Badge status={p.status} /></td>
              {!readOnly && (
                <td className="text-end">
                  <button
      className="btn btn-sm btn-outline-primary me-2"
      title="View full patient profile"
      onClick={() => navigate(`/patients/${p.id}/360`)}
    >
      <i className="bi bi-person-vcard"></i>
    </button>
                  {onEdit && (
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(p)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p)}>
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
