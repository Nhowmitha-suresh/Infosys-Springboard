import axiosClient from './axiosClient'

/**
 * Spring Boot contract (CarePlanController):
 *   GET    /api/careplans                      -> CarePlan[]
 *   GET    /api/careplans/{id}                  -> CarePlan
 *   GET    /api/careplans/patient/{patientId}   -> CarePlan[]
 *   POST   /api/careplans                       -> CarePlan
 *   PUT    /api/careplans/{id}                  -> CarePlan
 *   PATCH  /api/careplans/{id}/status           -> CarePlan  { status }
 *   DELETE /api/careplans/{id}                  -> 204
 */
export async function getCarePlans() {
  const { data } = await axiosClient.get('/careplans')
  return data
}

export async function getCarePlansForPatient(patientId) {
  const { data } = await axiosClient.get(`/careplans/patient/${patientId}`)
  return data
}

export async function createCarePlan(payload) {
  const { data } = await axiosClient.post('/careplans', payload)
  return data
}

export async function updateCarePlan(id, payload) {
  const { data } = await axiosClient.put(`/careplans/${id}`, payload)
  return data
}

export async function updateCarePlanStatus(id, status) {
  const { data } = await axiosClient.patch(`/careplans/${id}/status`, { status })
  return data
}

export async function deleteCarePlan(id) {
  await axiosClient.delete(`/careplans/${id}`)
  return true
}
