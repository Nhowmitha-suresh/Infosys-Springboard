import axiosClient from './axiosClient'

/**
 * Spring Boot contract (PrecisionCareController) — Milestone 4.
 *
 *   GET   /api/precision-care/summary                       -> KPI aggregate across all plans
 *   GET   /api/precision-care/careplan/{patientId}           -> { plan, patientName, goals }
 *   POST  /api/precision-care/careplan/{patientId}/approve   -> PrecisionCarePlan
 *   POST  /api/precision-care/careplan/{patientId}/send      -> PrecisionCarePlan
 *   GET   /api/precision-care/outcomes/{patientId}           -> { metrics, cvdRiskTrend, milestones }
 *   GET   /api/precision-care/guidelines/{patientId}?status= -> ClinicalGuideline[]
 *   PATCH /api/precision-care/guidelines/{id}/review         -> ClinicalGuideline
 *   GET   /api/precision-care/team/{patientId}               -> CareTeamMember[]
 *   GET   /api/precision-care/activity/{patientId}           -> CollaborationMessage[]
 *   POST  /api/precision-care/activity/{patientId}           -> CollaborationMessage
 *   GET   /api/precision-care/tasks/{patientId}              -> CollaborationTask[]
 *   PATCH /api/precision-care/tasks/{id}/toggle              -> CollaborationTask
 */
export async function getSummary() {
  const { data } = await axiosClient.get('/precision-care/summary')
  return data
}

export async function getCarePlan(patientId) {
  const { data } = await axiosClient.get(`/precision-care/careplan/${patientId}`)
  return data
}

export async function approveCarePlan(patientId) {
  const { data } = await axiosClient.post(`/precision-care/careplan/${patientId}/approve`)
  return data
}

export async function sendCarePlanToPatient(patientId) {
  const { data } = await axiosClient.post(`/precision-care/careplan/${patientId}/send`)
  return data
}

export async function getOutcomes(patientId) {
  const { data } = await axiosClient.get(`/precision-care/outcomes/${patientId}`)
  return data
}

export async function getGuidelines(patientId, status) {
  const { data } = await axiosClient.get(`/precision-care/guidelines/${patientId}`, {
    params: status && status !== 'all' ? { status } : {},
  })
  return data
}

export async function reviewGuideline(id) {
  const { data } = await axiosClient.patch(`/precision-care/guidelines/${id}/review`)
  return data
}

export async function getTeam(patientId) {
  const { data } = await axiosClient.get(`/precision-care/team/${patientId}`)
  return data
}

export async function getActivity(patientId) {
  const { data } = await axiosClient.get(`/precision-care/activity/${patientId}`)
  return data
}

export async function postActivityMessage(patientId, payload) {
  const { data } = await axiosClient.post(`/precision-care/activity/${patientId}`, payload)
  return data
}

export async function getTasks(patientId) {
  const { data } = await axiosClient.get(`/precision-care/tasks/${patientId}`)
  return data
}

export async function toggleTask(id) {
  const { data } = await axiosClient.patch(`/precision-care/tasks/${id}/toggle`)
  return data
}
