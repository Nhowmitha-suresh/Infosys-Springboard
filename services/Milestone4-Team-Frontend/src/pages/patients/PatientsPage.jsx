import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PatientTable from '../../components/patients/PatientTable'
import PatientFormModal from '../../components/patients/PatientFormModal'
import Loader from '../../components/common/Loader'
import { getPatients, createPatient, updatePatient, deletePatient } from '../../api/patientService'
import { useAuth } from '../../context/AuthContext'

export default function PatientsPage() {
  const { user } = useAuth()
  const isDoctor = user?.role === 'DOCTOR'
  const canDelete = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST'

  const [patients, setPatients] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const data = await getPatients()
    setPatients(data)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!patients) return []
    let list = patients
    if (isDoctor) list = list.filter((p) => p.doctor === user.name)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.condition?.toLowerCase().includes(q))
    }
    return list
  }, [patients, search, isDoctor, user])

  function openCreate() {
    setEditingPatient(null)
    setShowForm(true)
  }

  function openEdit(patient) {
    setEditingPatient(patient)
    setShowForm(true)
  }

  async function handleSave(form) {
    setSaving(true)
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, form)
      } else {
        await createPatient(form)
      }
      await load()
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(patient) {
    if (!window.confirm(`Remove ${patient.name} from records?`)) return
    await deletePatient(patient.id)
    await load()
  }

  return (
    <DashboardLayout title={isDoctor ? 'My Patients' : 'Patients'}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            className="form-control"
            placeholder="Search by name or condition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isDoctor && (
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> Add patient
          </button>
        )}
      </div>

      <div className="ms-card p-2 p-md-3">
        {!patients ? (
          <Loader />
        ) : (
          <PatientTable
            patients={filtered}
            onEdit={openEdit}
            onDelete={canDelete ? handleDelete : undefined}
            readOnly={isDoctor ? false : false}
          />
        )}
      </div>

      <PatientFormModal
        show={showForm}
        initialData={editingPatient}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        saving={saving}
      />
    </DashboardLayout>
  )
}
