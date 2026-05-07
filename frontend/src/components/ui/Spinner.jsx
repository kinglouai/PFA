/**
 * Spinner — loading spinner component.
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-[var(--color-bg-tertiary)] border-t-indigo-500 rounded-full`}
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
    </div>
  )
}
