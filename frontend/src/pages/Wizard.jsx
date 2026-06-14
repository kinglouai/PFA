/**
 * Wizard page — multi-step wizard shell.
 * Steps 1-4 managed by WizardContext.
 * Includes Back buttons on every step and "Session lost" recovery on refresh.
 * Styled to match the Stitch AI template aesthetic.
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
import MatrixConfig from '../components/feature/MatrixConfig.jsx'
import { WIZARD_STEPS } from '../utils/constants.js'

const TRIGGER_OPTIONS = [
  { value: 'push', label: 'Push only', desc: 'Trigger on push to main/develop' },
  { value: 'pull_request', label: 'Pull Request only', desc: 'Trigger on PRs to main' },
  { value: 'both', label: 'Both', desc: 'Trigger on push and pull request' },
]

export default function Wizard() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [branchTrigger, setBranchTrigger] = useState('both')
  const [matrixConfig, setMatrixConfig] = useState(null)
  const [selectedChecks, setSelectedChecks] = useState([])

  // ── Session lost: user refreshed mid-wizard ────────────────────────
  if (!state.detectedStack) {
    return (
      <PageWrapper>
        <div className="ambient-glow-left"></div>
        <div className="ambient-glow-right"></div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative', zIndex: 10 }}>
          <div className="glass-panel animate-fade-in" style={{ borderRadius: '12px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255, 178, 41, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ffb229' }}>warning</span>
            </div>
            <h3 style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: '#dde3e7', marginBottom: '8px' }}>
              Session Lost
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: 1.5, color: '#bbc9cf', marginBottom: '24px' }}>
              Your wizard session was interrupted. This can happen if you refresh the page. Please start over to analyze your repository again.
            </p>
            <Link
              to="/"
              onClick={() => dispatch({ type: 'RESET' })}
              className="gradient-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '8px', color: 'white',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              Back to Home
            </Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Step 1: Repo Input Recap ──────────────────────────────────────
  const renderStep1 = () => (
    <div className="animate-fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '480px' }}>
      <div className="glass-panel" style={{ borderRadius: '12px', padding: '32px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf', marginBottom: '12px' }}>Analyzing repository</p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', letterSpacing: '0.02em', fontWeight: 500,
          color: '#00d2ff', wordBreak: 'break-all', marginBottom: '16px',
        }}>
          {state.repoUrl}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <Tag label={state.detectedStack.language || 'unknown'} colorKey={state.detectedStack.language} />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => { dispatch({ type: 'RESET' }); navigate('/') }}
            style={{
              padding: '12px 24px', borderRadius: '8px',
              border: '1px solid rgba(0, 210, 255, 0.3)', backgroundColor: 'transparent',
              color: '#00d2ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 210, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Re-analyze
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
            className="gradient-btn"
            style={{
              padding: '12px 24px', borderRadius: '8px', border: 'none',
              color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            Continue
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Stack Confirmation ────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ width: '100%', maxWidth: '56rem' }}>
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
  const handleGenerate = async () => {
    setGenError(null)
    setGenerating(true)

    const profile = {
      ...state.confirmedProfile,
      checks: selectedChecks,
      branch_trigger: branchTrigger,
      ...(matrixConfig && (matrixConfig.os?.length > 1 || matrixConfig.versions?.length > 0)
        ? { matrix: matrixConfig }
        : {}),
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
    <div style={{ width: '100%', maxWidth: '56rem' }}>
      <CheckSelector
        detectedStack={state.confirmedProfile || state.detectedStack}
        value={selectedChecks}
        onChange={setSelectedChecks}
      />

      {/* Trigger Selection */}
      <div style={{ marginTop: '32px', marginBottom: '16px' }}>
        <label style={{
          display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
          letterSpacing: '0.1em', fontWeight: 500, color: '#859399',
          textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center',
        }}>
          Workflow Trigger
        </label>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {TRIGGER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBranchTrigger(opt.value)}
              title={opt.desc}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.3s ease',
                ...(branchTrigger === opt.value
                  ? {
                      backgroundColor: 'rgba(0, 210, 255, 0.1)',
                      border: '1px solid #00d2ff',
                      color: '#00d2ff',
                      boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
                    }
                  : {
                      backgroundColor: '#1a2123',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#bbc9cf',
                    }
                ),
              }}
              onMouseEnter={(e) => {
                if (branchTrigger !== opt.value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                if (branchTrigger !== opt.value) e.currentTarget.style.backgroundColor = '#1a2123'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Config */}
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <MatrixConfig
          language={(state.confirmedProfile || state.detectedStack)?.language}
          value={matrixConfig}
          onChange={setMatrixConfig}
        />
      </div>

      {genError && (
        <div className="animate-fade-in" style={{
          marginTop: '16px', padding: '12px 16px', borderRadius: '8px',
          backgroundColor: 'rgba(147, 0, 10, 0.15)', border: '1px solid rgba(255, 180, 171, 0.2)', color: '#ffb4ab',
          fontFamily: 'Inter, sans-serif', fontSize: '14px',
        }}>
          {genError}
          <button
            onClick={() => setGenError(null)}
            style={{
              marginLeft: '12px', fontSize: '12px', textDecoration: 'underline',
              cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#ffb4ab',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
            style={{
              padding: '12px 24px', borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'transparent',
              color: '#bbc9cf', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back
          </button>
          
          <button
            id="generate-pipeline-btn"
            onClick={handleGenerate}
            disabled={generating || selectedChecks.length === 0}
            className="btn-primary"
            style={{
              borderRadius: '8px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              border: 'none',
              color: 'white',
              cursor: (generating || selectedChecks.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (generating || selectedChecks.length === 0) ? 0.5 : 1,
            }}
          >
            {generating ? 'Generating...' : 'Generate pipeline'}
            {!generating && (
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            )}
            {generating && (
              <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        </div>

        {selectedChecks.length === 0 && (
          <p style={{
            marginTop: '16px', textAlign: 'center',
            fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#ffb229',
          }}>
            Please select at least one check to generate a pipeline.
          </p>
        )}
      </div>
    </div>
  )

  // ── Step 4: Generating ────────────────────────────────────────────
  const renderStep4 = () => (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '48px 0' }}>
      <Spinner size="lg" className="mb-4" />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#bbc9cf' }}>Generating your pipeline...</p>
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
      {/* Ambient glow effects */}
      <div className="ambient-glow-left"></div>
      <div className="ambient-glow-right"></div>

      <main style={{
        flexGrow: 1,
        paddingTop: '104px',
        paddingBottom: '48px',
        paddingLeft: '16px',
        paddingRight: '16px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Stepper */}
        <div style={{ width: '100%', maxWidth: '56rem', marginBottom: '48px', marginTop: '48px' }}>
          <Stepper steps={WIZARD_STEPS} currentStep={state.currentStep} />
        </div>

        {/* Step title */}
        <h2 style={{
          fontFamily: 'Geist, Inter, sans-serif',
          fontSize: '32px',
          fontWeight: 600,
          lineHeight: 1.2,
          color: '#dde3e7',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          {stepTitles[state.currentStep]}
        </h2>

        {/* Step content */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {renderStep()}
        </div>
      </main>
    </PageWrapper>
  )
}
