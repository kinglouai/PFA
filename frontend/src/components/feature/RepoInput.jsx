/**
 * RepoInput — repo URL input + "Analyze" button.
 * Calls detect API and stores result in WizardContext.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../../context/WizardContext.jsx'
import { detectStack } from '../../api/detect.js'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

export default function RepoInput() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { dispatch } = useWizard()
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
      const result = await detectStack(repoUrl.trim())
      if (result.success) {
        dispatch({ type: 'SET_REPO_URL', payload: repoUrl.trim() })
        dispatch({ type: 'SET_DETECTED_STACK', payload: result.data })
        navigate('/wizard')
      } else {
        setError(result.message || 'Detection failed. Please try again.')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze repository. Please check the URL and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up">
      {/* Input group */}
      <div className="relative">
        <div className="flex gap-3">
          <div className="flex-1" onKeyDown={handleKeyDown}>
            <Input
              id="repo-url-input"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value)
                if (error) setError(null)
              }}
              placeholder="https://github.com/user/repo"
              error={!!error}
              disabled={loading}
            />
          </div>
          <Button
            id="analyze-btn"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading}
            size="md"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
            {!loading && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        Paste any public GitHub repository URL to auto-detect the tech stack
      </p>
    </div>
  )
}
