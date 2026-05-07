import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Detect the tech stack of a GitHub repository.
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<object>} DetectedStack data
 */
export async function detectStack(repoUrl) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/detect`, {
    repo_url: repoUrl,
  })
  return response.data
}
