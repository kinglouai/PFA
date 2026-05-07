/**
 * YamlPreview — read-only YAML viewer.
 * Placeholder for CodeMirror 6 integration in Week 4.
 */
export default function YamlPreview({ yaml }) {
  return (
    <div className="w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-tertiary)]/50 border-b border-[var(--color-border)]">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          .github/workflows/ci.yml
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(yaml)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-sm text-[var(--color-text-primary)] overflow-x-auto font-mono leading-relaxed whitespace-pre">
        {yaml}
      </pre>
    </div>
  )
}
