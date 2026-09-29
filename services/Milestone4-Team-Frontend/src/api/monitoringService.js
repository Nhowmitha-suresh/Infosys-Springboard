import monitoringClient from './monitoringClient'

// -- Clinical rules (clinical_rules) ---------------------------------------

export async function listRules(activeOnly = false) {
  const { data } = await monitoringClient.get('/api/rules', {
    params: activeOnly ? { activeOnly: 'true' } : {},
  })
  return data
}

export async function updateRule(ruleId, patch) {
  const { data } = await monitoringClient.patch(`/api/rules/${ruleId}`, patch)
  return data
}

// -- Monitoring / rule evaluation (rule_executions) -------------------------

/**
 * Runs every active clinical rule against one vitals reading for a demo
 * patient (P001-P003 -- the ml_patient_data set the ML Models pages use).
 * predictionId is optional; the service falls back to that patient's most
 * recent ml_predictions row if omitted.
 */
export async function evaluateVitals({ patient, vitals, history = [], predictionId }) {
  const { data } = await monitoringClient.post('/api/monitoring/evaluate', {
    patient,
    vitals,
    history,
    predictionId,
  })
  return data
}

export async function listExecutions({ patientId, ruleId, limit = 100 } = {}) {
  const { data } = await monitoringClient.get('/api/monitoring/executions', {
    params: { patientId, ruleId, limit },
  })
  return data
}

// -- Notifications ------------------------------------------------------

export async function listNotifications({ patientId, status, limit = 50, offset = 0 } = {}) {
  const { data } = await monitoringClient.get('/api/notifications', {
    params: { patientId, status, limit, offset },
  })
  return data
}

export async function unreadNotificationCount(patientId) {
  const { data } = await monitoringClient.get(`/api/notifications/unread-count/${patientId}`)
  return data
}

export async function markNotificationStatus(notificationId, status) {
  const { data } = await monitoringClient.patch(`/api/notifications/${notificationId}`, { status })
  return data
}
