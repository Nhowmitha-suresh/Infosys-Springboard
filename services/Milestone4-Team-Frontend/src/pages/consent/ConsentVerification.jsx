// src/pages/consent/ConsentVerification.jsx
//
// An admin/receptionist/doctor-facing tool to verify and record a
// patient's consent against the (future) backend endpoint
// POST /api/consent/verify. Pairs with the patient-facing
// ConsentManagement.jsx page — that one is "patient turns their own
// permissions on/off"; this one is "staff verifies/records a consent
// event," with a visible API reference so it's clear what the backend
// contract looks like once it's built.

import React, { useState } from 'react'
import { CONSENT_TYPES, verifyConsent } from '../../api/consentService'

const emptyForm = {
  patientId: '',
  patientName: '',
  consentType: '',
  consentGiven: true,
  consentDate: '',
  expiryDate: '',
}

const exampleRequest = {
  patientId: 'P101',
  patientName: 'John Doe',
  consentType: 'TREATMENT',
  consentGiven: true,
  consentDate: '2026-07-30',
  expiryDate: null,
}

const exampleResponse = {
  status: 'SUCCESS',
  message: 'Patient consent verified successfully',
  errors: [],
}

function CodeBlock({ data }) {
  return (
    <pre
      className="p-3 mb-0 rounded-3"
      style={{
        background: 'var(--teal-950)',
        color: '#d8f0ec',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '0.78rem',
        overflowX: 'auto',
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export default function ConsentVerification() {
  const [form, setForm] = useState(emptyForm)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const res = await verifyConsent(form)
    setResult(res)
    setSubmitting(false)
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="brand-font mb-1">Patient Consent Verification</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
          Record and verify a patient's consent event against the consent service.
        </p>
      </div>

      <div className="row g-4">
        {/* Left: form */}
        <div className="col-lg-7">
          <div className="ms-card p-3 p-md-4">
            <h6 className="brand-font mb-3"><i className="bi bi-pencil-square me-2" />Consent Details</h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Patient ID</label>
                <input
                  className="form-control"
                  placeholder="e.g. P101"
                  value={form.patientId}
                  onChange={(e) => update('patientId', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Patient Full Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={form.patientName}
                  onChange={(e) => update('patientName', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Consent Type</label>
                <select
                  className="form-select"
                  value={form.consentType}
                  onChange={(e) => update('consentType', e.target.value)}
                >
                  <option value="">Select consent type</option>
                  {CONSENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label">Consent Given Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.consentDate}
                    onChange={(e) => update('consentDate', e.target.value)}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Expiry Date (optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.expiryDate}
                    onChange={(e) => update('expiryDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={form.consentGiven}
                  onChange={(e) => update('consentGiven', e.target.checked)}
                  style={{ width: '2.6em', height: '1.4em' }}
                />
                <label className="form-check-label ms-2">Patient has explicitly given consent</label>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                <i className="bi bi-shield-check me-2" />
                {submitting ? 'Verifying…' : 'Verify Consent'}
              </button>
            </form>

            {result && (
              <div
                className={`mt-3 p-3 rounded-3`}
                style={{
                  background: result.status === 'SUCCESS' ? 'var(--green-100)' : 'var(--coral-100)',
                  color: result.status === 'SUCCESS' ? '#12b76a' : 'var(--coral)',
                  fontSize: '0.88rem',
                }}
              >
                <div className="fw-semibold mb-1">
                  <i className={`bi ${result.status === 'SUCCESS' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`} />
                  {result.message}
                </div>
                {result.errors?.length > 0 && (
                  <ul className="mb-0 ps-3">
                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: API reference */}
        <div className="col-lg-5">
          <div className="ms-card p-3 p-md-4">
            <h6 className="brand-font mb-3"><i className="bi bi-info-circle me-2" />API Reference</h6>
            <div className="text-muted mb-1" style={{ fontSize: '0.78rem' }}>Endpoint</div>
            <div className="mb-3 ms-mono-cell" style={{ color: 'var(--teal-600)' }}>POST /api/consent/verify</div>

            <div className="text-muted mb-1" style={{ fontSize: '0.78rem' }}>Example Request</div>
            <div className="mb-3"><CodeBlock data={exampleRequest} /></div>

            <div className="text-muted mb-1" style={{ fontSize: '0.78rem' }}>Success Response</div>
            <CodeBlock data={exampleResponse} />
          </div>
        </div>
      </div>
    </div>
  )
}
