import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/** Full-page spinner shown while /auth/me is in flight */
function LoadingScreen() {
  return (
    <div style={ls.wrapper}>
      <div style={ls.spinner} />
      <p style={ls.text}>Loading…</p>
    </div>
  )
}

const ls = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    backgroundColor: 'var(--bg-cream)',
    gap: '14px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid var(--border-cream)',
    borderTopColor: 'var(--accent)',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    fontSize: '13px',
    color: 'var(--text-muted-cream)',
  },
}

/** Requires the user to be logged in; shows a spinner while checking. */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

/** Redirects already-logged-in users away from auth pages. */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

