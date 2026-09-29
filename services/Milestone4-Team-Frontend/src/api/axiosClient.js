import axios from 'axios'

/**
 * Centralized Axios instance for the MediSphere frontend.
 *
 * Base URL is fully environment-driven — no hardcoded localhost.
 *   - Development:  VITE_API_BASE_URL=http://localhost:8080/api  (Vite proxy also works)
 *   - Production:   VITE_API_BASE_URL=https://<your-backend>/api  (set in .env.production / platform)
 *   - Combined build served by Spring Boot: VITE_API_BASE_URL=/api (same origin)
 *
 * JWT is attached to every request, and expired/invalid sessions are
 * handled centrally (cleared + redirected to /login on HTTP 401).
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT issued by the Spring Security / JWT auth endpoint on every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized handling for expired/invalid sessions
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('ms_token')
      localStorage.removeItem('ms_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    // Surface a readable message to the caller (used by Login/Register error banners).
    const message =
      error?.response?.data?.message ||
      error?.message ||
      (error?.response?.status ? `Request failed with status code ${error.response.status}` : 'Network error')
    error.displayMessage = message
    return Promise.reject(error)
  }
)

export default axiosClient
