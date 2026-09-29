import axiosClient from './axiosClient'

/**
 * Spring Boot contract (ReportController):
 *   GET    /api/reports                      -> Report[]
 *   GET    /api/reports/{id}                  -> Report
 *   GET    /api/reports/patient/{patientId}   -> Report[]
 *   POST   /api/reports/generate              -> Report  { patientId, type }
 *   DELETE /api/reports/{id}                  -> 204
 */
export async function getReports() {
  const { data } = await axiosClient.get('/reports')
  return data
}

export async function getReportsForPatient(patientId) {
  const { data } = await axiosClient.get(`/reports/patient/${patientId}`)
  return data
}

export async function generateReport(patientId, type) {
  const { data } = await axiosClient.post('/reports/generate', { patientId, type })
  return data
}

export async function deleteReport(id) {
  await axiosClient.delete(`/reports/${id}`)
  return true
}
