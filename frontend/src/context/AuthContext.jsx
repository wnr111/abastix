import { createContext, useCallback, useContext, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = localStorage.getItem('abastix_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('abastix_access', data.accessToken)
      localStorage.setItem('abastix_refresh', data.refreshToken)
      localStorage.setItem('abastix_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // stateless: igual limpiamos en cliente
    }
    localStorage.removeItem('abastix_access')
    localStorage.removeItem('abastix_refresh')
    localStorage.removeItem('abastix_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
