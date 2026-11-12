import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiLogin, apiSignup, apiGetMe } from '../api/auth.js'
import { TOKEN_KEY } from '../api/client.js'

const AuthContext = createContext(null)

/**
 * Returns initials (up to 2 chars) from a display name string.
 * e.g. "Praveen C" → "PC", "alice" → "AL"
 */
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)   // true while /auth/me check is in flight

  // ── Bootstrap: check token validity on app load ─────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }
    apiGetMe()
      .then((data) => {
        // Backend may return { user } or the user object directly
        const resolvedUser = data?.user ?? data
        setUser(resolvedUser)
        setToken(storedToken)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (name, password) => {
    const data = await apiLogin({ name, password })
    const resolvedUser = data?.user ?? data
    const resolvedToken = data?.token ?? data?.access_token
    localStorage.setItem(TOKEN_KEY, resolvedToken)
    setToken(resolvedToken)
    setUser(resolvedUser)
    return data
  }, [])

  // ── signup ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (name, password) => {
    const data = await apiSignup({ name, password })
    const resolvedUser = data?.user ?? data
    const resolvedToken = data?.token ?? data?.access_token
    localStorage.setItem(TOKEN_KEY, resolvedToken)
    setToken(resolvedToken)
    setUser(resolvedUser)
    return data
  }, [])

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

