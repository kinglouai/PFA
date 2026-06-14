/**
 * ValidationReport — Stitch AI styled validation card.
 * Renders as a glass-panel with emerald accents for success,
 * amber for warnings, and red for errors.
 */

export default function ValidationReport({ validation, stale = false }) {
  if (!validation) return null

  const { valid, errors = [], warnings = [] } = validation
  const totalIssues = errors.length + warnings.length

  // Stale banner — YAML was edited since last validation
  if (stale) {
    return (
      <div className="glass-panel" style={{
        borderRadius: '12px', padding: '16px', overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
          background: 'linear-gradient(to right, rgba(255,178,41,0.5), rgba(255,186,74,0.5))',
          opacity: 0.5,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9999px',
            backgroundColor: 'rgba(255, 178, 41, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1px solid rgba(255, 178, 41, 0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffb229' }}>warning</span>
          </div>
          <div>
            <h4 style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#ffb229',
            }}>Validation is out of date</h4>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255, 178, 41, 0.8)', marginTop: '2px',
            }}>
              The YAML has been modified. Re-validate to see the most current results.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // All clear state — no errors or warnings
  if (valid && totalIssues === 0) {
    return (
      <div className="glass-panel" style={{
        borderRadius: '12px', padding: '24px', overflow: 'hidden',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
          background: 'linear-gradient(to right, rgba(16,185,129,0.5), rgba(0,210,255,0.5))',
          opacity: 0.5,
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: '#dde3e7',
          }}>Validation Report</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '9999px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#34d399', fontSize: '12px', fontWeight: 500,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
            Verified
          </div>
        </div>

        {/* Success message */}
        <div style={{
          backgroundColor: 'rgba(22, 29, 31, 0.5)',
          borderRadius: '8px', padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9999px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#34d399' }}>check</span>
          </div>
          <div>
            <h3 style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#dde3e7', marginBottom: '4px',
            }}>Pipeline syntax is valid</h3>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#bbc9cf', lineHeight: 1.5, opacity: 0.8,
            }}>
              All environment variables and job dependencies are correctly resolved. Your workflow is ready to ship.
            </p>
          </div>
        </div>

        {/* Metric rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>Structure Check</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#34d399' }}>Passed</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>Credential Mapping</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#34d399' }}>Secured</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 0',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>Errors / Warnings</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#dde3e7' }}>0 / 0</span>
          </div>
        </div>
      </div>
    )
  }

  // Has issues — show errors and warnings
  return (
    <div className="glass-panel" style={{
      borderRadius: '12px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
        background: errors.length > 0
          ? 'linear-gradient(to right, rgba(239,68,68,0.5), rgba(255,178,41,0.5))'
          : 'linear-gradient(to right, rgba(255,178,41,0.5), rgba(0,210,255,0.5))',
        opacity: 0.5,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h2 style={{
          fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: '#dde3e7',
        }}>Validation Report</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {errors.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px', borderRadius: '9999px',
              fontSize: '12px', fontWeight: 500,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171',
            }}>
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px', borderRadius: '9999px',
              fontSize: '12px', fontWeight: 500,
              backgroundColor: 'rgba(255, 178, 41, 0.1)',
              border: '1px solid rgba(255, 178, 41, 0.2)', color: '#ffb229',
            }}>
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Issues list */}
      <div>
        {errors.map((err, idx) => (
          <div
            key={`error-${idx}`}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f87171' }}>error</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{
                  display: 'inline-flex', padding: '2px 6px', borderRadius: '4px',
                  fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>{err.rule_id}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 500, color: '#f87171',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Error</span>
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#bbc9cf', lineHeight: 1.5,
              }}>{err.message}</p>
            </div>
          </div>
        ))}

        {warnings.map((warn, idx) => (
          <div
            key={`warning-${idx}`}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 178, 41, 0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ffb229' }}>warning</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{
                  display: 'inline-flex', padding: '2px 6px', borderRadius: '4px',
                  fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                  backgroundColor: 'rgba(255, 178, 41, 0.1)', color: '#ffb229',
                  border: '1px solid rgba(255, 178, 41, 0.2)',
                }}>{warn.rule_id}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 500, color: '#ffb229',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Warning</span>
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#bbc9cf', lineHeight: 1.5,
              }}>{warn.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer summary */}
      {valid && warnings.length > 0 && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: 'rgba(26, 33, 35, 0.3)',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbc9cf',
          }}>
            ✓ Workflow is valid — warnings are suggestions for improvement.
          </p>
        </div>
      )}
    </div>
  )
}
