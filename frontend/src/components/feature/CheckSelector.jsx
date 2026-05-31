/**
 * CheckSelector — CI checks displayed as selectable tiles/cards.
 * Clicking a tile highlights/selects it. Centered layout.
 */
import { useState, useEffect } from 'react'
import { CHECK_OPTIONS } from '../../utils/constants.js'
import Button from '../ui/Button.jsx'

export default function CheckSelector({ detectedStack, onGenerate, loading = false }) {
  const [selectedChecks, setSelectedChecks] = useState([])

  // Pre-toggle checks based on detected stack
  useEffect(() => {
    const initial = []

    // Always add test
    initial.push('test')

    // Add lint if linter was detected
    if (detectedStack?.linter) {
      initial.push('lint')
    }

    // Add docker if Dockerfile was detected
    if (detectedStack?.has_docker) {
      initial.push('docker')
    }

    // Add cache by default
    initial.push('cache')

    setSelectedChecks(initial)
  }, [detectedStack])

  const toggleCheck = (checkId) => {
    setSelectedChecks((prev) =>
      prev.includes(checkId)
        ? prev.filter((id) => id !== checkId)
        : [...prev, checkId]
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in text-center">
      {/* Tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CHECK_OPTIONS.map((check) => {
          const selected = selectedChecks.includes(check.id)
          return (
            <button
              key={check.id}
              onClick={() => toggleCheck(check.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-transparent text-center group
                ${selected
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)]/30'
                }`}
            >
              {/* Selected indicator */}
              {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <span className="text-3xl">{check.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${selected ? 'text-indigo-300' : 'text-[var(--color-text-primary)]'}`}>
                  {check.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  {check.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8"style={{ marginTop: '50px', marginBottom: '20px' }}>
        <Button
          id="generate-pipeline-btn"
          onClick={() => onGenerate(selectedChecks)}
          loading={loading}
          disabled={loading || selectedChecks.length === 0}
          className="w-full max-w-md mx-auto"
          size="lg"
        >
          {loading ? 'Generating...' : 'Generate pipeline →'}
        </Button>

        {selectedChecks.length === 0 && (
          <p className="mt-3 text-center text-xs text-amber-400">
            Please select at least one check to generate a pipeline.
          </p>
        )}
      </div>
    </div>
  )
}
