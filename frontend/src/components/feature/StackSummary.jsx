/**
 * StackSummary — displays detected stack fields with direct-click editing.
 * Click on any value to open its dropdown/multi-select inline.
 * When multiple languages are selected, shows a version dropdown per language.
 */
import { useState } from 'react'
import Tag from '../ui/Tag.jsx'
import Button from '../ui/Button.jsx'
import { STACK_FIELD_OPTIONS } from '../../utils/constants.js'

const STACK_FIELDS = [
  { key: 'language', label: 'Language', icon: '💻', multi: true },
  { key: 'version', label: 'Version', icon: '📋' },
  { key: 'framework', label: 'Framework', icon: '🏗️' },
  { key: 'test_framework', label: 'Test Framework', icon: '🧪' },
  { key: 'linter', label: 'Linter', icon: '🔍' },
  { key: 'package_manager', label: 'Package Manager', icon: '📦' },
]

function getFieldOptions(fieldKey, currentLanguage) {
  const opts = STACK_FIELD_OPTIONS[fieldKey]
  if (!opts) return []
  if (Array.isArray(opts)) return opts
  const lang = Array.isArray(currentLanguage) ? currentLanguage[0] : currentLanguage
  return opts[lang] || Object.values(opts).flat().filter((v, i, a) => a.indexOf(v) === i)
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
      const current = Array.isArray(prev[key]) ? prev[key] : prev[key] ? [prev[key]] : []
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
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
    delete result._versions
    if (currentLanguages.length === 1) {
      result.version = editableStack._versions[currentLanguages[0]] || editableStack.version
    }
    onConfirm(result)
  }

  return (
    <div className="w-full flex justify-center py-10 animate-fade-in">
      <div style={{ width: '100%', maxWidth: '680px' }}>

        {/* Card */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">

          {/* Card header */}
          <div style={{
            padding: '28px 32px 24px',
            borderBottom: '1px solid var(--color-border)',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              fontSize: '24px', marginBottom: '14px'
            }}>
              🔎
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Detected Stack
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Review and adjust your detected technologies before generating the pipeline.
            </p>
          </div>

          {/* Field rows */}
          <div style={{ padding: '8px 0' }}>
            {STACK_FIELDS.map(({ key, label, icon, multi }) => {
              if (key === 'version') return null
              const options = getFieldOptions(key, editableStack.language)
              const isEditing = editingField === key

              return (
                <div key={key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => toggleEdit(key)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    className="hover:bg-[var(--color-bg-tertiary)]/40 transition-colors"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '20px' }}>{icon}</span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {editableStack[key] ? (
                          key === 'language' ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {(Array.isArray(editableStack[key]) ? editableStack[key] : [editableStack[key]]).map((lang) => (
                                <Tag key={lang} label={lang} colorKey={lang} />
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {editableStack[key]}
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>not detected</span>
                        )}
                        <svg
                          style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)', flexShrink: 0, transform: isEditing ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isEditing && (
                    <div style={{ padding: '0 32px 20px' }} className="animate-fade-in">
                      <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center'
                      }}>
                        {options.map((opt) => {
                          const currentVal = Array.isArray(editableStack[key]) ? editableStack[key] : editableStack[key] ? [editableStack[key]] : []
                          const selected = multi ? currentVal.includes(opt) : editableStack[key] === opt || (opt === 'none' && !editableStack[key])
                          return (
                            <button
                              key={opt}
                              onClick={(e) => { e.stopPropagation(); multi ? handleMultiToggle(key, opt) : handleSelect(key, opt) }}
                              style={{
                                padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                                cursor: 'pointer', border: '1px solid',
                                background: selected ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-tertiary)',
                                color: selected ? '#a5b4fc' : 'var(--color-text-muted)',
                                borderColor: selected ? 'rgba(99,102,241,0.4)' : 'var(--color-border)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {opt === 'none' ? '— none —' : opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {key === 'language' && currentLanguages.length > 0 && (
                    <div style={{ padding: '0 32px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentLanguages.map((lang) => {
                        const versionOptions = STACK_FIELD_OPTIONS.version[lang] || []
                        return (
                          <div key={lang} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px', borderRadius: '10px',
                            background: 'rgba(30,41,59,0.5)',
                            border: '1px solid var(--color-border)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '18px' }}>📋</span>
                              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{lang} version</span>
                            </div>
                            <select
                              value={editableStack._versions[lang] || ''}
                              onChange={(e) => handleVersionChange(lang, e.target.value)}
                              style={{
                                padding: '8px 14px', borderRadius: '8px', fontSize: '14px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                outline: 'none', cursor: 'pointer'
                              }}
                            >
                              <option value="">auto</option>
                              {versionOptions.map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Dockerfile row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '20px' }}>🐳</span>
                <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Dockerfile</span>
              </div>
              <span style={{
                fontSize: '14px', fontWeight: 600,
                color: editableStack.has_docker ? '#34d399' : 'var(--color-text-muted)',
                padding: '4px 12px', borderRadius: '6px',
                background: editableStack.has_docker ? 'rgba(52,211,153,0.1)' : 'transparent',
              }}>
                {editableStack.has_docker ? '✓ Detected' : 'Not found'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {onBack && (
            <Button
              id="back-stack-btn"
              variant="ghost"
              size="xl"
              onClick={onBack}
              style={{ minWidth: '180px' }}
            >
              ← Back
            </Button>
          )}
          <Button
            id="confirm-stack-btn"
            onClick={handleConfirm}
            size="xl"
            style={{ minWidth: '220px' }}
          >
            Looks good →
          </Button>
        </div>
      </div>
    </div>
  )
}