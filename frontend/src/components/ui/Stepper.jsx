/**
 * Stepper — visual step indicator for the wizard.
 * Shows dots with labels, active step highlighted with glowing cyan.
 * Matches the Stitch AI template aesthetic.
 */
export default function Stepper({ steps, currentStep }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '56rem',
      margin: '0 auto',
      padding: '0 16px',
      position: 'relative',
    }}>
      {/* Background track line */}
      <div style={{
        position: 'absolute',
        left: '16px',
        right: '16px',
        top: '16px',
        height: '2px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 0,
      }} />

      {/* Active progress line */}
      {currentStep > 1 && (
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '16px',
          height: '2px',
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          background: '#00d2ff',
          boxShadow: '0 0 10px rgba(0, 210, 255, 0.5)',
          zIndex: 1,
          transition: 'width 0.5s ease',
        }} />
      )}

      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 2,
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              ...(isCompleted || isActive
                ? {
                    backgroundColor: '#00d2ff',
                    boxShadow: '0 0 15px rgba(0, 210, 255, 0.6)',
                  }
                : {
                    backgroundColor: '#1a2123',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }
              ),
            }}>
              {isCompleted ? (
                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="#003543" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div style={{
                  width: isActive ? '10px' : '8px',
                  height: isActive ? '10px' : '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#003543' : 'rgba(255, 255, 255, 0.2)',
                }} />
              )}
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              letterSpacing: '0.02em',
              fontWeight: 500,
              marginTop: '4px',
              whiteSpace: 'nowrap',
              color: isActive ? '#dde3e7' : isCompleted ? '#00d2ff' : '#bbc9cf',
              transition: 'color 0.3s ease',
            }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
