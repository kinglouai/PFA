/**
 * useAuth hook — GitHub OAuth token management.
 * Stores the GitHub token in localStorage under 'gh_token'.
 * Provides login redirect, token state, user avatar, and logout.
 */
import { useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'gh_token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)

  const isAuthenticated = !!token

  // Fetch GitHub user info when token is available
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    let cancelled = false
    setLoadingUser(true)

    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setUser({
            login: data.login,
            avatar_url: data.avatar_url,
            name: data.name || data.login,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Token is invalid — clear it
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false)
      })

    return () => { cancelled = true }
  }, [token])

  /**
   * Redirect user to GitHub OAuth flow via the backend.
   */
  const getAuthUrl = useCallback(() => {
    return `${API_BASE_URL}/api/v1/auth/github`
  }, [])

  /**
   * Store the token received from the OAuth callback.
   */
  const saveToken = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  /**
   * Clear the token and user state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { token, user, isAuthenticated, loadingUser, getAuthUrl, saveToken, logout }
}
