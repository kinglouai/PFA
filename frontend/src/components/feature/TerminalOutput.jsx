/**
 * TerminalOutput — Stitch AI styled terminal / log viewer.
 * Renders step log lines in a dark terminal container matching the template.
 *
 * Props:
 *   - title: string (header label, e.g. "Run tests output")
 *   - lines: Array<{ text: string, type?: 'info'|'success'|'error'|'dim' }>
 */

export default function TerminalOutput({ title = 'Run output', lines = [] }) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: '#050809',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
    }}>
      {/* Terminal header */}
      <div style={{
        padding: '4px 16px',
        backgroundColor: '#1a2123',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#bbc9cf' }}>terminal</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
          letterSpacing: '0.02em', fontWeight: 500, color: '#bbc9cf',
        }}>
          {title}
        </span>
      </div>

      {/* Terminal body */}
      <div style={{
        padding: '16px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px', letterSpacing: '0.02em', fontWeight: 500,
        lineHeight: 1.8,
        maxHeight: '220px',
        overflowY: 'auto',
        color: 'rgba(187, 201, 207, 0.8)',
      }}>
        {lines.length === 0 ? (
          <div style={{ opacity: 0.5 }}>Waiting for output...</div>
        ) : (
          lines.map((line, idx) => {
            let color = 'rgba(187, 201, 207, 0.8)' // default
            let fontWeight = 500
            let opacity = 1

            if (line.type === 'success') { color = '#00d2ff'; fontWeight = 700 }
            else if (line.type === 'error') { color = '#f87171'; fontWeight = 700 }
            else if (line.type === 'info') { color = '#00d2ff' }
            else if (line.type === 'dim') { opacity = 0.5 }

            return (
              <div key={idx} style={{ display: 'flex' }}>
                <span style={{
                  width: '40px', textAlign: 'right', marginRight: '8px',
                  userSelect: 'none', opacity: 0.5,
                  color: '#859399',
                }}>
                  {idx + 1}
                </span>
                <span style={{ color, fontWeight, opacity }}>
                  {line.text}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
