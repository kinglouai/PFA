/**
 * Tag — colored pill for labels (language, framework…).
 * No business logic inside — pure UI component.
 */
import { LANGUAGE_COLORS } from '../../utils/constants.js'

export default function Tag({ label, colorKey, className = '' }) {
  const colors = LANGUAGE_COLORS[colorKey] || LANGUAGE_COLORS.unknown

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {label}
    </span>
  )
}
