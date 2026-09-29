import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'

const EMPTY_FORM = { patient: '', doctor: '', date: '', time: '', type: 'Consultation' }

export default function AppointmentFormModal({ show, initialData, doctors = [], patients = [], onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM)
  }, [initialData, show])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal show={show} title={initialData ? 'Edit Appointment' : 'Book Appointment'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small text-muted">Patient</label>
            {patients.length ? (
              <select className="form-select" name="patient" value={form.patient} onChange={handleChange} required>
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input className="form-control" name="patient" value={form.patient} onChange={handleChange} required />
            )}
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Doctor</label>
            {doctors.length ? (
              <select className="form-select" name="doctor" value={form.doctor} onChange={handleChange} required>
                <option value="">Select doctor…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>{d.name} — {d.specialization}</option>
                ))}
              </select>
            ) : (
              <input className="form-control" name="doctor" value={form.doctor} onChange={handleChange} required />
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Date</label>
            <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Time</label>
            <input type="time" className="form-control" name="time" value={form.time} onChange={handleChange} required />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Visit type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleChange}>
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Check-up</option>
              <option>Review</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save appointment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
