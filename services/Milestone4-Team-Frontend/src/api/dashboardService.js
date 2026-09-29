import axiosClient from './axiosClient'
import { getPatients } from './patientService'
import { getAppointments } from './appointmentService'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'

/**
 * Expected Spring Boot contract:
 *   GET /api/dashboard/summary?role=ADMIN|DOCTOR|PATIENT|RECEPTIONIST -> {
 *     totalPatients, todaysAppointments, activeDoctors, pendingApprovals
 *   }
 */
export async function getDashboardSummary(role) {
  if (USE_MOCK) {
    const [patients, appointments] = await Promise.all([getPatients(), getAppointments()])
    const today = new Date().toISOString().slice(0, 10)
    return {
      totalPatients: patients.length,
      todaysAppointments: appointments.filter((a) => a.date === today || a.date === '2026-07-31').length,
      activeDoctors: 2,
      pendingApprovals: appointments.filter((a) => a.status === 'Pending').length,
      recentAppointments: appointments.slice(0, 5),
      recentPatients: patients.slice(0, 5),
    }
  }
  const { data } = await axiosClient.get('/dashboard/summary', { params: { role } })
  return data
}
