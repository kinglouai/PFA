import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Generate a CI/CD pipeline from a project profile.
 * @param {object} profile - Full ProjectProfile
 * @returns {Promise<object>} GeneratedPipeline data
 */
export async function generatePipeline(profile) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/generate`, profile)
  return response.data
}
