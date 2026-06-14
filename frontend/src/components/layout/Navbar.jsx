/**
 * Navbar — top navigation bar.
 * Shows project logo and GitHub auth state (connect/avatar+logout).
 * Styled to match the Stitch AI template aesthetic.
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
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 50,
      backgroundColor: 'rgba(14, 20, 23, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 0 20px rgba(0, 210, 255, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>

        {/* Logo / Title */}
        <button
          id="navbar-logo"
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#47d6ff', fontSize: '30px' }}>route</span>
          <span style={{
            fontFamily: 'Geist, Inter, system-ui, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#dde3e7',
          }}>
            PipelineGen
          </span>
        </button>

        {/* GitHub Auth Button / Avatar */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          {isAuthenticated && user ? (
            <>
              <button
                id="navbar-github-btn"
                onClick={handleGitHubClick}
                className="glass-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                  color: '#dde3e7',
                }}>
                  {user.login}
                </span>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="glass-panel animate-fade-in" style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '12px',
                  borderRadius: '12px',
                  minWidth: '280px',
                  zIndex: 50,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }}>
                  {/* User info header */}
                  <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                  }}>
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(0, 210, 255, 0.3)' }}
                    />
                    <div>
                      <p style={{ fontSize: '12px', color: '#bbc9cf', marginBottom: '4px' }}>Signed in as</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#dde3e7' }}>{user.login || user.name}</p>
                    </div>
                  </div>
                  {/* Sign out */}
                  <button
                    id="navbar-logout-btn"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '20px 24px',
                      fontSize: '14px',
                      color: '#ffb4ab',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(147, 0, 10, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              className="glass-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                borderRadius: '9999px',
                cursor: loadingUser ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: '#dde3e7',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                whiteSpace: 'nowrap',
                opacity: loadingUser ? 0.5 : 1,
              }}
            >
              <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Connect GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
