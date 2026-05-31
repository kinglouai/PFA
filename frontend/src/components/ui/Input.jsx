/**
 * Input — generic reusable input component.
 * No business logic inside — pure UI component.
 */
export default function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  id,
  className = '',
  error = false,
  disabled = false,
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-5 py-4 rounded-xl bg-[var(--color-bg-secondary)] border text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 text-base
        ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    />
  )
}
