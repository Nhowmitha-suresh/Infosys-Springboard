import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../api/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if a token exists, validate it against GET /api/auth/me
  // so stale/expired sessions are cleared (instead of showing a broken UI).
  useEffect(() => {
    const rawUser = localStorage.getItem('ms_user')
    const token = localStorage.getItem('ms_token')

    async function restoreSession() {
      if (!rawUser || !token) {
        setLoading(false)
        return
      }

      try {
        const freshUser = await authService.fetchCurrentUser()
        if (freshUser) {
          setUser(freshUser)
          localStorage.setItem('ms_user', JSON.stringify(freshUser))
        } else {
          clearSession()
        }
      } catch {
        // Token invalid/expired — clear and return to login.
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function clearSession() {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    setUser(null)
  }

  async function login(email, password) {
    const { token, user: loggedInUser } = await authService.login(email, password)
    localStorage.setItem('ms_token', token)
    localStorage.setItem('ms_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  async function register(payload) {
    const { token, user: newUser } = await authService.register(payload)
    localStorage.setItem('ms_token', token)
    localStorage.setItem('ms_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  const logout = useCallback(() => {
    clearSession()
  }, [])

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
