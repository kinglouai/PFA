import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Validate a YAML workflow string.
 * @param {string} yaml - Generated YAML content
 * @returns {Promise<object>} Validation result
 */
export async function validateYaml(yaml) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/validate`, { yaml })
    return response.data
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to validate YAML. Please try again.'
    throw new Error(message)
  }
}
