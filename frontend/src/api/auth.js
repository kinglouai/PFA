/**
 * Auth API layer — stubs for Week 5.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function getAuthUrl() {
  return `${API_BASE_URL}/api/v1/auth/github`
}

export async function handleCallback() {
  // Stub — will be implemented in Week 5
}

export function logout() {
  localStorage.removeItem('github_token')
}
