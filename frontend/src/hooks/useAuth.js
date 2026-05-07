/**
 * useAuth hook — GitHub OAuth token management.
 * Stub — will be implemented in Week 5.
 */
import { useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('github_token'))
  const [user, setUser] = useState(null)

  const isAuthenticated = !!token

  const login = () => {
    // Stub — will redirect to GitHub OAuth
  }

  const logout = () => {
    localStorage.removeItem('github_token')
    setToken(null)
    setUser(null)
  }

  return { token, user, isAuthenticated, login, logout }
}
