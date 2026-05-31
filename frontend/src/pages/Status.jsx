/**
 * Status page — live pipeline run status display.
 * Polls the workflow run status every 5 seconds via usePollStatus.
 * Shows overall conclusion banner when completed.
 * Shows "No active run found" if run_id is missing from WizardContext.
 * Shows "Run not found" if the API returns 404.
 * Single "View on GitHub" button — no duplicates.
 */
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { usePollStatus } from '../hooks/usePollStatus.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import StatusTracker from '../components/feature/StatusTracker.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import { WIZARD_STEPS } from '../utils/constants.js'

const CONCLUSION_BANNER = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    color: 'text-green-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Pipeline Succeeded',
    message: 'All jobs completed successfully. Your workflow is ready!',
  },
  failure: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    color: 'text-red-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    label: 'Pipeline Failed',
    message: 'One or more jobs failed. Check the logs on GitHub for details.',
  },
  cancelled: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    color: 'text-gray-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    label: 'Pipeline Cancelled',
    message: 'The workflow run was cancelled.',
  },
}

export default function Status() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()
  const { status, loading, error } = usePollStatus(state.runId, state.repoUrl)

  // ── No active run found ──────────────────────────────────────────
  if (!state.runId && !state.prUrl) {
    return (
      <PageWrapper>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 animate-fade-in">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              No Active Run Found
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              There is no active pipeline run to track. Generate a workflow and push it to GitHub first.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-medium transition-colors shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const conclusionBanner = status?.conclusion ? CONCLUSION_BANNER[status.conclusion] : null
  // Determine the single "View on GitHub" URL — prefer the run html_url, fall back to PR url
  const viewOnGitHubUrl = status?.html_url || state.prUrl

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  return (
    <PageWrapper>
      <div className="w-full flex justify-center py-12">
        <div className="w-full max-w-3xl px-8 flex flex-col items-center text-center gap-8">

          {/* Progress bar */}
          <div className="w-full">
            <Stepper steps={WIZARD_STEPS} currentStep={5} />
          </div>

          {/* Header */}
          <div className="animate-fade-in" style={{ marginTop: '20px' }}>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">
              Pipeline Status
            </h2>
            <p className="text-base text-[var(--color-text-secondary)]">
              {state.runId && state.runId !== 'latest' ? (
                <>Monitoring workflow run <span className="text-indigo-400 font-mono">#{state.runId}</span></>
              ) : (
                <>Monitoring workflow run on branch <span className="text-indigo-400 font-mono">ci/add-pipeline</span></>
              )}
            </p>
          </div>

          {/* Status Card */}
          <div className="w-full animate-slide-up">
            {!state.runId && state.prUrl ? (
              /* PR opened but no workflow run detected */
              <div className="rounded-2xl bg-[var(--color-bg-card)] border border-green-500/20 p-10 shadow-lg">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5 text-3xl">
                  🚀
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-3">Pull Request Opened Successfully!</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-md mx-auto leading-relaxed">
                  We successfully created the branch <span className="text-indigo-400 font-mono">ci/add-pipeline</span>,
                  committed the workflow file, and opened a Pull Request.
                </p>
                <p className="text-xs text-[var(--color-text-muted)] italic leading-relaxed">
                  Note: No running pipeline run was detected yet. If your workflow contains triggers for push/PR to main,
                  GitHub Actions will run when the Pull Request is merged or when code is pushed to target branches.
                </p>
              </div>
            ) : error ? (
              /* Error state */
              <div className="rounded-2xl bg-[var(--color-bg-card)] border border-red-500/20 p-10 shadow-lg">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">
                  {error.includes('not found') || error.includes('404') ? 'Run Not Found' : 'Error'}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{error}</p>
                {(error.includes('not found') || error.includes('404')) && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    The workflow run ID may be invalid or the run may have been deleted from GitHub.
                  </p>
                )}
              </div>
            ) : !status ? (
              /* Loading / waiting for run */
              <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-12 shadow-lg">
                <Spinner size="lg" className="mb-6" />
                <p className="text-[var(--color-text-secondary)] font-medium text-base mb-2">
                  {loading ? 'Connecting to GitHub…' : 'Waiting for GitHub Actions to trigger…'}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
                  GitHub takes a few seconds to register and start the workflow run after opening a Pull Request. We are checking for updates...
                </p>
              </div>
            ) : (
              /* Status with jobs */
              <div className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-8 shadow-lg">
                <StatusTracker
                  jobs={status.jobs || []}
                />
                {/* Polling indicator */}
                {status.status !== 'completed' && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Spinner size="xs" />
                    Refreshing every 5 seconds…
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Conclusion Banner — shown at top when completed */}
          {conclusionBanner && (
            <div
              id="conclusion-banner"
              className={`w-full rounded-2xl ${conclusionBanner.bg} border ${conclusionBanner.border} p-6 animate-fade-in`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`flex-shrink-0 ${conclusionBanner.color}`}>
                  {conclusionBanner.icon}
                  <lb> </lb>
                </div>
                <div className="text-left">
                  <h3 className={`text-lg font-semibold ${conclusionBanner.color}`}>
                    {conclusionBanner.label}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {conclusionBanner.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View on GitHub button */}
          {viewOnGitHubUrl && (
            <div className="animate-fade-in">
              <a
                href={viewOnGitHubUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="view-on-github-btn"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-hover)] text-[var(--color-text-primary)] text-base font-semibold transition-colors cursor-pointer border border-[var(--color-border)] shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 animate-fade-in pb-8" style={{ animationDelay: '0.2s' }}>
            <Button
              id="start-over-btn"
              variant="ghost"
              size="lg"
              onClick={handleStartOver}
            >
              ← Start Over
            </Button>
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}


