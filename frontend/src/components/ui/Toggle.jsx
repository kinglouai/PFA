/**
 * Toggle — on/off toggle switch for optional checks.
 * No business logic inside — pure UI component.
 */
export default function Toggle({ checked, onChange, id, disabled = false }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer border-none
        ${checked ? 'bg-indigo-500' : 'bg-[var(--color-bg-tertiary)]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}
