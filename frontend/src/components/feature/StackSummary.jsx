/**
 * StackSummary — displays detected stack fields with confirm/edit.
 * Each field has an inline edit capability.
 */
import { useState } from 'react'
import Tag from '../ui/Tag.jsx'
import Button from '../ui/Button.jsx'

const STACK_FIELDS = [
  { key: 'language', label: 'Language', icon: '💻' },
  { key: 'version', label: 'Version', icon: '📋' },
  { key: 'framework', label: 'Framework', icon: '🏗️' },
  { key: 'test_framework', label: 'Test Framework', icon: '🧪' },
  { key: 'linter', label: 'Linter', icon: '🔍' },
  { key: 'package_manager', label: 'Package Manager', icon: '📦' },
]

export default function StackSummary({ stack, onConfirm }) {
  const [editableStack, setEditableStack] = useState({ ...stack })
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (key) => {
    setEditingField(key)
    setEditValue(editableStack[key] || '')
  }

  const saveEdit = (key) => {
    setEditableStack((prev) => ({ ...prev, [key]: editValue || null }))
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleKeyDown = (e, key) => {
    if (e.key === 'Enter') saveEdit(key)
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">🔎</span>
          Detected Stack
        </h3>

        <div className="space-y-3">
          {STACK_FIELDS.map(({ key, label, icon }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[var(--color-bg-tertiary)]/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{icon}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
              </div>

              {editingField === key ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    className="px-3 py-1 rounded-md bg-[var(--color-bg-secondary)] border border-indigo-500/50 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-32"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(key)}
                    className="text-green-400 hover:text-green-300 text-xs cursor-pointer bg-transparent border-none"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-xs cursor-pointer bg-transparent border-none"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {editableStack[key] ? (
                    key === 'language' ? (
                      <Tag label={editableStack[key]} colorKey={editableStack[key]} />
                    ) : (
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {editableStack[key]}
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-[var(--color-text-muted)] italic">not detected</span>
                  )}
                  <button
                    onClick={() => startEdit(key)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400 hover:text-indigo-300 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Docker row (boolean) */}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm">🐳</span>
              <span className="text-sm text-[var(--color-text-secondary)]">Dockerfile</span>
            </div>
            <span className={`text-sm font-medium ${editableStack.has_docker ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
              {editableStack.has_docker ? 'Detected' : 'Not found'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <Button
            id="confirm-stack-btn"
            onClick={() => onConfirm(editableStack)}
            className="w-full"
          >
            Looks good →
          </Button>
        </div>
      </div>
    </div>
  )
}
