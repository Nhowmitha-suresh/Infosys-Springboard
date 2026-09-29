import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AppointmentTable from '../../components/appointments/AppointmentTable'
import AppointmentFormModal from '../../components/appointments/AppointmentFormModal'
import Loader from '../../components/common/Loader'
import {
  getAppointments, createAppointment, updateAppointment,
  updateAppointmentStatus, deleteAppointment,
} from '../../api/appointmentService'
import { getPatients } from '../../api/patientService'
import { mockDoctors } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

export default function AppointmentsPage() {
  const { user } = useAuth()
  const role = user?.role

  const [appointments, setAppointments] = useState(null)
  const [patients, setPatients] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingAppt, setEditingAppt] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [apptData, patientData] = await Promise.all([getAppointments(), getPatients()])
    setAppointments(apptData)
    setPatients(patientData)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!appointments) return []
    let list = appointments
    if (role === 'DOCTOR') list = list.filter((a) => a.doctor === user.name)
    if (role === 'PATIENT') list = list.filter((a) => a.patient === user.name)
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter)
    return list
  }, [appointments, statusFilter, role, user])

  function openCreate() {
    setEditingAppt(null)
    setShowForm(true)
  }

  function openEdit(appt) {
    setEditingAppt(appt)
    setShowForm(true)
  }

  async function handleSave(form) {
    setSaving(true)
    try {
      const payload = role === 'PATIENT' ? { ...form, patient: user.name } : form
      if (editingAppt) {
        await updateAppointment(editingAppt.id, payload)
      } else {
        await createAppointment(payload)
      }
      await load()
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(appt, status) {
    await updateAppointmentStatus(appt.id, status)
    await load()
  }

  async function handleDelete(appt) {
    if (!window.confirm('Cancel and remove this appointment?')) return
    await deleteAppointment(appt.id)
    await load()
  }

  const canManage = role === 'ADMIN' || role === 'RECEPTIONIST'
  const canBook = role !== 'DOCTOR'

  return (
    <DashboardLayout title={role === 'PATIENT' ? 'My Appointments' : 'Appointments'}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <select className="form-select" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Cancelled</option>
        </select>
        {canBook && (
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> Book appointment
          </button>
        )}
      </div>

      <div className="ms-card p-2 p-md-3">
        {!appointments ? (
          <Loader />
        ) : (
          <AppointmentTable
            appointments={filtered}
            onEdit={canManage ? openEdit : undefined}
            onDelete={canManage ? handleDelete : undefined}
            onStatusChange={canManage ? handleStatusChange : undefined}
          />
        )}
      </div>

      <AppointmentFormModal
        show={showForm}
        initialData={editingAppt}
        doctors={mockDoctors}
        patients={role === 'PATIENT' ? [] : patients}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        saving={saving}
      />
    </DashboardLayout>
  )
}
