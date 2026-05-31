/**
 * StatusTracker — live run status with step-by-step jobs.
 * Shows each job with expandable individual steps (like GitHub Actions UI).
 * Single "View on GitHub" button — no duplicates.
 */
import { useState } from 'react'

/**
 * SVG Icons — spinner, checkmark, X, and clock (queued).
 */
const SpinnerIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} text-blue-400 animate-spin`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const CheckmarkIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const FailureIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const QueuedIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CancelledIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

function getJobIcon(status, conclusion, className) {
  if (status === 'in_progress') return <SpinnerIcon className={className} />
  if (status === 'completed') {
    if (conclusion === 'success') return <CheckmarkIcon className={className} />
    if (conclusion === 'failure') return <FailureIcon className={className} />
    if (conclusion === 'cancelled') return <CancelledIcon className={className} />
    return <CheckmarkIcon className={className} />
  }
  return <QueuedIcon className={className} />
}

function getJobStyle(status, conclusion) {
  if (status === 'in_progress') {
    return { label: 'Running', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  }
  if (status === 'completed') {
    if (conclusion === 'success') {
      return { label: 'Passed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    }
    if (conclusion === 'failure') {
      return { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    }
    if (conclusion === 'cancelled') {
      return { label: 'Cancelled', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
    }
    return { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
  }
  return { label: 'Queued', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
}

/**
 * Default GitHub Actions steps for a typical CI run.
 * When the API returns individual steps per job, use those instead.
 */
const DEFAULT_STEPS = [
  'Set up job',
  'Checkout code',
  'Install dependencies',
  'Run tests',
  'Post cleanup',
]

function getStepsForJob(job) {
  // If the API provides individual steps, use them.
  if (job.steps && job.steps.length > 0) {
    return job.steps
  }
  // Otherwise generate synthetic steps based on the job status
  if (job.status === 'completed') {
    return DEFAULT_STEPS.map((name) => ({
      name,
      status: 'completed',
      conclusion: job.conclusion || 'success',
    }))
  }
  if (job.status === 'in_progress') {
    return DEFAULT_STEPS.map((name, i) => ({
      name,
      status: i < 2 ? 'completed' : i === 2 ? 'in_progress' : 'queued',
      conclusion: i < 2 ? 'success' : null,
    }))
  }
  return DEFAULT_STEPS.map((name) => ({
    name,
    status: 'queued',
    conclusion: null,
  }))
}


export default function StatusTracker({ jobs = [], htmlUrl = null }) {
  const [expandedJob, setExpandedJob] = useState(0) // First job expanded by default

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-6 text-sm">
        No jobs found yet. Waiting for GitHub Actions to start…
      </div>
    )
  }

  return (
    <div className="w-full text-center">
      <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
        Pipeline Jobs
      </h4>

      {/* Job list */}
      <div className="space-y-4">
        {jobs.map((job, idx) => {
          const style = getJobStyle(job.status, job.conclusion)
          const isExpanded = expandedJob === idx
          const steps = getStepsForJob(job)

          return (
            <div key={idx} className="rounded-xl overflow-hidden border border-[var(--color-border)]">
              {/* Job header — clickable to expand */}
              <button
                id={`job-${idx}`}
                onClick={() => setExpandedJob(isExpanded ? -1 : idx)}
                className={`w-full flex items-center gap-3 px-5 py-4 ${style.bg} transition-all duration-300 cursor-pointer bg-transparent border-none text-left`}
              >
                <div className="flex-shrink-0">
                  {getJobIcon(job.status, job.conclusion, 'w-5 h-5')}
                </div>
                <span className="flex-1 text-sm text-[var(--color-text-primary)] font-semibold truncate">
                  {job.name}
                </span>
                <span className={`text-xs font-medium ${style.color} whitespace-nowrap`}>
                  {style.label}
                </span>
                <svg
                  className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Expanded steps — individual step rows */}
              {isExpanded && (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
                  {steps.map((step, stepIdx) => {
                    const stepStyle = getJobStyle(step.status, step.conclusion)
                    return (
                      <div
                        key={stepIdx}
                        className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)]/50 last:border-b-0"
                      >
                        <div className="flex-shrink-0 w-5 flex items-center justify-center">
                          {getJobIcon(step.status, step.conclusion, 'w-5 h-5')}
                        </div>
                        <span className="flex-1 text-sm text-[var(--color-text-secondary)] text-left">
                          {step.name}
                        </span>
                        <span className={`text-xs font-medium ${stepStyle.color}`}>
                          {stepStyle.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* NO duplicate "View on GitHub" here — the Status page handles it */}
    </div>
  )
}
