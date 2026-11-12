import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute, GuestRoute } from './components/AuthRoutes.jsx'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import ReceiptsPage from './pages/ReceiptsPage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ReceiptDetailPage from './pages/ReceiptDetailPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'

// Auth pages do NOT show the BottomNav.
const AUTH_PATHS = ['/signin', '/signup']

function AppContent() {
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  return (
    <div className="app-container theme-cream">
      <main className="page-scroll-area">
        <Routes>
          {/* ── Guest-only (redirect to / if already logged in) ── */}
          <Route path="/signin" element={<GuestRoute><SignInPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />

          {/* ── Protected routes ── */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/receipts" element={<ProtectedRoute><ReceiptsPage /></ProtectedRoute>} />
          <Route path="/receipts/:id" element={<ProtectedRoute><ReceiptDetailPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* BottomNav only on logged-in pages */}
      {!isAuthPage && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
