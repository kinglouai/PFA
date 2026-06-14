/**
 * YamlPreview — YAML viewer/editor using CodeMirror 6.
 * Styled to match the Stitch AI "code-glass" template aesthetic.
 *
 * Props:
 *   - yaml: string (the YAML content)
 *   - editable: boolean (default false) — toggle edit mode
 *   - onChange: (newYaml: string) => void — called on content change (debounced 500ms)
 */
import CodeMirror from '@uiw/react-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/**
 * Stitch-themed syntax highlighting — distinct colors matching the template.
 */
const yamlHighlight = HighlightStyle.define([
  { tag: tags.propertyName,  color: '#a5e7ff' },  // Keys: primary cyan
  { tag: tags.string,        color: '#ffddb1' },  // Strings: tertiary warm
  { tag: tags.number,        color: '#ffba4a' },  // Numbers: tertiary-fixed-dim
  { tag: tags.bool,          color: '#edb1ff' },  // Booleans: secondary purple
  { tag: tags.null,          color: '#859399' },  // Null: outline muted
  { tag: tags.comment,       color: '#859399', fontStyle: 'italic' }, // Comments: outline
  { tag: tags.keyword,       color: '#edb1ff' },  // Keywords: secondary
  { tag: tags.operator,      color: '#859399' },  // Operators: outline
  { tag: tags.punctuation,   color: '#859399' },  // Punctuation: outline
  { tag: tags.definition(tags.propertyName), color: '#a5e7ff' }, // Property defs: primary
  { tag: tags.atom,          color: '#edb1ff' },  // Atoms: secondary
  { tag: tags.meta,          color: '#edb1ff' },  // Meta: secondary
])

/**
 * Stitch dark editor theme — matching the code-glass container.
 */
const cmTheme = EditorView.theme({
  '&': {
    backgroundColor: 'rgba(9, 15, 18, 0.8) !important',
    color: '#dde3e7 !important',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-gutters': {
    backgroundColor: 'rgba(9, 15, 18, 0.5) !important',
    color: '#859399',
    border: 'none',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 210, 255, 0.03)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  '.cm-cursor': {
    borderLeftColor: '#00d2ff',
  },
  '.cm-content': {
    caretColor: '#00d2ff',
    padding: '16px 0',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(0, 210, 255, 0.12) !important',
  },
  '.cm-line': {
    padding: '0 16px',
  },
})

export default function YamlPreview({ yaml: yamlContent, editable = false, onChange }) {
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef(null)

  const extensions = useMemo(
    () => [yaml(), cmTheme, syntaxHighlighting(yamlHighlight)],
    []
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea')
      textarea.value = yamlContent
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Debounced onChange handler for editable mode
  const handleEditorChange = useCallback(
    (value) => {
      if (!onChange) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(value)
      }, 500)
    },
    [onChange]
  )

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pipeline.yml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(9, 15, 18, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Editor Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: 'rgba(26, 33, 35, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: '#00d2ff' }}
          >
            description
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.02em',
            fontWeight: 500,
            color: '#dde3e7',
          }}>
            pipeline.yml
          </span>
          {/* Editable mode indicator */}
          {editable && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px', borderRadius: '9999px',
              fontSize: '10px', fontWeight: 500,
              backgroundColor: 'rgba(255, 178, 41, 0.1)',
              color: '#ffb229',
              border: '1px solid rgba(255, 178, 41, 0.2)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>edit</span>
              Editing
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            id="copy-yaml-btn"
            onClick={handleCopy}
            title="Copy code"
            style={{
              padding: '4px', borderRadius: '4px',
              backgroundColor: 'transparent', border: 'none',
              color: copied ? '#34d399' : '#bbc9cf',
              cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = '#00d2ff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = '#bbc9cf'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
          <button
            onClick={handleDownload}
            title="Download file"
            style={{
              padding: '4px', borderRadius: '4px',
              backgroundColor: 'transparent', border: 'none',
              color: '#bbc9cf',
              cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#00d2ff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#bbc9cf'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          </button>
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div style={{ flexGrow: 1, overflow: 'auto' }}>
        <CodeMirror
          value={yamlContent}
          readOnly={!editable}
          editable={editable}
          onChange={editable ? handleEditorChange : undefined}
          theme="dark"
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            indentOnInput: editable,
            bracketMatching: false,
            closeBrackets: false,
            autocompletion: false,
            history: editable,
          }}
          style={{
            fontSize: '13px',
          }}
        />
      </div>
    </div>
  )
}
