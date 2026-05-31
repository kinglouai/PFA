/**
 * Navbar — top navigation bar.
 * Shows project logo and GitHub auth state (connect/avatar+logout).
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loadingUser, getAuthUrl, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGitHubClick = () => {
    if (isAuthenticated) {
      setShowDropdown((prev) => !prev)
    } else {
      // Redirect to GitHub OAuth flow
      window.location.href = getAuthUrl()
    }
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg-primary)]/80">
      <div className="w-full px-8" style={{ maxWidth: '1280px', margin: '0 auto', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo / Title */}
        <button
          id="navbar-logo"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group cursor-pointer bg-transparent border-none"
        >
          <img
            src="/logo.png"
            alt="PipelineGen Logo"
            className="h-11 w-auto object-contain"
          />
          <span className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
            Pipeline<span className="text-indigo-400">Gen</span>
          </span>
        </button>

        {/* GitHub Auth Button / Avatar */}
        <div className="relative" ref={dropdownRef}>
          {isAuthenticated && user ? (
            <>
              <button
                id="navbar-github-btn"
                onClick={handleGitHubClick}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer bg-transparent"
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30"
                />
                <span className="text-sm text-[var(--color-text-primary)] font-medium hidden sm:inline">
                  {user.login}
                </span>
                <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl shadow-black/30 animate-fade-in z-50 overflow-hidden" style={{ minWidth: '300px' }}>
                  {/* User info header */}
                  <div className="px-6 py-6 border-b border-[var(--color-border)] flex flex-col items-center gap-3 text-center">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-14 h-14 rounded-full ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-1">Signed in as</p>
                      <p className="text-base font-semibold text-[var(--color-text-primary)]">{user.login || user.name}</p>
                    </div>
                  </div>
                  {/* Sign out */}
                  <button
                    id="navbar-logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              id="navbar-github-btn"
              onClick={handleGitHubClick}
              disabled={loadingUser}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer bg-transparent whitespace-nowrap"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connect to GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
