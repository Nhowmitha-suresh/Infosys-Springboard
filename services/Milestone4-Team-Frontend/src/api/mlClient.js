import axios from 'axios'

/**
 * Axios instance for the Medisphere ML microservice (ml-service/, Flask).
 *
 * This is a SEPARATE service from the main Java API (axiosClient.js ->
 * backend/, port 8080) — it owns model_versions / ml_predictions /
 * shap_explanations / ml_patient_data and is not behind Spring Security.
 * Default target matches ml-service/app.py (http://127.0.0.1:5000).
 * Override with VITE_ML_API_URL in a .env file if it runs elsewhere.
 */
const baseURL = import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:5000'

const mlClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// The ML service doesn't currently verify this token, but sending it
// keeps this client consistent with axiosClient.js and costs nothing —
// it's a no-op today and free security-hardening headroom later.
mlClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

mlClient.interceptors.response.use(
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

export default mlClient
