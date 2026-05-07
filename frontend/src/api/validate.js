import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Validate a YAML workflow string.
 * @param {string} yaml - Generated YAML content
 * @returns {Promise<object>} Validation result
 */
export async function validateYaml(yaml) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/validate`, { yaml })
  return response.data
}
