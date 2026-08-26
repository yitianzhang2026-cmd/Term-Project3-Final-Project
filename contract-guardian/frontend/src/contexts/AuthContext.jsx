import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('contract_guardian_token')
    if (!token) {
      setLoading(false)
      return
    }

    authApi
      .profile()
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem('contract_guardian_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (data) => {
    const response = await authApi.login(data)
    localStorage.setItem('contract_guardian_token', response.data.token)
    setUser(response.data.user)
    return response
  }

  const register = async (data) => {
    const response = await authApi.register(data)
    localStorage.setItem('contract_guardian_token', response.data.token)
    setUser(response.data.user)
    return response
  }

  const logout = () => {
    localStorage.removeItem('contract_guardian_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
