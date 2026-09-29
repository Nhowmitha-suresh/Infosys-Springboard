import axios from 'axios'

/**
 * Axios instance for the Medisphere monitoring-service (Milestone 3:
 * clinical rule engine + mobile notifications, Node/Express).
 *
 * This is a SEPARATE service from the main Java API (axiosClient.js) and
 * the Flask ML service (mlClient.js) -- same pattern as mlClient.js.
 * Default target matches monitoring-service/server.js (http://127.0.0.1:4000).
 * Override with VITE_MONITORING_API_URL in a .env file if it runs elsewhere
 * (e.g. "/monitoring" for the same-origin nginx-proxied production build).
 */
const baseURL = import.meta.env.VITE_MONITORING_API_URL || 'http://127.0.0.1:4000'

const monitoringClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// The monitoring-service doesn't currently verify this token, but sending
// it keeps this client consistent with axiosClient.js / mlClient.js.
monitoringClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

monitoringClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      (error?.response?.status ? `Request failed with status code ${error.response.status}` : 'Network error')
    error.displayMessage = message
    return Promise.reject(error)
  }
)

export const monitoringBaseURL = baseURL

export default monitoringClient
