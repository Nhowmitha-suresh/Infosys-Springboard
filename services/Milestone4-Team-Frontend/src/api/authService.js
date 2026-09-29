import axiosClient from './axiosClient'
import { mockUsers } from '../data/mockData'

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Expected Spring Boot contract:
 *   POST /api/auth/login   { email, password }        -> { token, user }
 *   POST /api/auth/register { name, email, password, role } -> { token, user }
 *   GET  /api/auth/me      (Bearer token)              -> user
 */
export async function login(email, password) {
  if (USE_MOCK) {
    await delay()
    const user = mockUsers.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const token = `mock-jwt-${user.id}`
    const { password: _pw, ...safeUser } = user
    return { token, user: safeUser }
  }
  const { data } = await axiosClient.post('/auth/login', { email, password })
  return data
}

export async function register(payload) {
  if (USE_MOCK) {
    await delay()
    const newUser = { id: Date.now(), ...payload }
    const token = `mock-jwt-${newUser.id}`
    const { password: _pw, ...safeUser } = newUser
    return { token, user: safeUser }
  }
  const { data } = await axiosClient.post('/auth/register', payload)
  return data
}

export async function fetchCurrentUser() {
  if (USE_MOCK) {
    await delay(150)
    const raw = localStorage.getItem('ms_user')
    return raw ? JSON.parse(raw) : null
  }
  const { data } = await axiosClient.get('/auth/me')
  return data
}
