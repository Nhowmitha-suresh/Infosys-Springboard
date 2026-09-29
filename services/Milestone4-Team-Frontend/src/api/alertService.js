import axiosClient from './axiosClient'

/**
 * Spring Boot contract (AlertController):
 *   GET    /api/alerts                      -> Alert[]
 *   GET    /api/alerts/unacknowledged        -> Alert[]
 *   GET    /api/alerts/patient/{patientId}   -> Alert[]
 *   POST   /api/alerts                       -> Alert
 *   PATCH  /api/alerts/{id}/acknowledge      -> Alert
 *   DELETE /api/alerts/{id}                  -> 204
 */
export async function getAlerts() {
  const { data } = await axiosClient.get('/alerts')
  return data
}

export async function getUnacknowledgedAlerts() {
  const { data } = await axiosClient.get('/alerts/unacknowledged')
  return data
}

export async function getAlertsForPatient(patientId) {
  const { data } = await axiosClient.get(`/alerts/patient/${patientId}`)
  return data
}

export async function createAlert(payload) {
  const { data } = await axiosClient.post('/alerts', payload)
  return data
}

export async function acknowledgeAlert(id) {
  const { data } = await axiosClient.patch(`/alerts/${id}/acknowledge`)
  return data
}

export async function deleteAlert(id) {
  await axiosClient.delete(`/alerts/${id}`)
  return true
}
