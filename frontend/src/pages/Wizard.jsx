/**
 * Wizard page — multi-step wizard shell.
 * Steps 1-4 managed by WizardContext.
 * Includes Back buttons on every step and "Session lost" recovery on refresh.
 */
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { generatePipeline } from '../api/generate.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import Tag from '../components/ui/Tag.jsx'
import StackSummary from '../components/feature/StackSummary.jsx'
import CheckSelector from '../components/feature/CheckSelector.jsx'
import { WIZARD_STEPS } from '../utils/constants.js'

export default function Wizard() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)

  // ── Session lost: user refreshed mid-wizard ────────────────────────
  if (!state.detectedStack) {
    return (
      <PageWrapper>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 animate-fade-in">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Session Lost
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Your wizard session was interrupted. This can happen if you refresh the page. Please start over to analyze your repository again.
            </p>
            <Link
              to="/"
              onClick={() => dispatch({ type: 'RESET' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-medium transition-colors shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Step 1: Repo Input Recap ──────────────────────────────────────
  const renderStep1 = () => (
    <div className="text-center animate-fade-in">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md mx-auto">
        <p className="text-sm text-[var(--color-text-secondary)] mb-3">Analyzing repository</p>
        <p className="text-[var(--color-text-primary)] font-mono text-sm break-all mb-4">
          {state.repoUrl}
        </p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Tag label={state.detectedStack.language || 'unknown'} colorKey={state.detectedStack.language} />
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => { dispatch({ type: 'RESET' }); navigate('/') }}>
            ← Re-analyze
          </Button>
          <Button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}>
            Continue →
          </Button>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Stack Confirmation ────────────────────────────────────
  const renderStep2 = () => (
    <div className="w-full max-w-5xl">
      <StackSummary
        stack={state.detectedStack}
        onConfirm={(confirmedStack) => {
          dispatch({ type: 'CONFIRM_PROFILE', payload: confirmedStack })
        }}
        onBack={() => dispatch({ type: 'SET_STEP', payload: 1 })}
      />
    </div>
  )

  // ── Step 3: Check Selection ───────────────────────────────────────
  const handleGenerate = async (selectedChecks) => {
    setGenError(null)
    setGenerating(true)

    const profile = {
      ...state.confirmedProfile,
      checks: selectedChecks,
      branch_trigger: 'both',
    }

    try {
      const result = await generatePipeline(profile)
      if (result.success) {
        dispatch({ type: 'SET_CHECKS', payload: selectedChecks })
        dispatch({ type: 'SET_GENERATED_YAML', payload: result.data })
        navigate('/result')
      } else {
        setGenError(result.message || 'Generation failed.')
      }
    } catch (err) {
      // err.message now contains a human-readable message from the API layer
      setGenError(err.message || 'Failed to generate pipeline.')
    } finally {
      setGenerating(false)
    }
  }

  const renderStep3 = () => (
    <div className="w-full max-w-lg">
      <CheckSelector
        detectedStack={state.confirmedProfile || state.detectedStack}
        onGenerate={handleGenerate}
        loading={generating}
      />
      {genError && (
        <div className="mt-4 max-w-lg mx-auto px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          {genError}
          <button
            onClick={() => setGenError(null)}
            className="ml-3 text-xs underline cursor-pointer bg-transparent border-none text-red-400"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          ← Back
        </Button>
      </div>
    </div>
  )

  // ── Step 4: Generating ────────────────────────────────────────────
  const renderStep4 = () => (
    <div className="text-center py-12 animate-fade-in">
      <Spinner size="lg" className="mb-4" />
      <p className="text-[var(--color-text-secondary)]">Generating your pipeline...</p>
    </div>
  )

  // ── Step titles ───────────────────────────────────────────────────
  const stepTitles = {
    1: 'Repository Overview',
    2: 'Confirm Your Stack',
    3: 'Select CI Checks',
    4: 'Generating Pipeline',
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  return (
    <PageWrapper>
      <div className="w-full flex justify-center py-8">
        <div className="w-full max-w-5xl px-6 flex flex-col items-center">

          {/* Stepper — full width, centered */}
          <div className="w-full mb-10">
            <Stepper steps={WIZARD_STEPS} currentStep={state.currentStep} />
          </div>

          {/* Step title */}
          <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-8" style={{ marginTop: '20px', marginBottom: '28px' }}>
            {stepTitles[state.currentStep]}
          </h2>

          {/* Step content */}
          <div className="w-full flex flex-col items-center">
            {renderStep()}
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}

