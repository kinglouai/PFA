/**
 * Stepper — visual step indicator for the wizard.
 * Shows numbered dots with labels, active step highlighted.
 * No business logic inside — pure UI component.
 */
export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-4xl mx-auto px-10">
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : isActive
                      ? 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500 shadow-lg shadow-indigo-500/15'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                  }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors duration-200
                  ${isActive ? 'text-indigo-400' : isCompleted ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-3 rounded-full transition-colors duration-300 mb-7
                  ${isCompleted ? 'bg-indigo-500' : 'bg-[var(--color-border)]'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
