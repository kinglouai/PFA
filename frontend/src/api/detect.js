import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Detect the tech stack of a GitHub repository.
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<object>} DetectedStack data
 */
export async function detectStack(repoUrl, token) {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await axios.post(`${API_BASE_URL}/api/v1/detect`, {
      repo_url: repoUrl,
    }, { headers })
    return response.data
  } catch (err) {
    // Extract human-readable message from ApiResponse
    const status = err.response?.status
    const message = err.response?.data?.message

    if (status === 404) {
      throw new Error(message || 'Repository not found. Please check the URL and make sure the repository exists.')
    }
    if (status === 403) {
      throw new Error(message || 'This repository is private. Connect your GitHub account to access private repositories.')
    }

    throw new Error(message || 'Failed to analyze repository. Please check the URL and try again.')
  }
}
