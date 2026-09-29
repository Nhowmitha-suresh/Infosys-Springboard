import axiosClient from './axiosClient'
import { mockAppointments } from '../data/mockData'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'
let localAppointments = [...mockAppointments]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Expected Spring Boot contract:
 *   GET    /api/appointments             -> Appointment[]
 *   POST   /api/appointments             -> Appointment
 *   PUT    /api/appointments/{id}        -> Appointment
 *   PATCH  /api/appointments/{id}/status -> Appointment   { status }
 *   DELETE /api/appointments/{id}        -> 204
 */
export async function getAppointments() {
  if (USE_MOCK) {
    await delay()
    return [...localAppointments]
  }
  const { data } = await axiosClient.get('/appointments')
  return data
}

export async function createAppointment(payload) {
  if (USE_MOCK) {
    await delay()
    const newAppt = { id: Date.now(), status: 'Pending', ...payload }
    localAppointments = [newAppt, ...localAppointments]
    return newAppt
  }
  const { data } = await axiosClient.post('/appointments', payload)
  return data
}

export async function updateAppointment(id, payload) {
  if (USE_MOCK) {
    await delay()
    localAppointments = localAppointments.map((a) => (a.id === Number(id) ? { ...a, ...payload } : a))
    return localAppointments.find((a) => a.id === Number(id))
  }
  const { data } = await axiosClient.put(`/appointments/${id}`, payload)
  return data
}

export async function updateAppointmentStatus(id, status) {
  if (USE_MOCK) {
    await delay(200)
    localAppointments = localAppointments.map((a) => (a.id === Number(id) ? { ...a, status } : a))
    return localAppointments.find((a) => a.id === Number(id))
  }
  const { data } = await axiosClient.patch(`/appointments/${id}/status`, { status })
  return data
}

export async function deleteAppointment(id) {
  if (USE_MOCK) {
    await delay()
    localAppointments = localAppointments.filter((a) => a.id !== Number(id))
    return true
  }
  await axiosClient.delete(`/appointments/${id}`)
  return true
}
