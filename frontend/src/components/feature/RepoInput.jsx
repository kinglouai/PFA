/**
 * RepoInput — repo URL input + "Analyze" button.
 * Calls detect API and stores result in WizardContext.
 * Shows loading spinner in button and friendly errors for 404/403.
 * Styled with Stitch AI glowing input container.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../context/WizardContext.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { detectStack } from '../../api/detect.js'

export default function RepoInput() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { dispatch } = useWizard()
  const { token } = useAuth()
  const navigate = useNavigate()

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.')
      return
    }

    // Basic URL validation
    if (!repoUrl.match(/github\.com\/[^/]+\/[^/]+/)) {
      setError('Please enter a valid GitHub URL (e.g. https://github.com/user/repo)')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await detectStack(repoUrl.trim(), token)
      if (result.success) {
        dispatch({ type: 'SET_REPO_URL', payload: repoUrl.trim() })
        dispatch({ type: 'SET_DETECTED_STACK', payload: result.data })
        navigate('/wizard')
      } else {
        setError(result.message || 'Detection failed. Please try again.')
      }
    } catch (err) {
      // err.message now contains a human-readable message from the API layer
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  // Determine if this is a "connect GitHub" suggestion
  const isPrivateRepoError = error && (error.includes('private') || error.includes('403'))

  return (
    <div className="w-full animate-slide-up">
      {/* Glowing input container — matches Stitch AI template */}
      <div className="glow-input-container" style={{ display: 'flex', alignItems: 'center', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', backgroundColor: '#161d1f', borderRadius: '11px', overflow: 'hidden' }}>
          <input
            id="repo-url-input"
            type="text"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="https://github.com/user/repo"
            aria-label="GitHub Repository URL"
            style={{
              flexGrow: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#dde3e7',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              letterSpacing: '0.02em',
              fontWeight: 500,
              padding: '16px 24px',
              opacity: loading ? 0.5 : 1,
            }}
          />
          <div style={{ padding: '8px' }}>
            <button
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
              className="gradient-btn"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                letterSpacing: '0.02em',
                fontWeight: 500,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(147, 0, 10, 0.15)',
            border: '1px solid rgba(255, 180, 171, 0.2)',
            color: '#ffb4ab',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
          }}
        >
          <p>{error}</p>
          {isPrivateRepoError && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255, 215, 159, 0.8)' }}>
              💡 Tip: Connect your GitHub account to access private repositories.
            </p>
          )}
        </div>
      )}

      {/* Helper text */}
      <p style={{
        marginTop: '16px',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        color: '#859399',
      }}>
        Paste any public GitHub repository URL to auto-detect the tech stack
      </p>
    </div>
  )
}
