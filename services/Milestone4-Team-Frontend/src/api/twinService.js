import axiosClient from './axiosClient'

/**
 * Spring Boot contract (TwinController):
 *   GET  /api/twins                  -> Twin[]
 *   GET  /api/twins/summary          -> { patientsOnboarded, twinsCreated, fhirResourcesSynced, twinCoveragePercent }
 *   GET  /api/twins/{patientId}      -> Twin  (auto-provisions on first call)
 *   POST /api/twins/{patientId}/sync -> Twin
 */
export async function getTwins() {
  const { data } = await axiosClient.get('/twins')
  return data
}

export async function getTwinSummary() {
  const { data } = await axiosClient.get('/twins/summary')
  return data
}

export async function getTwinByPatientId(patientId) {
  const { data } = await axiosClient.get(`/twins/${patientId}`)
  return data
}

export async function syncTwin(patientId) {
  const { data } = await axiosClient.post(`/twins/${patientId}/sync`)
  return data
}
