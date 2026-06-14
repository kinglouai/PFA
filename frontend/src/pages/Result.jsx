/**
 * Result page — Two-column Stitch AI layout.
 * Left: YAML code editor (code-glass). Right: Validation report + CTA.
 * Preserves all editing, re-validation, download, copy, and PR push logic.
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { validateYaml } from '../api/validate.js'
import { createPR } from '../api/github.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import YamlPreview from '../components/feature/YamlPreview.jsx'
import ValidationReport from '../components/feature/ValidationReport.jsx'
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

  // ── Editable YAML state ──────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [draftYaml, setDraftYaml] = useState(null)
  const [isStale, setIsStale] = useState(false)

  // Initialize draftYaml from generated YAML
  useEffect(() => {
    if (state.generatedYaml) {
      setDraftYaml(state.generatedYaml)
    }
  }, [state.generatedYaml])

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

  // The YAML content to use for download/PR (draft if editing, otherwise generated)
  const activeYaml = draftYaml ?? state.generatedYaml

  const handleDownload = () => {
    const blob = new Blob([activeYaml], { type: 'text/yaml' })
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

  // ── Edit mode handlers ───────────────────────────────────────────
  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev)
  }

  const handleYamlChange = useCallback((newYaml) => {
    setDraftYaml(newYaml)
    // Mark validation as stale whenever YAML changes
    if (newYaml !== state.generatedYaml) {
      setIsStale(true)
    }
  }, [state.generatedYaml])

  const handleResetToGenerated = () => {
    setDraftYaml(state.generatedYaml)
    setIsStale(false)
  }

  const handleRevalidate = async () => {
    setValidating(true)
    setValidationError(null)
    try {
      const result = await validateYaml(draftYaml)
      setValidation(result.data)
      setIsStale(false)
    } catch (err) {
      setValidationError(err.message || 'Failed to validate YAML. Please try again.')
    } finally {
      setValidating(false)
    }
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
      const result = await createPR(state.repoUrl, activeYaml)
      if (result.success && result.data) {
        dispatch({ type: 'SET_RUN_ID', payload: result.data.run_id || 'latest' })
        dispatch({ type: 'SET_PR_URL', payload: result.data.pr_url })
        navigate('/status')
      }
    } catch (err) {
      setPrError(err.message || 'Failed to create PR. Please try again.')
    } finally {
      setPushingPR(false)
    }
  }

  // Has draft diverged from last saved/validated state?
  const hasUnsavedChanges = isEditing && draftYaml !== state.generatedYaml

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
        gap: '48px',
      }}>
        {/* Stepper */}
        <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
          <Stepper steps={WIZARD_STEPS} currentStep={4} />
        </div>

        {/* Edit controls bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '12px', maxWidth: '1440px', width: '100%',
        }}>
          <button
            id="toggle-edit-yaml-btn"
            onClick={handleToggleEdit}
            style={{
              padding: '6px 16px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.3s ease',
              ...(isEditing
                ? {
                    backgroundColor: 'rgba(255, 178, 41, 0.1)',
                    border: '1px solid rgba(255, 178, 41, 0.3)',
                    color: '#ffb229',
                  }
                : {
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#bbc9cf',
                  }
              ),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {isEditing ? 'visibility' : 'edit'}
            </span>
            {isEditing ? 'View Only' : 'Edit YAML'}
          </button>

          {isEditing && (
            <>
              <button
                id="revalidate-yaml-btn"
                onClick={handleRevalidate}
                disabled={validating || !isStale}
                style={{
                  padding: '6px 16px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                  cursor: validating || !isStale ? 'not-allowed' : 'pointer',
                  opacity: validating || !isStale ? 0.4 : 1,
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(0, 210, 255, 0.1)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  color: '#00d2ff',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync</span>
                {validating ? 'Validating...' : 'Re-validate'}
              </button>
              <button
                id="reset-yaml-btn"
                onClick={handleResetToGenerated}
                disabled={!hasUnsavedChanges}
                style={{
                  padding: '6px 16px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                  cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                  opacity: hasUnsavedChanges ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#bbc9cf',
                }}
              >
                Reset to generated
              </button>
            </>
          )}
        </div>

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="animate-fade-in" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '8px',
            background: 'linear-gradient(to right, rgba(255,178,41,0.1), transparent)',
            border: '1px solid rgba(255, 178, 41, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffb229' }}>edit_note</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#ffb229' }}>
                You have unsaved YAML changes
              </span>
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,178,41,0.7)' }}>
              Re-validate to ensure pipeline integrity before pushing
            </span>
          </div>
        )}

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          width: '100%',
          minHeight: '500px',
        }}>
          {/* Left Column: Code Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <YamlPreview
              yaml={activeYaml}
              editable={isEditing}
              onChange={handleYamlChange}
            />
          </div>

          {/* Right Column: Validation & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Validation Report */}
            {validating ? (
              <div className="glass-panel" style={{
                borderRadius: '12px', padding: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <Spinner size="sm" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>
                  Running validation checks…
                </span>
              </div>
            ) : validationError ? (
              <div className="glass-panel" style={{
                borderRadius: '12px', padding: '24px', overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                  background: 'linear-gradient(to right, rgba(239,68,68,0.5), rgba(255,178,41,0.5))',
                  opacity: 0.5,
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '9999px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f87171' }}>error</span>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#f87171' }}>
                      Validation Failed
                    </h4>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#bbc9cf', marginTop: '4px' }}>
                      {validationError}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ValidationReport validation={validation} stale={isStale} />
            )}

            {/* PR Error */}
            {prError && (
              <div className="animate-fade-in" style={{
                padding: '12px 16px', borderRadius: '8px',
                backgroundColor: 'rgba(147, 0, 10, 0.15)',
                border: '1px solid rgba(255, 180, 171, 0.2)',
                color: '#ffb4ab',
                fontFamily: 'Inter, sans-serif', fontSize: '14px',
              }}>
                {prError}
              </div>
            )}

            {/* Call to Action Card */}
            <div className="glass-panel" style={{
              borderRadius: '12px', padding: '24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: '16px', overflow: 'hidden', position: 'relative',
              marginTop: 'auto',
            }}>
              {/* Rocket icon */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '9999px',
                backgroundColor: 'rgba(110, 32, 140, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(237, 177, 255, 0.2)',
                boxShadow: '0 0 30px rgba(110, 32, 140, 0.3)',
                marginBottom: '8px',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '32px', color: '#edb1ff',
                  fontVariationSettings: "'FILL' 1",
                }}>rocket_launch</span>
              </div>

              <h2 style={{
                fontFamily: 'Geist, Inter, sans-serif', fontSize: '24px',
                fontWeight: 600, lineHeight: 1.2, color: '#dde3e7', marginBottom: '4px',
              }}>
                Ready to Deploy
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px',
                color: '#bbc9cf', maxWidth: '280px', marginBottom: '16px', opacity: 0.8,
              }}>
                Your configuration is optimized. Create a pull request to merge these changes into your repository.
              </p>

              {/* Create Pull Request */}
              <button
                id="create-pr-btn"
                onClick={handlePushToGitHub}
                disabled={pushingPR || !state.repoUrl || isStale}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: '8px',
                  background: 'linear-gradient(to right, #00d2ff, #6e208c)',
                  color: '#003543', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600,
                  cursor: (pushingPR || !state.repoUrl || isStale) ? 'not-allowed' : 'pointer',
                  opacity: (pushingPR || !state.repoUrl || isStale) ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>call_split</span>
                {pushingPR ? 'Creating PR...' : isAuthenticated ? 'Create Pull Request' : 'Connect GitHub to Push'}
                {!pushingPR && (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', marginLeft: 'auto' }}>arrow_forward</span>
                )}
                {pushingPR && (
                  <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', marginLeft: 'auto' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>

              {/* Download */}
              <button
                id="download-yaml-btn"
                onClick={handleDownload}
                style={{
                  width: '100%', padding: '8px 24px', borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#dde3e7',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00d2ff'; e.currentTarget.style.color = '#00d2ff' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#dde3e7' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Download YAML
              </button>

              {/* Start Over */}
              <button
                id="start-over-btn"
                onClick={handleStartOver}
                style={{
                  backgroundColor: 'transparent', border: 'none',
                  color: '#bbc9cf', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                  transition: 'color 0.3s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00d2ff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#bbc9cf'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Start Over
              </button>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  )
}
