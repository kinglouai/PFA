import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_KEY = 'gh_token'

/**
 * Create a pull request with the generated YAML.
 * Uses the GitHub token from localStorage.
 */
export async function createPR(repoUrl, yaml, branchName = 'ci/add-pipeline') {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/github/pr`,
      { repo_url: repoUrl, yaml, branch_name: branchName },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to create pull request. Please try again.'
    throw new Error(message)
  }
}

/**
 * Poll the status of a GitHub Actions workflow run.
 * Requires both the run ID and the repo URL.
 */
export async function pollStatus(runId, repoUrl) {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/github/status/${runId}`,
      {
        params: { repo_url: repoUrl },
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return response.data
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.message

    if (status === 404) {
      throw new Error(message || 'Workflow run not found. The run ID may be invalid.')
    }

    throw new Error(message || 'Failed to fetch workflow status.')
  }
}
