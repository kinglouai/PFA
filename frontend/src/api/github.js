import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Create a pull request with the generated YAML.
 * Stub — will be implemented in Week 5.
 */
export async function createPR(repoUrl, yaml, branchName = 'ci/add-pipeline') {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/github/pr`,
    { repo_url: repoUrl, yaml, branch_name: branchName },
    { headers: { Authorization: `Bearer ${localStorage.getItem('github_token')}` } }
  )
  return response.data
}

/**
 * Poll the status of a GitHub Actions workflow run.
 * Stub — will be implemented in Week 6.
 */
export async function pollStatus(runId) {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/github/status/${runId}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('github_token')}` } }
  )
  return response.data
}
