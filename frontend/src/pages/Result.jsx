/**
 * Result page — YAML preview + validation report + actions.
 * Reads generated YAML from WizardContext, validates on mount,
 * and provides download, copy, start over, and push to GitHub actions.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { validateYaml } from '../api/validate.js'
import { createPR } from '../api/github.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import YamlPreview from '../components/feature/YamlPreview.jsx'
import ValidationReport from '../components/feature/ValidationReport.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { WIZARD_STEPS } from '../utils/constants.js'

export default function Result() {
  const { state, dispatch } = useWizard()
  const { token, isAuthenticated, getAuthUrl } = useAuth()
  const navigate = useNavigate()

  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(true)
  const [validationError, setValidationError] = useState(null)
  const [pushingPR, setPushingPR] = useState(false)
  const [prError, setPrError] = useState(null)

  // Redirect if no generated YAML (user navigated directly to /result)
  useEffect(() => {
    if (!state.generatedYaml) {
      navigate('/', { replace: true })
    }
  }, [state.generatedYaml, navigate])

  // Run validation on mount
  useEffect(() => {
    if (!state.generatedYaml) return

    let cancelled = false

    async function runValidation() {
      setValidating(true)
      setValidationError(null)
      try {
        const result = await validateYaml(state.generatedYaml)
        if (!cancelled) {
          setValidation(result.data)
        }
      } catch (err) {
        if (!cancelled) {
          // err.message now contains a human-readable message from the API layer
          setValidationError(err.message || 'Failed to validate YAML. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setValidating(false)
        }
      }
    }

    runValidation()

    return () => { cancelled = true }
  }, [state.generatedYaml])

  // Don't render if no YAML (will redirect)
  if (!state.generatedYaml) {
    return null
  }

  const handleDownload = () => {
    const blob = new Blob([state.generatedYaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pipeline.yml'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  const handlePushToGitHub = async () => {
    if (!isAuthenticated) {
      // Redirect to GitHub OAuth flow
      window.location.href = getAuthUrl()
      return
    }

    setPushingPR(true)
    setPrError(null)
    try {
      const result = await createPR(state.repoUrl, state.generatedYaml)
      if (result.success && result.data) {
        dispatch({ type: 'SET_RUN_ID', payload: result.data.run_id || 'latest' })
        dispatch({ type: 'SET_PR_URL', payload: result.data.pr_url })
        navigate('/status')
      }
    } catch (err) {
      // err.message now contains a human-readable message from the API layer
      setPrError(err.message || 'Failed to create PR. Please try again.')
    } finally {
      setPushingPR(false)
    }
  }

  return (
    <PageWrapper>
      <div className="w-full flex justify-center py-8">
        <div className="w-full max-w-4xl px-6 flex flex-col">
          {/* Progress bar — centered, step 4 active */}
          <div className="mb-10">
            <Stepper steps={WIZARD_STEPS} currentStep={4} />
          </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] "style={{ textAlign: 'center', marginTop: '20px'}}>
            Your CI/CD Pipeline
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 grid place-items-center w-full">
            Template used: <span className="text-indigo-400 font-mono">{state.templateUsed}</span>
          </p>
        </div>

        {/* YAML Preview (includes built-in copy button) */}
        <div className="w-full mb-6 animate-slide-up">
          <YamlPreview yaml={state.generatedYaml} />
        </div>

        {/* Validation Report */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' ,marginBottom: '20px'}}>
          {validating ? (
            <div className="w-full ">
              <div className="flex items-center justify-center gap-3">
                <Spinner size="sm" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Running validation checks…
                </span>
              </div>
            </div>
          ) : validationError ? (
            <div className="w-full ">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Validation Failed</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{validationError}</p>
                </div>
              </div>
            </div>
          ) : (
            <ValidationReport validation={validation} />
          )}
        </div>

        {/* PR Error */}
        {prError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in">
            {prError}
          </div>
        )}

        {/* Actions — larger, centered buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full animate-fade-in" style={{ animationDelay: '0.2s', marginBottom: '20px'}}>
          <Button
            id="download-yaml-btn"
            onClick={handleDownload}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download YAML
          </Button>

          <Button
            id="create-pr-btn"
            variant="secondary"
            size="lg"
            onClick={handlePushToGitHub}
            loading={pushingPR}
            disabled={!state.repoUrl}
            className="w-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {isAuthenticated ? 'Push to GitHub' : 'Connect GitHub to Push'}
          </Button>

          <Button
            id="start-over-btn"
            variant="ghost"
            size="lg"
            onClick={handleStartOver}
            className="w-full"
          >
            ← Start Over
          </Button>
        </div>
      </div>
    </div>
  </PageWrapper>
)
}
