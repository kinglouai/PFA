/**
 * MatrixConfig — Build Matrix Configuration panel.
 * Uses toggle switches for OS selection and fail-fast,
 * and custom-input for runtime versions.
 * Styled to match the Stitch AI template aesthetic.
 */
import { useState } from 'react'

const OS_OPTIONS = [
  { value: 'ubuntu-latest', label: 'Ubuntu (Linux)', icon: 'terminal' },
  { value: 'windows-latest', label: 'Windows', icon: 'window' },
  { value: 'macos-latest', label: 'macOS', icon: 'laptop_mac' },
]

export default function MatrixConfig({ language, onChange, value }) {
  const [versionInput, setVersionInput] = useState('')

  const config = value || {
    os: ['ubuntu-latest'],
    versions: [],
    fail_fast: false,
  }

  const updateConfig = (partial) => {
    const updated = { ...config, ...partial }
    onChange(updated)
  }

  const toggleOS = (osValue) => {
    const current = config.os || []
    const next = current.includes(osValue)
      ? current.filter((o) => o !== osValue)
      : [...current, osValue]
    updateConfig({ os: next.length > 0 ? next : ['ubuntu-latest'] })
  }

  const handleVersionKeyDown = (e) => {
    if (e.key === 'Enter' && versionInput.trim()) {
      e.preventDefault()
      addVersion()
    }
  }

  const addVersion = () => {
    const ver = versionInput.trim()
    if (ver && !(config.versions || []).includes(ver)) {
      updateConfig({ versions: [...(config.versions || []), ver] })
    }
    setVersionInput('')
  }

  const removeVersion = (ver) => {
    updateConfig({ versions: (config.versions || []).filter((v) => v !== ver) })
  }

  return (
    <div className="glass-panel" style={{
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '56rem',
      margin: '0 auto',
      width: '100%',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Section Title */}
      <h2 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        fontWeight: 600,
        lineHeight: 1.4,
        color: '#dde3e7',
        marginBottom: '24px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        Build Matrix Configuration
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

        {/* Left Column: OS Targets */}
        <div>
          <h3 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#bbc9cf',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px',
          }}>
            Target Operating Systems
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {OS_OPTIONS.map((os) => {
              const selected = (config.os || []).includes(os.value)
              return (
                <label
                  key={os.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '20px',
                        color: '#bbc9cf',
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {os.icon}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: 1.6,
                      color: '#dde3e7',
                    }}>
                      {os.label}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle-switch"
                    checked={selected}
                    onChange={() => toggleOS(os.value)}
                  />
                </label>
              )
            })}
          </div>
        </div>

        {/* Right Column: Advanced Options */}
        <div>
          <h3 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#bbc9cf',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '16px',
          }}>
            Advanced Options
          </h3>

          {/* Runtime Versions */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#bbc9cf',
              marginBottom: '4px',
            }}>
              Runtime Versions
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="matrix-version-input"
                type="text"
                className="custom-input"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
                onKeyDown={handleVersionKeyDown}
                placeholder="e.g. 18.x, 20.x"
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                }}
              />
              <button
                onClick={addVersion}
                disabled={!versionInput.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  backgroundColor: 'rgba(0, 210, 255, 0.1)',
                  color: '#00d2ff',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: versionInput.trim() ? 'pointer' : 'not-allowed',
                  opacity: versionInput.trim() ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Add
              </button>
            </div>

            {/* Version tags */}
            {(config.versions || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {config.versions.map((ver) => (
                  <span
                    key={ver}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 12px', borderRadius: '6px',
                      backgroundColor: 'rgba(0, 210, 255, 0.1)',
                      border: '1px solid rgba(0, 210, 255, 0.3)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px', fontWeight: 500, color: '#00d2ff',
                    }}
                  >
                    {ver}
                    <button
                      onClick={() => removeVersion(ver)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '16px', height: '16px', borderRadius: '4px',
                        backgroundColor: 'transparent', border: 'none',
                        color: '#bbc9cf', cursor: 'pointer', fontSize: '14px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ffb4ab'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#bbc9cf'}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fail Fast Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginTop: '24px',
          }}>
            <div>
              <span style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#dde3e7',
              }}>
                Fail Fast
              </span>
              <span style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                lineHeight: 1.5,
                color: '#bbc9cf',
              }}>
                Cancel remaining matrix jobs if one fails
              </span>
            </div>
            <input
              id="matrix-fail-fast-toggle"
              type="checkbox"
              className="toggle-switch"
              checked={config.fail_fast}
              onChange={() => updateConfig({ fail_fast: !config.fail_fast })}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
