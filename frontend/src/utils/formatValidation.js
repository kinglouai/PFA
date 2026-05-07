/**
 * Format validation results for display.
 */
export function formatValidation(validationData) {
  if (!validationData) return { errors: [], warnings: [], isValid: true }

  return {
    errors: validationData.errors || [],
    warnings: validationData.warnings || [],
    isValid: validationData.valid !== false && (validationData.errors || []).length === 0,
  }
}
