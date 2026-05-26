/**
 * Auth API layer — GitHub OAuth helpers.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_KEY = 'gh_token'

/**
 * Get the URL to redirect users to for GitHub OAuth authorization.
 */
export function getAuthUrl() {
  return `${API_BASE_URL}/api/v1/auth/github`
}

/**
 * Clear the stored GitHub token.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}
