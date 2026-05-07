/**
 * Wizard page — multi-step wizard shell.
 * Steps 1-4 managed by WizardContext.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  // Redirect to home if no detected stack
  useEffect(() => {
    if (!state.detectedStack) {
      navigate('/')
    }
  }, [state.detectedStack, navigate])

  if (!state.detectedStack) return null

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
    <StackSummary
      stack={state.detectedStack}
      onConfirm={(confirmedStack) => {
        dispatch({ type: 'CONFIRM_PROFILE', payload: confirmedStack })
      }}
    />
  )

  // ── Step 3: Check Selection ───────────────────────────────────────
  const handleGenerate = async (selectedChecks) => {
    setGenError(null)
    setGenerating(true)

    const profile = {
      ...state.confirmedProfile,
      checks: selectedChecks,
      branch_trigger: 'push',
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
      setGenError(
        err.response?.data?.message ||
        err.message ||
        'Failed to generate pipeline.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const renderStep3 = () => (
    <div>
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
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Stepper */}
        <div className="mb-10">
          <Stepper steps={WIZARD_STEPS} currentStep={state.currentStep} />
        </div>

        {/* Step title */}
        <h2 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-8">
          {stepTitles[state.currentStep]}
        </h2>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center">
          {renderStep()}
        </div>
      </div>
    </PageWrapper>
  )
}
