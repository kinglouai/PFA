/**
 * YamlPreview — read-only YAML viewer using CodeMirror 6.
 * Custom dark theme with distinct syntax highlighting colors
 * for keys, values, strings, and comments.
 */
import CodeMirror from '@uiw/react-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { useMemo, useState } from 'react'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/**
 * Custom syntax highlighting — distinct colors for each token type.
 */
const yamlHighlight = HighlightStyle.define([
  { tag: tags.propertyName,  color: '#7dd3fc' },  // Keys: sky blue
  { tag: tags.string,        color: '#a5f3ab' },  // Strings: green
  { tag: tags.number,        color: '#fbbf24' },  // Numbers: amber
  { tag: tags.bool,          color: '#c4b5fd' },  // Booleans: purple
  { tag: tags.null,          color: '#94a3b8' },  // Null: muted gray
  { tag: tags.comment,       color: '#6b7280', fontStyle: 'italic' }, // Comments: gray italic
  { tag: tags.keyword,       color: '#f472b6' },  // Keywords: pink
  { tag: tags.operator,      color: '#94a3b8' },  // Operators: gray
  { tag: tags.punctuation,   color: '#94a3b8' },  // Punctuation: gray
  { tag: tags.definition(tags.propertyName), color: '#7dd3fc' }, // Property defs: sky blue
  { tag: tags.atom,          color: '#c4b5fd' },  // Atoms: purple
  { tag: tags.meta,          color: '#f472b6' },  // Meta: pink
])

/**
 * Dark editor theme — backgrounds matching the app's dark palette.
 */
const cmTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0f172a !important',
    color: '#e2e8f0 !important',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  '.cm-gutters': {
    backgroundColor: '#0f172a !important',
    color: '#475569',
    border: 'none',
    borderRight: '1px solid #1e293b',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1e293b',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  '.cm-cursor': {
    borderLeftColor: '#6366f1',
  },
  '.cm-content': {
    caretColor: '#6366f1',
    padding: '12px 0',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(99, 102, 241, 0.2) !important',
  },
  '.cm-line': {
    padding: '0 12px',
  },
})

export default function YamlPreview({ yaml: yamlContent }) {
  const [copied, setCopied] = useState(false)

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

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)]" style={{ backgroundColor: '#0f172a' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--color-border)]" style={{ backgroundColor: '#1e293b' }}>
        <div className="flex items-center gap-3">
          {/* File icon */}
          <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}style={{  marginLeft: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-sm font-medium text-[var(--color-text-secondary)] font-mono">
            .github/workflows/pipeline.yml
          </span>
        </div>
        <button
          id="copy-yaml-btn"
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer bg-transparent border-none"
        style={{marginRight: '20px' }}>
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* CodeMirror Editor */}
      <CodeMirror
        value={yamlContent}
        readOnly={true}
        editable={false}
        theme="dark"
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          indentOnInput: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          history: false,
        }}
        style={{
          fontSize: '13px',
        }}
      />
    </div>
  )
}
