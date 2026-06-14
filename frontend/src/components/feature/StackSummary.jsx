/**
 * StackSummary — displays detected stack fields with direct-click editing.
 * Click on any value to open its dropdown/multi-select inline.
 * When multiple languages are selected, shows a version dropdown per language.
 * Styled to match the Stitch AI template aesthetic.
 */
import { useState } from 'react'
import Tag from '../ui/Tag.jsx'
import { STACK_FIELD_OPTIONS } from '../../utils/constants.js'

const STACK_FIELDS = [
  { key: 'language', label: 'Language', icon: 'code', multi: true },
  { key: 'version', label: 'Version', icon: 'tag' },
  { key: 'framework', label: 'Framework', icon: 'extension', multi: true },
  { key: 'test_framework', label: 'Test Framework', icon: 'science', multi: true },
  { key: 'linter', label: 'Linter', icon: 'rule' },
  { key: 'package_manager', label: 'Package Manager', icon: 'inventory_2' },
]

function getFieldOptions(fieldKey, currentLanguage) {
  const opts = STACK_FIELD_OPTIONS[fieldKey]
  if (!opts) return []
  if (Array.isArray(opts)) return opts
  
  const langs = Array.isArray(currentLanguage) ? currentLanguage : [currentLanguage]
  if (langs.length === 0 || !langs[0]) {
    return Object.values(opts).flat().filter((v, i, a) => a.indexOf(v) === i)
  }
  
  const combined = []
  langs.forEach(lang => {
    if (opts[lang]) combined.push(...opts[lang])
  })
  
  return [...new Set(combined)]
}

export default function StackSummary({ stack, onConfirm, onBack }) {
  const [editableStack, setEditableStack] = useState(() => {
    const langs = Array.isArray(stack.language) ? stack.language : stack.language ? [stack.language] : []
    const versions = {}
    langs.forEach((lang) => { versions[lang] = stack.version || '' })
    return { ...stack, _versions: versions }
  })
  const [editingField, setEditingField] = useState(null)

  const toggleEdit = (key) => setEditingField((prev) => (prev === key ? null : key))

  const handleSelect = (key, value) => {
    if (value === 'none') value = null
    setEditableStack((prev) => ({ ...prev, [key]: value }))
    setEditingField(null)
  }

  const handleMultiToggle = (key, value) => {
    setEditableStack((prev) => {
      if (value === 'none') {
        if (key === 'language') return { ...prev, [key]: null, _versions: {} }
        return { ...prev, [key]: null }
      }
      const current = Array.isArray(prev[key]) ? prev[key] : prev[key] ? [prev[key]] : []
      const currentNoNone = current.filter((v) => v !== 'none')
      const next = currentNoNone.includes(value) ? currentNoNone.filter((v) => v !== value) : [...currentNoNone, value]
      if (key === 'language') {
        const newVersions = { ...prev._versions }
        next.forEach((lang) => { if (!newVersions[lang]) newVersions[lang] = '' })
        Object.keys(newVersions).forEach((lang) => { if (!next.includes(lang)) delete newVersions[lang] })
        return { ...prev, [key]: next.length === 1 ? next[0] : next.length > 0 ? next : null, _versions: newVersions }
      }
      return { ...prev, [key]: next.length === 1 ? next[0] : next.length > 0 ? next : null }
    })
  }

  const handleVersionChange = (lang, version) => {
    setEditableStack((prev) => ({
      ...prev,
      _versions: { ...prev._versions, [lang]: version },
      version: version,
    }))
  }

  const currentLanguages = Array.isArray(editableStack.language)
    ? editableStack.language
    : editableStack.language ? [editableStack.language] : []

  const handleConfirm = () => {
    const result = { ...editableStack }
    result.versions_map = result._versions
    delete result._versions
    if (currentLanguages.length === 1) {
      result.version = editableStack._versions[currentLanguages[0]] || editableStack.version
    }
    onConfirm(result)
  }

  return (
    <div className="w-full flex justify-center py-6 animate-fade-in">
      <div style={{ width: '100%', maxWidth: '56rem' }}>

        {/* Glass Panel Card */}
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>

          {/* Inner glow overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to bottom right, rgba(255,255,255,0.05), transparent)',
            pointerEvents: 'none', borderRadius: '12px',
          }} />

          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '24px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
          }}>
            <div style={{
              padding: '8px', backgroundColor: 'rgba(0, 210, 255, 0.1)',
              borderRadius: '8px', color: '#00d2ff',
              boxShadow: '0 0 20px rgba(0, 210, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>search</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: 'Geist, Inter, sans-serif', fontSize: '32px',
                fontWeight: 600, lineHeight: 1.2, color: '#dde3e7',
              }}>
                Detected Stack
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px',
                lineHeight: 1.5, color: '#bbc9cf', marginTop: '4px',
              }}>
                We analyzed your repository to determine the optimal CI/CD pipeline configuration.
              </p>
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '32px' }}>

            {/* Left Column — Language */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Language selector */}
              <div>
                <h3 style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600,
                  color: '#dde3e7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#00d2ff' }}>code</span>
                  Language
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getFieldOptions('language', editableStack.language).map((opt) => {
                    const currentVal = Array.isArray(editableStack.language) ? editableStack.language : editableStack.language ? [editableStack.language] : []
                    const selected = currentVal.includes(opt)
                    return (
                      <button
                        key={opt}
                        onClick={() => handleMultiToggle('language', opt)}
                        style={{
                          padding: '8px 16px', borderRadius: '8px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                          ...(selected
                            ? {
                                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                                border: '1px solid #00d2ff',
                                color: '#00d2ff',
                                boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
                              }
                            : {
                                backgroundColor: '#1a2123',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#bbc9cf',
                              }
                          ),
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Version selectors */}
              {currentLanguages.length > 0 && currentLanguages.map((lang) => {
                const versionOptions = STACK_FIELD_OPTIONS.version[lang] || []
                return (
                  <div key={lang}>
                    <label style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600,
                      color: '#dde3e7', display: 'block', marginBottom: '8px',
                    }}>
                      {lang} Version
                    </label>
                    <div style={{ position: 'relative', maxWidth: '280px' }}>
                      <select
                        value={editableStack._versions[lang] || ''}
                        onChange={(e) => handleVersionChange(lang, e.target.value)}
                        style={{
                          width: '100%', appearance: 'none',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px', padding: '16px 48px 16px 16px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                          color: '#dde3e7', outline: 'none', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#00d2ff'; e.target.style.boxShadow = '0 0 0 4px rgba(0,210,255,0.1)' }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                      >
                        <option value="" style={{ backgroundColor: '#242b2e', color: '#dde3e7' }}>auto (Detected)</option>
                        {versionOptions.map((v) => (
                          <option key={v} value={v} style={{ backgroundColor: '#242b2e', color: '#dde3e7' }}>{v}</option>
                        ))}
                      </select>
                      <div style={{
                        position: 'absolute', top: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', padding: '0 16px',
                        pointerEvents: 'none', color: '#bbc9cf',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column — Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{
                fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600,
                color: '#dde3e7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#edb1ff' }}>extension</span>
                Configuration
              </h3>

              {STACK_FIELDS.filter(f => !['language', 'version'].includes(f.key)).map(({ key, label, icon, multi }) => {
                const isEditing = editingField === key
                const options = getFieldOptions(key, editableStack.language)
                const value = editableStack[key]

                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleEdit(key)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px', borderRadius: '8px',
                        backgroundColor: 'rgba(26, 33, 35, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer', transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 33, 35, 0.5)'}
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: 1.5, color: '#bbc9cf' }}>
                        {label}
                      </span>
                      {value && (!Array.isArray(value) || value.length > 0) ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {(Array.isArray(value) ? value : [value]).map((v) => (
                            <span key={v} style={{
                              fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                              padding: '4px 8px', borderRadius: '2px',
                              color: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.1)',
                              border: '1px solid rgba(0, 210, 255, 0.3)',
                            }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                          padding: '4px 8px', borderRadius: '2px',
                          color: '#3c494e', backgroundColor: '#1a2123',
                        }}>
                          Not detected
                        </span>
                      )}
                    </button>

                    {/* Inline editing dropdown */}
                    {isEditing && options.length > 0 && (
                      <div className="animate-fade-in" style={{
                        padding: '12px', margin: '4px 0',
                        backgroundColor: '#1a2123', borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex', flexWrap: 'wrap', gap: '8px',
                      }}>
                        {options.map((opt) => {
                          const currentVal = Array.isArray(editableStack[key]) ? editableStack[key] : editableStack[key] ? [editableStack[key]] : []
                          const selected = multi ? currentVal.includes(opt) : editableStack[key] === opt || (opt === 'none' && !editableStack[key])
                          return (
                            <button
                              key={opt}
                              onClick={(e) => { e.stopPropagation(); multi ? handleMultiToggle(key, opt) : handleSelect(key, opt) }}
                              style={{
                                padding: '8px 16px', borderRadius: '8px',
                                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.2s',
                                ...(selected
                                  ? {
                                      backgroundColor: 'rgba(0, 210, 255, 0.1)',
                                      border: '1px solid #00d2ff',
                                      color: '#00d2ff',
                                    }
                                  : {
                                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      color: '#bbc9cf',
                                    }
                                ),
                              }}
                            >
                              {opt === 'none' ? '— none —' : opt}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Dockerfile row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px', borderRadius: '8px',
                backgroundColor: 'rgba(26, 33, 35, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>Dockerfile</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500,
                  padding: '4px 8px', borderRadius: '2px',
                  ...(editableStack.has_docker
                    ? { color: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.3)' }
                    : { color: '#ffb4ab', backgroundColor: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.3)' }
                  ),
                }}>
                  {editableStack.has_docker ? 'Detected' : 'Not found'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0', padding: '24px 32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            {onBack && (
              <button
                id="back-stack-btn"
                onClick={onBack}
                style={{
                  padding: '12px 24px', borderRadius: '8px',
                  border: '1px solid rgba(0, 210, 255, 0.3)', backgroundColor: 'transparent',
                  color: '#00d2ff', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 210, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                Back
              </button>
            )}
            <button
              id="confirm-stack-btn"
              onClick={handleConfirm}
              className="gradient-btn"
              style={{
                padding: '12px 24px', borderRadius: '8px', border: 'none',
                color: '#003543', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 20px rgba(0, 210, 255, 0.3)',
              }}
            >
              Looks good
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}