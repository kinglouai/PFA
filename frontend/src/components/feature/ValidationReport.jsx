/**
 * ValidationReport — displays validation errors and warnings.
 * Groups results by level with color-coded indicators.
 */

export default function ValidationReport({ validation }) {
  if (!validation) return null

  const { valid, errors = [], warnings = [] } = validation
  const totalIssues = errors.length + warnings.length

  // All clear state — no errors or warnings
  if (valid && totalIssues === 0) {
    return (
      <div className="w-full p-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-semibold text-green-400">Your pipeline looks great! 🎉</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              No errors or warnings found — your workflow is ready to ship.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <svg className="w-4.5 h-4.5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Validation Report
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Issues list */}
      <div className="divide-y divide-[var(--color-border)]">
        {/* Errors */}
        {errors.map((err, idx) => (
          <div
            key={`error-${idx}`}
            className="flex items-start gap-3 px-5 py-3 hover:bg-red-500/5 transition-colors duration-150"
          >
            <div className="mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {err.rule_id}
                </span>
                <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">
                  Error
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {err.message}
              </p>
            </div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((warn, idx) => (
          <div
            key={`warning-${idx}`}
            className="flex items-start gap-3 px-5 py-3 hover:bg-amber-500/5 transition-colors duration-150"
          >
            <div className="mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {warn.rule_id}
                </span>
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                  Warning
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {warn.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer summary */}
      {valid && warnings.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30">
          <p className="text-xs text-[var(--color-text-secondary)]">
            ✓ Workflow is valid — warnings are suggestions for improvement.
          </p>
        </div>
      )}
    </div>
  )
}
