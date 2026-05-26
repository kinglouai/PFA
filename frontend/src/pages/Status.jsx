/**
 * Status page — live pipeline run status display.
 * Polls the workflow run status every 5 seconds via usePollStatus.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { usePollStatus } from '../hooks/usePollStatus.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'

const STATUS_CONFIG = {
  queued: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: '⏳',
    label: 'Queued',
  },
  in_progress: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: '🔄',
    label: 'In Progress',
  },
  completed: {
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: '✅',
    label: 'Completed',
  },
}

const CONCLUSION_CONFIG = {
  success: { color: 'text-green-400', icon: '✅', label: 'Success' },
  failure: { color: 'text-red-400', icon: '❌', label: 'Failed' },
  cancelled: { color: 'text-gray-400', icon: '🚫', label: 'Cancelled' },
}

export default function Status() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()
  const { status, loading, error } = usePollStatus(state.runId, state.repoUrl)

  // Redirect if neither run ID nor PR URL is available
  useEffect(() => {
    if (!state.runId && !state.prUrl) {
      navigate('/', { replace: true })
    }
  }, [state.runId, state.prUrl, navigate])

  if (!state.runId && !state.prUrl) return null

  const statusCfg = status ? STATUS_CONFIG[status.status] || STATUS_CONFIG.queued : null
  const conclusionCfg = status?.conclusion ? CONCLUSION_CONFIG[status.conclusion] : null

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Pipeline Status
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {state.runId && state.runId !== 'latest' ? (
              <>Monitoring workflow run <span className="text-indigo-400 font-mono">#{state.runId}</span></>
            ) : (
              <>Monitoring workflow run on branch <span className="text-indigo-400 font-mono">ci/add-pipeline</span></>
            )}
          </p>
        </div>

        {/* Status Card */}
        <div className="mb-6 animate-slide-up">
          {!state.runId && state.prUrl ? (
            <div className="rounded-xl bg-[var(--color-bg-card)] border border-green-500/20 p-6 text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                🚀
              </div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Pull Request Opened Successfully!</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                We successfully created the branch <span className="text-indigo-400 font-mono">ci/add-pipeline</span>, 
                committed the workflow file, and opened a Pull Request.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <a
                  href={state.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-medium transition-colors shadow-lg shadow-indigo-500/20 border-none cursor-pointer text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Pull Request on GitHub
                </a>
              </div>
              
              <p className="text-xs text-[var(--color-text-secondary)] italic">
                Note: No running pipeline run was detected yet. If your workflow contains triggers for push/PR to main, 
                GitHub Actions will run when the Pull Request is merged or when code is pushed to target branches.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-[var(--color-bg-card)] border border-red-500/20 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-1">Error</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
            </div>
          ) : !status ? (
            <div className="rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-8 text-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-[var(--color-text-secondary)] font-medium">
                {loading ? 'Connecting to GitHub…' : 'Waiting for GitHub Actions to trigger…'}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2 max-w-sm mx-auto">
                GitHub takes a few seconds to register and start the workflow run after opening a Pull Request. We are checking for updates...
              </p>
              {state.prUrl && (
                <div className="mt-6">
                  <a
                    href={state.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-page)] text-sm text-[var(--color-text-primary)] hover:text-indigo-400 hover:border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    View Pull Request on GitHub
                  </a>
                </div>
              )}
            </div>
          ) : status ? (
            <div className={`rounded-xl bg-[var(--color-bg-card)] border ${statusCfg?.border || 'border-[var(--color-border)]'} p-6`}>
              {/* Run Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${statusCfg?.bg} flex items-center justify-center text-lg`}>
                    {status.status === 'in_progress' ? (
                      <Spinner size="sm" />
                    ) : (
                      statusCfg?.icon
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${statusCfg?.color}`}>
                      {statusCfg?.label}
                    </h3>
                    {conclusionCfg && (
                      <p className={`text-xs font-medium ${conclusionCfg.color}`}>
                        {conclusionCfg.icon} {conclusionCfg.label}
                      </p>
                    )}
                  </div>
                </div>

                {status.html_url && (
                  <a
                    href={status.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors"
                  >
                    View on GitHub →
                  </a>
                )}
              </div>

              {/* Jobs List */}
              {status.jobs && status.jobs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
                    Jobs
                  </h4>
                  <div className="space-y-2">
                    {status.jobs.map((job, idx) => {
                      const jobStatusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued
                      const jobConclusionCfg = job.conclusion ? CONCLUSION_CONFIG[job.conclusion] : null

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg ${jobStatusCfg.bg} border ${jobStatusCfg.border}`}
                        >
                          <span className="text-sm text-[var(--color-text-primary)] font-medium">
                            {job.name}
                          </span>
                          <span className={`text-xs font-medium ${jobConclusionCfg ? jobConclusionCfg.color : jobStatusCfg.color}`}>
                            {jobConclusionCfg ? `${jobConclusionCfg.icon} ${jobConclusionCfg.label}` : jobStatusCfg.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Polling indicator */}
              {status.status !== 'completed' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <Spinner size="xs" />
                  Refreshing every 5 seconds…
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button
            id="start-over-btn"
            variant="ghost"
            onClick={handleStartOver}
          >
            ← Start Over
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
