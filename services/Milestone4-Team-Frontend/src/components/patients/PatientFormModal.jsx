import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'

const EMPTY_FORM = {
  name: '', age: '', gender: 'Female', phone: '', bloodGroup: '',
  condition: '', doctor: '', status: 'Active',
}

export default function PatientFormModal({ show, initialData, onClose, onSave, saving }) {
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
    <Modal show={show} title={initialData ? 'Edit Patient' : 'Add Patient'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label small text-muted">Full name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Age</label>
            <input type="number" min="0" className="form-control" name="age" value={form.age} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Gender</label>
            <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Blood group</label>
            <input className="form-control" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="O+" />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Phone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Condition / reason</label>
            <input className="form-control" name="condition" value={form.condition} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Assigned doctor</label>
            <input className="form-control" name="doctor" value={form.doctor} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option>Active</option>
              <option>Discharged</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save patient'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
