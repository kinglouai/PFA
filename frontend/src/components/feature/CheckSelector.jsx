/**
 * CheckSelector — list of toggleable CI checks.
 * Shows each check as a card with label, description, and Toggle switch.
 */
import { useState, useEffect } from 'react'
import { CHECK_OPTIONS } from '../../utils/constants.js'
import Toggle from '../ui/Toggle.jsx'
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
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="space-y-3">
        {CHECK_OPTIONS.map((check) => (
          <div
            key={check.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer
              ${selectedChecks.includes(check.id)
                ? 'bg-indigo-500/5 border-indigo-500/30 shadow-sm shadow-indigo-500/5'
                : 'bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }`}
            onClick={() => toggleCheck(check.id)}
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{check.icon}</span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {check.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {check.description}
                </p>
              </div>
            </div>

            <Toggle
              id={`toggle-${check.id}`}
              checked={selectedChecks.includes(check.id)}
              onChange={() => toggleCheck(check.id)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          id="generate-pipeline-btn"
          onClick={() => onGenerate(selectedChecks)}
          loading={loading}
          disabled={loading || selectedChecks.length === 0}
          className="w-full"
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
