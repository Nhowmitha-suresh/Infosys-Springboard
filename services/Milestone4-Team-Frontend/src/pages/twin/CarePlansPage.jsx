// src/pages/twin/CarePlansPage.jsx
import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import CarePlanFormModal from '../../components/careplans/CarePlanFormModal'
import { getCarePlans, createCarePlan, updateCarePlanStatus, deleteCarePlan } from '../../api/carePlanService'
import { getPatients } from '../../api/patientService'
import { useAuth } from '../../context/AuthContext'

export default function CarePlansPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN' || user?.role === 'DOCTOR'

  const [plans, setPlans] = useState(null)
  const [patients, setPatients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [planData, patientData] = await Promise.all([getCarePlans(), getPatients()])
    setPlans(planData)
    setPatients(patientData)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(form) {
    setSaving(true)
    try {
      await createCarePlan({
        patientId: Number(form.patientId),
        title: form.title,
        notes: form.notes,
        followUpDate: form.followUpDate || null,
      })
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(id) {
    await updateCarePlanStatus(id, 'Completed')
    await load()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this care plan?')) return
    await deleteCarePlan(id)
    await load()
  }

  return (
    <DashboardLayout title="Care Plans">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p className="text-muted mb-0">Follow-up plans assigned to patients, with owning doctor and target date.</p>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i> New Plan
          </button>
        )}
      </div>

      <div className="ms-card p-2 p-md-3">
        {!plans ? (
          <Loader />
        ) : plans.length === 0 ? (
          <EmptyState icon="bi-clipboard2-pulse" title="No care plans yet" subtitle="Create one to track a patient's follow-up." />
        ) : (
          <div className="table-responsive">
            <table className="table ms-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Plan</th>
                  <th>Assigned Doctor</th>
                  <th>Follow-up</th>
                  <th>Status</th>
                  {canManage && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {plans.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.patientName}</td>
                    <td>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{c.title}</div>
                      <div className="text-muted small" style={{ maxWidth: 320 }}>{c.notes}</div>
                    </td>
                    <td>{c.assignedDoctor || '—'}</td>
                    <td className="ms-mono-cell">{c.followUpDate || '—'}</td>
                    <td><Badge status={c.status} /></td>
                    {canManage && (
                      <td className="text-end">
                        {c.status === 'Active' && (
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleComplete(c.id)}>
                            Mark complete
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CarePlanFormModal
        show={showForm}
        patients={patients}
        onClose={() => setShowForm(false)}
        onSave={handleCreate}
        saving={saving}
      />
    </DashboardLayout>
  )
}
