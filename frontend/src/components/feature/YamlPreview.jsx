/**
 * YamlPreview — read-only YAML viewer using CodeMirror 6.
 * Uses @uiw/react-codemirror with YAML syntax highlighting.
 */
import CodeMirror from '@uiw/react-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { useMemo, useState } from 'react'
import { EditorView } from '@codemirror/view'

const cmTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-muted)',
    border: 'none',
    borderRight: '1px solid var(--color-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--color-bg-tertiary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-primary)',
  },
  '.cm-content': {
    caretColor: 'var(--color-primary)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(99, 102, 241, 0.2) !important',
  },
})

export default function YamlPreview({ yaml: yamlContent }) {
  const [copied, setCopied] = useState(false)

  const extensions = useMemo(() => [yaml()], [])

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
    <div className="w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-tertiary)]/50 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          {/* File icon */}
          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-xs font-medium text-[var(--color-text-secondary)] font-mono">
            .github/workflows/pipeline.yml
          </span>
        </div>
        <button
          id="copy-yaml-btn"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer bg-transparent border-none"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        extensions={[yaml(), cmTheme]}
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
