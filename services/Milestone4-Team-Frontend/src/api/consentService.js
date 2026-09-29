// src/api/consentService.js
// ---------------------------------------------------------------------
// REAL BACKEND CONTRACT (Phase 2):
//   GET   /api/patients/{id}/consents                -> Consent[]
//   PATCH /api/patients/{id}/consents/{consentId}     { granted } -> Consent
//   GET   /api/patients/{id}/consents/audit-log       -> AuditEntry[]
//
//   POST  /api/consent/verify
//     Request:  { patientId, patientName, consentType, consentGiven,
//                 consentDate, expiryDate }
//     Response: { status: "SUCCESS"|"ERROR", message, errors: [] }
//
// Every consent change must be written to an immutable audit trail
// (who changed what, and when) — this is a standard requirement for
// healthcare data compliance (HIPAA / India's DPDP Act).
// ---------------------------------------------------------------------

import axiosClient from './axiosClient'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'

export const CONSENT_TYPES = [
  { value: 'TREATMENT', label: 'Treatment' },
  { value: 'DATA_SHARING', label: 'Data Sharing (Insurance/Third-party)' },
  { value: 'RESEARCH', label: 'Research (Anonymized)' },
  { value: 'TELEMEDICINE_RECORDING', label: 'Telemedicine Recording' },
  { value: 'REMINDERS', label: 'SMS/Email Reminders' },
]

const seedConsents = [
  { id: 'c1', label: 'Share records with treating doctor', description: 'Allows your doctor to view your full medical history during consultations.', granted: true, required: true },
  { id: 'c2', label: 'Share data with insurance provider', description: 'Allows billing and insurance claims to access relevant treatment records.', granted: true, required: false },
  { id: 'c3', label: 'Use of data for research (anonymized)', description: 'Your anonymized data may be used in medical research studies.', granted: false, required: false },
  { id: 'c4', label: 'Telemedicine consultation recording', description: 'Allows recording of video consultations for quality and reference.', granted: false, required: false },
  { id: 'c5', label: 'SMS / email health reminders', description: 'Allows the platform to send appointment and medication reminders.', granted: true, required: false },
]

let consentState = seedConsents.map(c => ({ ...c }))

let auditLog = [
  { id: 'a1', action: 'Granted', consent: 'Share records with treating doctor', by: 'Priya Sharma', ts: '2026-07-10 09:14' },
  { id: 'a2', action: 'Granted', consent: 'Share data with insurance provider', by: 'Priya Sharma', ts: '2026-07-10 09:15' },
  { id: 'a3', action: 'Revoked', consent: 'Telemedicine consultation recording', by: 'Priya Sharma', ts: '2026-07-15 18:02' },
  { id: 'a4', action: 'Granted', consent: 'SMS / email health reminders', by: 'Priya Sharma', ts: '2026-07-16 11:40' },
]

export async function getConsents(patientId) {
  if (USE_MOCK) {
    return Promise.resolve(consentState)
  }
  const { data } = await axiosClient.get(`/patients/${patientId}/consents`)
  return data
}

export async function updateConsent(patientId, consentId, granted) {
  if (USE_MOCK) {
    const target = consentState.find(c => c.id === consentId)
    consentState = consentState.map(c => (c.id === consentId ? { ...c, granted } : c))
    if (target) {
      auditLog = [
        {
          id: `a${auditLog.length + 1}`,
          action: granted ? 'Granted' : 'Revoked',
          consent: target.label,
          by: 'Priya Sharma',
          ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        ...auditLog,
      ]
    }
    return Promise.resolve(consentState.find(c => c.id === consentId))
  }
  const { data } = await axiosClient.patch(`/patients/${patientId}/consents/${consentId}`, { granted })
  return data
}

export async function getAuditLog(patientId) {
  if (USE_MOCK) {
    return Promise.resolve(auditLog)
  }
  const { data } = await axiosClient.get(`/patients/${patientId}/consents/audit-log`)
  return data
}

/**
 * Simulates POST /api/consent/verify — validates a consent record the
 * same way a real backend would (required fields, sane values), and logs
 * a verified entry into the audit trail on success.
 */
export async function verifyConsent(payload) {
  if (!USE_MOCK) {
    const { data } = await axiosClient.post('/consent/verify', payload)
    return data
  }

  const errors = []
  if (!payload.patientId?.trim()) errors.push('patientId is required')
  if (!payload.patientName?.trim()) errors.push('patientName is required')
  if (!payload.consentType) errors.push('consentType is required')
  if (!payload.consentDate) errors.push('consentDate is required')
  if (payload.consentGiven && payload.expiryDate && payload.expiryDate < payload.consentDate) {
    errors.push('expiryDate cannot be before consentDate')
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      if (errors.length > 0) {
        resolve({ status: 'ERROR', message: 'Consent verification failed', errors })
        return
      }

      auditLog = [
        {
          id: `a${auditLog.length + 1}`,
          action: payload.consentGiven ? 'Granted' : 'Revoked',
          consent: `${CONSENT_TYPES.find(t => t.value === payload.consentType)?.label || payload.consentType} (${payload.patientId})`,
          by: payload.patientName,
          ts: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        ...auditLog,
      ]

      resolve({ status: 'SUCCESS', message: 'Patient consent verified successfully', errors: [] })
    }, 500) // simulated network latency
  })
}
