import { mockPatients } from '../data/mockData'
import axiosClient from './axiosClient'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'
let localPatients = [...mockPatients]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Expected Spring Boot contract:
 *   GET    /api/patients            -> Patient[]
 *   GET    /api/patients/{id}       -> Patient
 *   POST   /api/patients            -> Patient
 *   PUT    /api/patients/{id}       -> Patient
 *   DELETE /api/patients/{id}       -> 204
 */
export async function getPatients() {
  if (USE_MOCK) {
    await delay()
    return [...localPatients]
  }
  const { data } = await axiosClient.get('/patients')
  return data
}

export async function getMyPatient() {
  if (USE_MOCK) {
    await delay(150)
    const { mockPatients } = await import('../data/mockData')
    const user = JSON.parse(localStorage.getItem('ms_user') || 'null')
    return mockPatients.find((patient) => patient.name === user?.name) || null
  }
  const { data } = await axiosClient.get('/patients/me')
  return data
}

export async function getPatientById(id) {
  if (USE_MOCK) {
    await delay(200)
    return localPatients.find((p) => p.id === Number(id))
  }
  const { data } = await axiosClient.get(`/patients/${id}`)
  return data
}

export async function createPatient(payload) {
  if (USE_MOCK) {
    await delay()
    const newPatient = { id: Date.now(), status: 'Active', ...payload }
    localPatients = [newPatient, ...localPatients]
    return newPatient
  }
  const { data } = await axiosClient.post('/patients', payload)
  return data
}

export async function updatePatient(id, payload) {
  if (USE_MOCK) {
    await delay()
    localPatients = localPatients.map((p) => (p.id === Number(id) ? { ...p, ...payload } : p))
    return localPatients.find((p) => p.id === Number(id))
  }
  const { data } = await axiosClient.put(`/patients/${id}`, payload)
  return data
}

export async function deletePatient(id) {
  if (USE_MOCK) {
    await delay()
    localPatients = localPatients.filter((p) => p.id !== Number(id))
    return true
  }
  await axiosClient.delete(`/patients/${id}`)
  return true
}

/**
 * Expected Spring Boot contract:
 *   GET /api/patients/{id}/allergies     -> string[]
 *   GET /api/patients/{id}/prescriptions -> Prescription[]
 *   GET /api/patients/{id}/appointments  -> Appointment[]
 */
export async function getPatientAllergies(id) {
  if (USE_MOCK) {
    await delay(150)
    const { mockAllergies } = await import('../data/patient360Data')
    return mockAllergies[Number(id)] || ['None reported']
  }
  const { data } = await axiosClient.get(`/patients/${id}/allergies`)
  return data
}

export async function getPatientPrescriptions(id) {
  if (USE_MOCK) {
    await delay(150)
    const { mockPrescriptions } = await import('../data/patient360Data')
    return mockPrescriptions[Number(id)] || []
  }
  const { data } = await axiosClient.get(`/patients/${id}/prescriptions`)
  return data
}

export async function getPatientAppointments(id) {
  if (USE_MOCK) {
    await delay(150)
    return localAppointmentsForPatient(id)
  }
  const { data } = await axiosClient.get(`/patients/${id}/appointments`)
  return data
}

async function localAppointmentsForPatient(id) {
  const { mockAppointments } = await import('../data/mockData')
  return mockAppointments.filter((a) => a.patientId === Number(id))
}
