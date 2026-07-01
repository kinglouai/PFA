/**
 * Status page — Stitch AI styled pipeline run status display.
 * Glass-panel jobs table, terminal log view, success/failure banner,
 * and "View on GitHub" + "Start Over" actions.
 * Polls the workflow run status every 5 seconds via usePollStatus.
 */
import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import { usePollStatus } from '../hooks/usePollStatus.js'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import StatusTracker from '../components/feature/StatusTracker.jsx'
import TerminalOutput from '../components/feature/TerminalOutput.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { WIZARD_STEPS } from '../utils/constants.js'

/**
 * Generate terminal log lines from jobs/steps data.
 */
function buildLogLines(jobs) {
  if (!jobs || jobs.length === 0) return []
  const lines = []

  lines.push({ text: '[pipeline-gen] Initializing CI/CD pipeline run...', type: 'dim' })
  lines.push({ text: '' })

  jobs.forEach((job) => {
    const conclusionLabel = job.conclusion === 'success' ? '✓' : job.conclusion === 'failure' ? '✗' : '⏳'
    const type = job.conclusion === 'success' ? 'info' : job.conclusion === 'failure' ? 'error' : 'dim'
    lines.push({ text: `▸ Job: ${job.name}`, type: 'info' })

    const steps = job.steps && job.steps.length > 0 ? job.steps : []
    steps.forEach((step) => {
      if (step.status === 'completed') {
        if (step.conclusion === 'success') {
          lines.push({ text: `  ${conclusionLabel} ${step.name}`, type: step.name.toLowerCase().includes('test') ? 'success' : undefined })
        } else if (step.conclusion === 'failure') {
          lines.push({ text: `  ✗ ${step.name}`, type: 'error' })
        } else {
          lines.push({ text: `  ○ ${step.name}`, type: 'dim' })
        }
      } else if (step.status === 'in_progress') {
        lines.push({ text: `  ⟳ ${step.name} (running...)`, type: 'info' })
      } else {
        lines.push({ text: `  ○ ${step.name} (queued)`, type: 'dim' })
      }
    })

    lines.push({ text: '' })
  })

  // Summary line
  const passed = jobs.filter(j => j.conclusion === 'success').length
  const failed = jobs.filter(j => j.conclusion === 'failure').length
  const total = jobs.length

  if (jobs.every(j => j.status === 'completed')) {
    lines.push({ text: `Jobs: ${passed} passed, ${failed} failed, ${total} total`, type: passed === total ? 'success' : 'error' })
    if (passed === total) {
      lines.push({ text: 'All jobs completed successfully.', type: 'success' })
    }
  } else {
    lines.push({ text: `Jobs: ${passed} passed, ${total - passed} pending`, type: 'dim' })
  }

  return lines
}

export default function Status() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()
  const { status, loading, error, timedOut } = usePollStatus(state.runId, state.repoUrl)

  // ── No active run found ──────────────────────────────────────────
  if (!state.runId && !state.prUrl) {
    return (
      <PageWrapper>
        <div className="ambient-glow-left"></div>
        <div className="ambient-glow-right"></div>
        <div style={{
          flexGrow: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px',
        }}>
          <div className="glass-panel" style={{
            borderRadius: '12px', padding: '32px', maxWidth: '448px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '9999px',
              backgroundColor: 'rgba(255, 178, 41, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ffb229' }}>warning</span>
            </div>
            <h3 style={{
              fontFamily: 'Geist, Inter, sans-serif', fontSize: '20px',
              fontWeight: 600, color: '#dde3e7', marginBottom: '8px',
            }}>
              No Active Run Found
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px',
              color: '#bbc9cf', marginBottom: '24px', lineHeight: 1.5,
            }}>
              There is no active pipeline run to track. Generate a workflow and push it to GitHub first.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #00d2ff 0%, #6e208c 100%)',
                color: '#003543', fontFamily: 'Inter, sans-serif',
                fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Home
            </Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const viewOnGitHubUrl = status?.html_url || state.prUrl

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  // Determine conclusion for banner
  const conclusion = status?.conclusion
  const conclusionConfig = {
    success: {
      icon: 'task_alt',
      color: '#00d2ff',
      bg: 'rgba(0, 210, 255, 0.05)',
      border: 'rgba(0, 210, 255, 0.2)',
      label: 'Pipeline Succeeded',
      message: 'All jobs completed successfully. Your workflow is ready!',
    },
    failure: {
      icon: 'error',
      color: '#f87171',
      bg: 'rgba(239, 68, 68, 0.05)',
      border: 'rgba(239, 68, 68, 0.2)',
      label: 'Pipeline Failed',
      message: 'One or more jobs failed. Check the logs on GitHub for details.',
    },
    cancelled: {
      icon: 'block',
      color: '#859399',
      bg: 'rgba(133, 147, 153, 0.05)',
      border: 'rgba(133, 147, 153, 0.2)',
      label: 'Pipeline Cancelled',
      message: 'The workflow run was cancelled.',
    },
  }
  const banner = conclusion ? conclusionConfig[conclusion] : null

  return (
    <PageWrapper>
      {/* Ambient glow effects */}
      <div className="ambient-glow-left"></div>
      <div className="ambient-glow-right"></div>

      <main style={{
        flexGrow: 1,
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '1024px',
        margin: '0 auto',
        padding: '120px 24px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Stepper */}
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '48px' }}>
          <Stepper steps={WIZARD_STEPS} currentStep={5} />
        </div>

        {/* Status Hero */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: '48px', lineHeight: 1.1, letterSpacing: '-0.02em',
            fontWeight: 700, color: '#dde3e7', marginBottom: '4px',
          }}>
            Pipeline Status
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '16px',
            lineHeight: 1.6, color: 'rgba(0, 210, 255, 0.8)',
          }}>
            {state.runId && state.runId !== 'latest' ? (
              <>Monitoring workflow run <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                letterSpacing: '0.02em', fontWeight: 500, opacity: 0.8,
              }}>#{state.runId}</span></>
            ) : (
              <>Monitoring workflow run on branch <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                letterSpacing: '0.02em', fontWeight: 500, opacity: 0.8,
              }}>ci/add-pipeline</span></>
            )}
          </p>
        </div>

        {/* Status content */}
        <div style={{ width: '100%', marginBottom: '24px' }}>
          {!state.runId && state.prUrl ? (
            /* PR opened but no workflow run detected */
            <div className="glass-panel" style={{
              borderRadius: '12px', padding: '40px', textAlign: 'center',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '28px', color: '#34d399',
                  fontVariationSettings: "'FILL' 1",
                }}>rocket_launch</span>
              </div>
              <h3 style={{
                fontFamily: 'Geist, Inter, sans-serif', fontSize: '20px',
                fontWeight: 600, color: '#34d399', marginBottom: '12px',
              }}>
                Pull Request Opened Successfully!
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px',
                color: '#bbc9cf', marginBottom: '16px', maxWidth: '448px',
                margin: '0 auto 16px', lineHeight: 1.5,
              }}>
                We successfully created the branch <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                  color: '#00d2ff',
                }}>ci/add-pipeline</span>,
                committed the workflow file, and opened a Pull Request.
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '12px',
                color: '#859399', fontStyle: 'italic', lineHeight: 1.5,
              }}>
                Note: No running pipeline run was detected yet. If your workflow contains triggers for push/PR to main,
                GitHub Actions will run when the Pull Request is merged or when code is pushed to target branches.
              </p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="glass-panel" style={{
              borderRadius: '12px', padding: '40px', textAlign: 'center',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#f87171' }}>error</span>
              </div>
              <h3 style={{
                fontFamily: 'Geist, Inter, sans-serif', fontSize: '20px',
                fontWeight: 600, color: '#f87171', marginBottom: '8px',
              }}>
                {error.includes('not found') || error.includes('404') ? 'Run Not Found' : 'Error'}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px',
                color: '#bbc9cf', marginBottom: '16px', lineHeight: 1.5,
              }}>{error}</p>
              {(error.includes('not found') || error.includes('404')) && (
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#859399',
                }}>
                  The workflow run ID may be invalid or the run may have been deleted from GitHub.
                </p>
              )}
            </div>
          ) : !status ? (
            /* Loading / waiting for run — or timed out */
            <div className="glass-panel" style={{
              borderRadius: '12px', padding: '48px', textAlign: 'center',
            }}>
              {timedOut ? (
                /* Timed out — workflow didn't start */
                <>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 178, 41, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '28px', color: '#ffb229',
                    }}>schedule</span>
                  </div>
                  <h3 style={{
                    fontFamily: 'Geist, Inter, sans-serif', fontSize: '20px',
                    fontWeight: 600, color: '#ffb229', marginBottom: '12px',
                  }}>
                    No Workflow Run Detected
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '14px',
                    color: '#bbc9cf', marginBottom: '16px', maxWidth: '480px',
                    margin: '0 auto 16px', lineHeight: 1.6,
                  }}>
                    The Pull Request was created successfully, but GitHub Actions did not start a workflow run within 60 seconds.
                    This usually means the workflow triggers on <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                      color: '#00d2ff',
                    }}>push to main</span> — the pipeline will run automatically once you <strong>merge the PR</strong>.
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '12px',
                    color: '#859399', fontStyle: 'italic', lineHeight: 1.5,
                    maxWidth: '480px', margin: '0 auto',
                  }}>
                    You can view and merge the Pull Request on GitHub using the button below. After merging, come back and
                    check the Actions tab on your repository to see the pipeline results.
                  </p>
                </>
              ) : (
                /* Still waiting */
                <>
                  <Spinner size="lg" className="mb-6" />
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '16px',
                    color: '#bbc9cf', fontWeight: 500, marginBottom: '8px', marginTop: '24px',
                  }}>
                    {loading ? 'Connecting to GitHub…' : 'Waiting for GitHub Actions to trigger…'}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '14px',
                    color: '#859399', maxWidth: '384px', margin: '0 auto', lineHeight: 1.5,
                  }}>
                    GitHub takes a few seconds to register and start the workflow run after opening a Pull Request. We are checking for updates...
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Status with jobs */
            <>
              <StatusTracker jobs={status.jobs || []} />

              {/* Terminal / Log output */}
              {(status.jobs || []).length > 0 && (
                <div style={{ marginTop: '24px', width: '100%' }}>
                  <TerminalOutput
                    title="Pipeline run output"
                    lines={buildLogLines(status.jobs)}
                  />
                </div>
              )}

              {/* Polling indicator */}
              {status.status !== 'completed' && (
                <div style={{
                  marginTop: '24px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf',
                }}>
                  <Spinner size="xs" />
                  Refreshing every 5 seconds…
                </div>
              )}
            </>
          )}
        </div>

        {/* Conclusion Banner */}
        {banner && (
          <div className="animate-fade-in" style={{
            width: '100%', borderRadius: '12px',
            backgroundColor: banner.bg,
            border: `1px solid ${banner.border}`,
            padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
            marginBottom: '24px',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '28px', color: banner.color,
              fontVariationSettings: "'FILL' 1",
            }}>{banner.icon}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '20px',
                fontWeight: 700, color: banner.color,
              }}>{banner.label}</span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf',
              }}>{banner.message}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '16px', marginTop: '8px',
        }}>
          {viewOnGitHubUrl && (
            <a
              href={viewOnGitHubUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="view-on-github-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 48px', borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#dde3e7',
                fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 700,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 210, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#00d2ff' }}>code_blocks</span>
              View on GitHub
            </a>
          )}

          <button
            id="start-over-btn"
            onClick={handleStartOver}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: 'transparent', border: 'none',
              color: '#bbc9cf', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '14px',
              transition: 'color 0.3s',
              padding: '4px 0',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#00d2ff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#bbc9cf'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_left_alt</span>
            Start Over
          </button>
        </div>
      </main>
    </PageWrapper>
  )
}
