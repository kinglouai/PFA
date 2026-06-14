/**
 * CheckSelector — CI checks displayed as glass-card tiles with Material Symbol icons.
 * Clicking a tile toggles its selection with a cyan glow state.
 * Styled to match the Stitch AI "Select CI Checks" template.
 */
import { useState, useEffect } from 'react'
import { CHECK_OPTIONS } from '../../utils/constants.js'

export default function CheckSelector({ detectedStack, value = [], onChange }) {
  // Pre-toggle checks based on detected stack
  useEffect(() => {
    if (value.length > 0) return // Don't override if already initialized

    const initial = []

    // Always add test
    initial.push('test')

    // Add lint if linter was detected
    if (detectedStack?.linter) {
      initial.push('lint')
    }

    // Add docker if Dockerfile was detected
    if (detectedStack?.has_docker) {
      initial.push('docker')
    }

    // Add cache by default
    initial.push('cache')

    onChange(initial)
  }, [detectedStack])

  const toggleCheck = (checkId) => {
    onChange(
      value.includes(checkId)
        ? value.filter((id) => id !== checkId)
        : [...value, checkId]
    )
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Responsive grid — 1 col mobile, 2 col md, 3 col lg, 4 col xl */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {CHECK_OPTIONS.map((check) => {
          const selected = value.includes(check.id)
          return (
            <label
              key={check.id}
              className={`glass-card ${selected ? 'selected' : ''}`}
              style={{
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: '100%',
                zIndex: 10,
              }}
              onClick={(e) => {
                e.preventDefault()
                toggleCheck(check.id)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div className="icon-container">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}
                  >
                    {check.materialIcon || 'check_circle'}
                  </span>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: '#dde3e7',
                    marginBottom: '4px',
                  }}>
                    {check.label}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: '#bbc9cf',
                  }}>
                    {check.description}
                  </p>
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
