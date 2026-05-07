/**
 * ValidationReport — errors/warnings panel.
 * Stub — will be fully styled in Week 4.
 */
export default function ValidationReport({ validation }) {
  if (!validation) return null

  return (
    <div className="w-full rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4">
      <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
        Validation Report
      </h4>
      <p className="text-sm text-green-400">✓ Validation passed</p>
    </div>
  )
}
