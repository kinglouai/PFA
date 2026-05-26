import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_KEY = 'gh_token'

/**
 * Create a pull request with the generated YAML.
 * Uses the GitHub token from localStorage.
 */
export async function createPR(repoUrl, yaml, branchName = 'ci/add-pipeline') {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/github/pr`,
    { repo_url: repoUrl, yaml, branch_name: branchName },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

/**
 * Poll the status of a GitHub Actions workflow run.
 * Requires both the run ID and the repo URL.
 */
export async function pollStatus(runId, repoUrl) {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/github/status/${runId}`,
    {
      params: { repo_url: repoUrl },
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}
