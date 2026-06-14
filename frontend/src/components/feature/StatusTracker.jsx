/**
 * StatusTracker — Stitch AI styled pipeline jobs table.
 * Glass-panel container with expandable job rows and Material Symbol icons.
 */
import { useState } from 'react'

function getJobIcon(status, conclusion) {
  if (status === 'in_progress') return { icon: 'sync', color: '#47d6ff', spin: true }
  if (status === 'completed') {
    if (conclusion === 'success') return { icon: 'check_circle', color: '#00d2ff', spin: false }
    if (conclusion === 'failure') return { icon: 'cancel', color: '#f87171', spin: false }
    if (conclusion === 'cancelled') return { icon: 'block', color: '#859399', spin: false }
    return { icon: 'check_circle', color: '#00d2ff', spin: false }
  }
  return { icon: 'schedule', color: '#ffb229', spin: false }
}

function getStepIcon(status, conclusion) {
  if (status === 'in_progress') return { icon: 'sync', color: 'rgba(71, 214, 255, 0.7)', spin: true }
  if (status === 'completed') {
    if (conclusion === 'success') return { icon: 'check', color: 'rgba(0, 210, 255, 0.7)', spin: false }
    if (conclusion === 'failure') return { icon: 'close', color: '#f87171', spin: false }
    return { icon: 'check', color: 'rgba(0, 210, 255, 0.7)', spin: false }
  }
  return { icon: 'schedule', color: 'rgba(255, 178, 41, 0.5)', spin: false }
}

function getStatusLabel(status, conclusion) {
  if (status === 'in_progress') return { label: 'Running', color: '#47d6ff' }
  if (status === 'completed') {
    if (conclusion === 'success') return { label: 'Passed', color: '#00d2ff' }
    if (conclusion === 'failure') return { label: 'Failed', color: '#f87171' }
    if (conclusion === 'cancelled') return { label: 'Cancelled', color: '#859399' }
    return { label: 'Completed', color: '#00d2ff' }
  }
  return { label: 'Queued', color: '#ffb229' }
}

const DEFAULT_STEPS = [
  'Set up job',
  'Checkout code',
  'Install dependencies',
  'Run tests',
  'Post cleanup',
]

function getStepsForJob(job) {
  if (job.steps && job.steps.length > 0) {
    return job.steps
  }
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


export default function StatusTracker({ jobs = [] }) {
  const [expandedJob, setExpandedJob] = useState(0)

  if (!jobs || jobs.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '24px',
        fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#859399',
      }}>
        No jobs found yet. Waiting for GitHub Actions to start…
      </div>
    )
  }

  return (
    <div className="glass-panel" style={{
      borderRadius: '12px', overflow: 'hidden', width: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
          letterSpacing: '0.08em', fontWeight: 500,
          color: '#bbc9cf', textTransform: 'uppercase',
        }}>
          Pipeline Jobs
        </span>
      </div>

      {/* Job rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {jobs.map((job, idx) => {
          const isExpanded = expandedJob === idx
          const jobIcon = getJobIcon(job.status, job.conclusion)
          const statusLabel = getStatusLabel(job.status, job.conclusion)
          const steps = getStepsForJob(job)

          return (
            <div key={idx}>
              {/* Parent job row */}
              <button
                id={`job-${idx}`}
                onClick={() => setExpandedJob(isExpanded ? -1 : idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer', transition: 'background-color 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px', color: jobIcon.color,
                      fontVariationSettings: "'FILL' 1",
                      animation: jobIcon.spin ? 'spin 1s linear infinite' : 'none',
                    }}
                  >
                    {jobIcon.icon}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '20px',
                    fontWeight: 600, lineHeight: 1.4, color: '#dde3e7',
                  }}>
                    {job.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '14px', color: statusLabel.color,
                  }}>
                    {statusLabel.label}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '20px', color: '#bbc9cf',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Expanded steps */}
              {isExpanded && (
                <div style={{
                  backgroundColor: 'rgba(9, 15, 18, 0.5)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '4px 0',
                }}>
                  {steps.map((step, stepIdx) => {
                    const stepIcon = getStepIcon(step.status, step.conclusion)
                    const stepLabel = getStatusLabel(step.status, step.conclusion)
                    const isHighlighted = step.name === 'Run tests'

                    return (
                      <div
                        key={stepIdx}
                        style={{
                          padding: '6px 48px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background-color 0.2s',
                          ...(isHighlighted ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderLeft: '2px solid #00d2ff',
                          } : {}),
                        }}
                        onMouseEnter={(e) => { if (!isHighlighted) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={(e) => { if (!isHighlighted) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: '18px', color: stepIcon.color,
                              animation: stepIcon.spin ? 'spin 1s linear infinite' : 'none',
                            }}
                          >
                            {stepIcon.icon}
                          </span>
                          <span style={{
                            fontFamily: 'Inter, sans-serif', fontSize: '14px',
                            color: isHighlighted ? '#dde3e7' : '#bbc9cf',
                            fontWeight: isHighlighted ? 500 : 400,
                          }}>
                            {step.name}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '14px',
                          color: isHighlighted ? '#00d2ff' : `${stepLabel.color}cc`,
                        }}>
                          {stepLabel.label}
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
    </div>
  )
}
