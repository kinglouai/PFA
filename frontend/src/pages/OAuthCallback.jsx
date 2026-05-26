/**
 * OAuthCallback page — handles GitHub OAuth redirect.
 * Reads ?token= from the URL, stores it via useAuth, then redirects to /result.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { saveToken } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      saveToken(token)
      // Small delay to let state update propagate
      setTimeout(() => {
        navigate('/result', { replace: true })
      }, 500)
    } else {
      setError('No token received from GitHub. Please try again.')
    }
  }, [searchParams, saveToken, navigate])

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {error ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Authentication Failed
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors cursor-pointer border-none"
            >
              Go Home
            </button>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <Spinner size="lg" className="mb-4" />
            <p className="text-[var(--color-text-secondary)]">
              Connecting your GitHub account…
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
