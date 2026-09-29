// src/components/careplans/CarePlanFormModal.jsx
import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'

const EMPTY_FORM = { patientId: '', title: '', notes: '', followUpDate: '' }

export default function CarePlanFormModal({ show, patients, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (show) setForm({ ...EMPTY_FORM, patientId: patients[0] ? String(patients[0].id) : '' })
  }, [show, patients])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal show={show} title="New Care Plan" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small text-muted">Patient</label>
            <select className="form-select" name="patientId" value={form.patientId} onChange={handleChange} required>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.condition}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Plan title</label>
            <input
              className="form-control"
              name="title"
              placeholder="e.g. Hypertension management plan"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Notes</label>
            <textarea className="form-control" rows={3} name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Follow-up date</label>
            <input type="date" className="form-control" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Plan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
